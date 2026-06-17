import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import { supabase } from "../config/supabase"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { FaDownload } from "react-icons/fa"
import PrintInvoice from "../components/PrintInvoice"

const BillHistory = () => {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [collectedAmount, setCollectedAmount] = useState("")
  const [collectionMode, setCollectionMode] = useState("cash")

  const navigate = useNavigate()

  const handleDownload = (invoice) => {
    const printInvoice = PrintInvoice({
      cart: invoice.items,
      subtotal: invoice.subtotal,
      gst: invoice.gst,
      total: invoice.total,
      customer: invoice.customer,
      phone: invoice.phone
    })

    printInvoice()
  }

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error) setBills(data)

    setLoading(false)
  }

  const openPendingModal = (bill) => {
    setSelectedBill(bill)
    setCollectedAmount("")
    setCollectionMode("cash")
    setShowPendingModal(true)
  }

  const closePendingModal = () => {
    setShowPendingModal(false)
    setSelectedBill(null)
    setCollectedAmount("")
  }

  const filteredBills = bills.filter((bill) => {
    const searchMatch =
      bill.bill_no?.toLowerCase().includes(search.toLowerCase()) ||
      bill.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      bill.customer_phone?.toString().includes(search)

    const paymentMatch =
      paymentFilter === "" || bill.payment_mode === paymentFilter

    const billDate = new Date(bill.created_at)

    const fromMatch = !fromDate || billDate >= new Date(fromDate)

    const toMatch =
      !toDate || billDate <= new Date(toDate + "T23:59:59")

    return searchMatch && paymentMatch && fromMatch && toMatch
  })

  const collectPayment = async () => {
    if (!collectedAmount) return toast.error("Enter amount")

    const payment = Number(collectedAmount)

    if (payment <= 0)
      return toast.error("Invalid amount")

    if (payment > selectedBill.pending_amount)
      return toast.error("Amount exceeds pending balance")

    const newPaid =
      Number(selectedBill.paid_amount) + payment

    const newPending =
      Number(selectedBill.pending_amount) - payment

    const updatedLogs = [
      ...(selectedBill.payment_logs || []),
      {
        amount: payment,
        payment_mode: collectionMode,
        date: new Date().toISOString(),
        note: "Pending Amount Collected"
      }
    ]

    const { error } = await supabase
      .from("bills")
      .update({
        paid_amount: newPaid,
        pending_amount: Math.max(newPending, 0),
        payment_logs: updatedLogs,
        bill_status: newPending <= 0 ? "completed" : "pending"
      })
      .eq("id", selectedBill.id)

    if (newPending <= 0) {
      await supabase
        .from("agent_commissions")
        .update({ status: "withdrawable" })
        .eq("bill_id", selectedBill.id)
    }

    if (error) return toast.error(error.message)

    closePendingModal()
    await fetchBills()
    toast.success("Payment Collected Successfully 🎉")
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <div className="page-header">
          <h1>🧾 Bill History</h1>
        </div>

        {/* FILTERS */}
        <div className="card filter-card">
          <input
            type="text"
            className="search-input"
            placeholder="Search Bill / Customer / Phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">All Payments</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="credit">Credit</option>
            <option value="partial">Partial</option>
          </select>

            <div className="date-filter-group">
              <div className="date-inline-field">
                <label>From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="date-inline-field">
                <label>To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

          <button
            className="clear-filter-btn"
            onClick={() => {
              setSearch("")
              setPaymentFilter("")
              setFromDate("")
              setToDate("")
            }}
          >
            Clear Filters
          </button>
        </div>

        <div className="bill-count">
          Total Bills: {filteredBills.length}
        </div>

        {/* =========================
            DESKTOP TABLE
        ========================= */}
        <div className="card desktop-table desktop-only">
          <div className="table-container">

            <table className="bill-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan="10">Loading...</td></tr>
                ) : filteredBills.length === 0 ? (
                  <tr><td colSpan="10">No Bills Found</td></tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.bill_no}</td>
                      <td>{bill.customer_name || "Walk-In"}</td>
                      <td>{bill.customer_phone || "-"}</td>
                      <td>₹{bill.paid_amount}</td>
                      <td>₹{bill.pending_amount}</td>
                      <td>₹{Number(bill.grand_total).toFixed(2)}</td>

                      <td>
                        <span className={`payment-badge ${bill.payment_mode}`}>
                          {bill.payment_mode}
                        </span>
                      </td>

                      <td>
                        <span className={`status-badge ${bill.bill_status}`}>
                          {bill.bill_status}
                        </span>
                      </td>

                      <td>
                        {new Date(bill.created_at).toLocaleString()}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button onClick={() => navigate(`/payment-history/${bill.id}`)}>
                            View
                          </button>

                          {bill.pending_amount > 0 && (
                            <button onClick={() => openPendingModal(bill)}>
                              Collect
                            </button>
                          )}

                          <button
                            onClick={() =>
                              PrintInvoice({
                                cart: bill.items || [],
                                subtotal: Number(bill.subtotal),
                                gst: Number(bill.gst),
                                total: Number(bill.grand_total),
                                customer: bill.customer_name,
                                phone: bill.customer_phone
                              })()
                            }
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
        </div>

        {/* =========================
            MOBILE CARDS
        ========================= */}
        <div className="mobile-cards mobile-only">
          {loading ? (
            <p>Loading...</p>
          ) : filteredBills.length === 0 ? (
            <p>No Bills Found</p>
          ) : (
            filteredBills.map((bill) => (
              <div className="bill-card" key={bill.id}>

                <div className="bill-header">
                  <strong>{bill.bill_no}</strong>
                  <span className={`status-badge ${bill.bill_status}`}>
                    {bill.bill_status}
                  </span>
                </div>

                <div className="bill-row">
                  <span>Customer</span>
                  <span>{bill.customer_name || "Walk-In"}</span>
                </div>

                <div className="bill-row">
                  <span>Phone</span>
                  <span>{bill.customer_phone || "-"}</span>
                </div>

                <div className="bill-row">
                  <span>Total</span>
                  <span>₹{Number(bill.grand_total).toFixed(2)}</span>
                </div>

                <div className="bill-row">
                  <span>Pending</span>
                  <span>₹{bill.pending_amount}</span>
                </div>

                <div className="bill-actions">

                  <button onClick={() => navigate(`/payment-history/${bill.id}`)}>
                    View
                  </button>

                  {bill.pending_amount > 0 && (
                    <button onClick={() => openPendingModal(bill)}>
                      Collect
                    </button>
                  )}

                  <button
                    onClick={() =>
                      PrintInvoice({
                        cart: bill.items || [],
                        subtotal: Number(bill.subtotal),
                        gst: Number(bill.gst),
                        total: Number(bill.grand_total),
                        customer: bill.customer_name,
                        phone: bill.customer_phone
                      })()
                    }
                  >
                    <FaDownload />
                  </button>

                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* MODAL (UNCHANGED) */}
    

      {showPendingModal && selectedBill && (
      <div className="modal-overlay">
        <div className="checkout-modal">

          <h2>Collect Pending Payment</h2>

          <p>
            Pending Amount:
            ₹{selectedBill.pending_amount}
          </p>

          <input
              type="number"
              min="1"
              max={selectedBill.pending_amount}
              placeholder="Enter Amount"
              value={collectedAmount}
              onChange={(e) => {
                const value = e.target.value

                if (
                  value === "" ||
                  Number(value) <= selectedBill.pending_amount
                ) {
                  setCollectedAmount(value)
                }
              }}
            />

            {collectedAmount && (
              <div
                style={{
                  marginTop: "10px",
                  fontWeight: "600",
                  color: "#ef4444"
                }}
              >
                Remaining After Payment :
                ₹
                {(
                  selectedBill.pending_amount -
                  Number(collectedAmount)
                ).toFixed(2)}
              </div>
            )}

          <select
            value={collectionMode}
            onChange={(e) =>
              setCollectionMode(e.target.value)
            }
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>

          <div className="modal-buttons">

            <button
              className="confirm-btn"
              onClick={collectPayment}
            >
              Save Payment
            </button>

            <button
              className="cancel-btn"
              onClick={closePendingModal}
            >
              Cancel
            </button>

          </div>

        </div>
      </div>
    )}

    </div>
  )
}

export default BillHistory