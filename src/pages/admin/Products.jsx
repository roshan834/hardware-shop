import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { getProducts, deleteProduct, getCategories } from '../../services/websiteProductService'
import { useAuth } from '../../context/AuthContext'
import { toast } from "react-toastify"
import { supabase } from "../../config/supabase"

const Products = () => {

  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [categories, setCategories] = useState([])
  

  const location = useLocation()
  const navigate = useNavigate()
  const { role } = useAuth()

  const query = new URLSearchParams(location.search)
  const filter = query.get('filter') || ''
  const category = query.get('category') || ''

  const [cartCount, setCartCount] = useState(0)

    useEffect(() => {
      loadCartCount()

      const handleCartUpdate = () => {
        loadCartCount()
      }

      window.addEventListener(
        "cartUpdated",
        handleCartUpdate
      )

      return () => {
        window.removeEventListener(
          "cartUpdated",
          handleCartUpdate
        )
      }
    }, [])

    const loadCartCount = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("cart_items")
        .select("qty")
        .eq("user_id", user.id)

      const count =
        data?.reduce(
          (sum, item) => sum + Number(item.qty || 0),
          0
        ) || 0

      setCartCount(count)
    }

  const getImageUrl = (product) =>
    product.image_url ||
    `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${product.product_code}.jpeg`

  useEffect(() => {
    loadProducts()
  }, [currentPage, pageSize, search, filter, category])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadProducts = async () => {
    const { data, count } = await getProducts({ page: currentPage, pageSize, search, filter, category })
    setProducts(data || [])
    setTotalRecords(count || 0)
  }

  const loadCategories = async () => {
    const { data } = await getCategories()
    setCategories(data || [])
  }

  const addToCart = async (e, product) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert("Please login"); return }

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle()

    if (existing) {
      await supabase.from("cart_items").update({ qty: existing.qty + 1 }).eq("id", existing.id)
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, qty: 1 })
    }

    window.dispatchEvent(new Event("cartUpdated"))
    toast.success("Added To Cart 🛒")
  }

  const removeProduct = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete Product?')) return
    await deleteProduct(id)
    loadProducts()
  }

  const totalPages = Math.ceil(totalRecords / pageSize)

  // ── Image cell reused in both views ──
  const ProductImage = ({ product }) => (
    <>
      <img
        src={getImageUrl(product)}
        alt={product.product_name}
        className="product-image"
        onError={(e) => {
          e.target.style.display = "none"
          e.target.nextSibling.style.display = "flex"
        }}
      />
      <div className="no-image" style={{ display: "none" }}>📦</div>
    </>
  )

  // ── Action buttons reused in both views ──
const ActionButtons = ({ product }) => (
  <div className="product-card-actions" style={{ flexDirection: "row", flexWrap: "nowrap" }}>
    <button className="btn-cart" onClick={(e) => addToCart(e, product)}>
      🛒 Add
    </button>
    <Link
      to={`/admin/products/edit/${product.id}`}
      className="btn-primary"
      onClick={(e) => e.stopPropagation()}
    >
      Edit
    </Link>
    <button
      className="btn-danger"
      onClick={(e) => removeProduct(e, product.id)}
    >
      Delete
    </button>
  </div>
)

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">


        <Link to="/billing" className="mobile-cart-btn">
          🛒
          {cartCount > 0 && (
            <span className="cart-badge">
              {cartCount}
            </span>
          )}
        </Link>

        <div className="page-header">
          <h1>Products</h1>
          <Link to="/admin/products/add" className="btn-primary">
            Add Product
          </Link>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar toolbar-equal-height">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => { setCurrentPage(1); setSearch(e.target.value) }}
            className="toolbar-input"
          />
          <select
            value={category}
            onChange={(e) => navigate(`/admin/products?category=${e.target.value.trim()}`)}
            className="toolbar-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat.trim()}>{cat.trim()}</option>
            ))}
          </select>
          <select
            value={pageSize}
            onChange={(e) => { setCurrentPage(1); setPageSize(Number(e.target.value)) }}
            className="toolbar-select"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {products.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--gray-400)" }}>
            No Products Found
          </div>
        ) : (
          <>
            {/* ===== DESKTOP TABLE ===== */}
            <div className="table-container desktop-only">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Qty</th>
                    {role === "admin" && <th>Purchase</th>}
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr
                      key={product.id}
                      onClick={() => navigate(`/admin/products/view/${product.id}`)}
                      className="clickable-row"
                    >
                      <td><ProductImage product={product} /></td>
                      <td>{product.product_code}</td>
                      <td>{product.product_name}</td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>
                      <td>
                        {product.quantity <= product.reorder_level ? (
                          <span className="badge-low-stock">{product.quantity} ⚠️</span>
                        ) : product.quantity}
                      </td>
                      {role === "admin" && (
                        <td>₹{Number(product.purchase_price || 0).toLocaleString('en-IN')}</td>
                      )}
                      <td>₹{Number(product.selling_price).toLocaleString('en-IN')}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <ActionButtons product={product} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== MOBILE CARDS ===== */}
            <div className="mobile-only product-cards">
              {products.map(product => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => navigate(`/admin/products/view/${product.id}`)}
                >
                  {/* Top row: image + info */}
                  <div className="product-card-top">
                    <div className="product-card-img">
                      <ProductImage product={product} />
                    </div>

                    <div className="product-card-info">
                      <div className="product-card-name">{product.product_name}</div>
                      <div className="product-card-code">{product.product_code}</div>
                      <div className="product-card-meta">
                        {product.category && <span className="product-card-tag">{product.category}</span>}
                        {product.brand && <span className="product-card-tag">{product.brand}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Middle row: price + qty */}
                  <div className="product-card-middle">
                    <div className="product-card-price-box">
                      <span className="product-card-price-label">Price</span>
                      <span className="product-card-price">
                        ₹{Number(product.selling_price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {role === "admin" && (
                      <div className="product-card-price-box">
                        <span className="product-card-price-label">🔒 Purchase</span>
                        <span className="product-card-price" style={{ color: "var(--red-600)" }}>
                          ₹{Number(product.purchase_price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="product-card-price-box">
                      <span className="product-card-price-label">Stock</span>
                      {product.quantity <= product.reorder_level ? (
                        <span className="badge-low-stock">{product.quantity} ⚠️</span>
                      ) : (
                        <span className="product-card-price">{product.quantity}</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom row: actions */}
                  <div
                    className="product-card-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionButtons product={product} />
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

        {/* PAGINATION */}
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? 'active-page' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </div>

      </div>
    </div>
  )
}

export default Products