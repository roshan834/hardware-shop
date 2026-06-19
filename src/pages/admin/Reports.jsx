import { useEffect, useState } from "react"
import Sidebar from "../../components/Sidebar"
import { supabase } from "../../config/supabase"
import "../../styles/reports.css"

const Reports = () => {
  const [todaySales, setTodaySales] = useState(0)
  const [monthlySales, setMonthlySales] = useState(0)
  const [totalBills, setTotalBills] = useState(0)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [lowStock, setLowStock] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Pagination state for Low Stock
  const [lowStockPage, setLowStockPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    await Promise.all([
      fetchTodaySales(),
      fetchMonthlySales(),
      fetchPendingAmount(),
      fetchLowStockProducts(),
      fetchTopProducts()
    ])
    setLoading(false)
  }

  const fetchTodaySales = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from("bills")
      .select("grand_total")
      .gte("created_at", today.toISOString())

    const total =
      data?.reduce(
        (sum, bill) =>
          sum + Number(bill.grand_total),
        0
      ) || 0

    setTodaySales(total)
  }

  const fetchMonthlySales = async () => {
    const now = new Date()

    const startMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )

    const { data } = await supabase
      .from("bills")
      .select("grand_total")
      .gte(
        "created_at",
        startMonth.toISOString()
      )

    const total =
      data?.reduce(
        (sum, bill) =>
          sum + Number(bill.grand_total),
        0
      ) || 0

    setMonthlySales(total)
    setTotalBills(data?.length || 0)
  }

  const fetchPendingAmount = async () => {
    const { data } = await supabase
      .from("bills")
      .select("pending_amount")

    const total =
      data?.reduce(
        (sum, bill) =>
          sum +
          Number(
            bill.pending_amount || 0
          ),
        0
      ) || 0

    setPendingAmount(total)
  }

  const fetchLowStockProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .lte("quantity", 10)
      .order("quantity")

    setLowStock(data || [])
    setLowStockPage(1)
  }

  const fetchTopProducts = async () => {
    const { data } = await supabase
      .from("bill_items")
      .select(`qty,
        products(
          product_name
        )
      `)

    const map = {}

    data?.forEach((item) => {
      const name =
        item.products?.product_name

      if (!name) return

      map[name] =
        (map[name] || 0) +
        item.qty
    })

    const sorted = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    setTopProducts(sorted)
  }

  // Pagination logic for Low Stock
  const totalPages = Math.ceil(lowStock.length / itemsPerPage)
  const startIndex = (lowStockPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLowStock = lowStock.slice(startIndex, endIndex)

  // Generate pagination buttons
  const getPaginationButtons = () => {
    const buttons = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i)
      }
    } else {
      buttons.push(1)
      buttons.push(2)

      if (lowStockPage > 3) {
        buttons.push("...")
      }

      if (lowStockPage > 2 && lowStockPage < totalPages - 1) {
        buttons.push(lowStockPage)
      }

      if (lowStockPage < totalPages - 2) {
        buttons.push("...")
      }

      buttons.push(totalPages - 1)
      buttons.push(totalPages)
    }

    return buttons
  }

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="content">
          <div className="loader">Loading Reports...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <div className="page-header">
          <h1>📊 Reports Dashboard</h1>
        </div>

        {/* STAT CARDS - BOX STYLE */}
        <div className="report-cards">
          <div className="report-card">
            <div className="report-card-content">
              <div className="report-icon">📈</div>
              <div className="report-info">
                <h4>Today's Sales</h4>
                <h2>₹{todaySales.toFixed(2)}</h2>
              </div>
            </div>
          </div>

          <div className="report-card">
            <div className="report-card-content">
              <div className="report-icon">💰</div>
              <div className="report-info">
                <h4>Monthly Sales</h4>
                <h2>₹{monthlySales.toFixed(2)}</h2>
              </div>
            </div>
          </div>

          <div className="report-card">
            <div className="report-card-content">
              <div className="report-icon">📋</div>
              <div className="report-info">
                <h4>Total Bills</h4>
                <h2>{totalBills}</h2>
              </div>
            </div>
          </div>

          <div className="report-card">
            <div className="report-card-content">
              <div className="report-icon">⏳</div>
              <div className="report-info">
                <h4>Pending Collection</h4>
                <h2>₹{pendingAmount.toFixed(2)}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* REPORTS GRID */}
        <div className="report-grid">
          {/* TOP PRODUCTS */}
          <div className="card report-table-card">
            <div className="card-header">
              <h2>🔥 Top Selling Products</h2>
            </div>

            <div className="table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sold Qty</th>
                  </tr>
                </thead>

                <tbody>
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="no-data">
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    topProducts.map(
                      ([name, qty]) => (
                        <tr key={name}>
                          <td className="product-name">{name}</td>
                          <td className="product-qty">
                            <span className="qty-badge">{qty}</span>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="mobile-report-list">
              {topProducts.length === 0 ? (
                <div className="no-data-mobile">No Data Available</div>
              ) : (
                topProducts.map(([name, qty]) => (
                  <div key={name} className="mobile-report-item">
                    <h4>{name}</h4>
                    <div className="mobile-report-row">
                      <span className="label">Sold Qty:</span>
                      <span className="qty-badge">{qty}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LOW STOCK PRODUCTS WITH SCROLL & PAGINATION */}
          <div className="card report-table-card low-stock-card">
            <div className="card-header">
              <h2>⚠️ Low Stock Products</h2>
              <span className="stock-count">{lowStock.length} items</span>
            </div>

            {/* SCROLLABLE TABLE WRAPPER */}
            <div className="low-stock-scroll-wrapper">
              <div className="table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lowStock.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="no-data">
                          No Low Stock Products
                        </td>
                      </tr>
                    ) : (
                      paginatedLowStock.map((item) => (
                        <tr key={item.id}>
                          <td className="product-name">{item.product_name}</td>
                          <td className="product-stock">
                            <span className="stock-badge critical">
                              {item.quantity}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION FOR DESKTOP */}
            {lowStock.length > 0 && (
              <div className="pagination low-stock-pagination desktop-pagination">
                <button
                  disabled={lowStockPage === 1}
                  onClick={() => setLowStockPage(lowStockPage - 1)}
                  className="pagination-btn"
                  aria-label="Previous page"
                >
                  ← Prev
                </button>

                {getPaginationButtons().map((page, idx) => (
                  <button
                    key={idx}
                    disabled={page === "..."}
                    onClick={() => typeof page === "number" && setLowStockPage(page)}
                    className={`pagination-btn ${
                      page === lowStockPage ? "active-page" : ""
                    } ${page === "..." ? "ellipsis-btn" : ""}`}
                    aria-label={`Page ${page}`}
                    aria-current={page === lowStockPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={lowStockPage === totalPages}
                  onClick={() => setLowStockPage(lowStockPage + 1)}
                  className="pagination-btn"
                  aria-label="Next page"
                >
                  Next →
                </button>
              </div>
            )}

            {/* MOBILE CARD VIEW WITH SCROLL */}
            <div className="mobile-report-list low-stock-mobile-list">
              {lowStock.length === 0 ? (
                <div className="no-data-mobile">No Low Stock Products</div>
              ) : (
                paginatedLowStock.map((item) => (
                  <div key={item.id} className="mobile-report-item">
                    <h4>{item.product_name}</h4>
                    <div className="mobile-report-row">
                      <span className="label">Stock:</span>
                      <span className="stock-badge critical">
                        {item.quantity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* MOBILE PAGINATION */}
            {lowStock.length > 0 && (
              <div className="pagination mobile-pagination low-stock-pagination">
                <button
                  disabled={lowStockPage === 1}
                  onClick={() => setLowStockPage(lowStockPage - 1)}
                  className="pagination-btn"
                  title="Previous page"
                  aria-label="Previous page"
                >
                  ←
                </button>

                <span className="page-info">
                  {lowStockPage} / {totalPages}
                </span>

                <button
                  disabled={lowStockPage === totalPages}
                  onClick={() => setLowStockPage(lowStockPage + 1)}
                  className="pagination-btn"
                  title="Next page"
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports