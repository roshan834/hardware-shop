import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getProducts, deleteProduct } from '../services/productService'
import { useAuth } from '../context/AuthContext'        //  add

const Products = () => {

  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)

  const navigate = useNavigate()
  const { role } = useAuth()                           //  add

  const loadProducts = async () => {
    const { data, count } = await getProducts(currentPage, pageSize, search)
    setProducts(data || [])
    setTotalRecords(count || 0)
  }

  useEffect(() => {
    loadProducts()
  }, [currentPage, pageSize, search])

  const removeProduct = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete Product?')) return
    await deleteProduct(id)
    loadProducts()
  }

  const totalPages = Math.ceil(totalRecords / pageSize)

  return (
    <div className="layout">

      <Sidebar />

      <div className="content">

        <div className="page-header">
          <h1>Products</h1>
          <Link to="/products/add" className="btn-primary">
            Add Product
          </Link>
        </div>

        <div className="toolbar">
          <input
            type="text"
            placeholder="Search product..."
            className="search-box"
            value={search}
            onChange={(e) => {
              setCurrentPage(1)
              setSearch(e.target.value)
            }}
          />
          <select
            value={pageSize}
            onChange={(e) => {
              setCurrentPage(1)
              setPageSize(Number(e.target.value))
            }}
            className="page-size"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Qty</th>
                {role === "admin" && <th>Purchase</th>}  {/*  admin only */}
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.length > 0 ? (
                products.map(product => (
                  <tr
                    key={product.id}
                    onClick={() => navigate(`/products/view/${product.id}`)}
                    className="clickable-row"
                  >
           
                  <td>
                    {(() => {
                      const imgUrl = //product.image_url ||
                        `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${product.product_code}.jpeg`

                      return (
                        <>
                          <img
                            src={imgUrl}
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
                    })()}
                  </td>
                    <td>{product.product_code}</td>
                    <td>{product.product_name}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>
                      {product.quantity <= product.reorder_level ? (
                        <span className="badge-low-stock">
                          {product.quantity} ⚠️
                        </span>
                      ) : (
                        product.quantity
                      )}
                    </td>

                    {/* Purchase Price — admin only */}
                    {role === "admin" && (
                      <td>₹{Number(product.purchase_price || 0).toLocaleString('en-IN')}</td>
                    )}

                    <td>₹{Number(product.selling_price).toLocaleString('en-IN')}</td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/products/edit/${product.id}`}
                        className="btn-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      {' '}
                      <button
                        className="btn-danger"
                        onClick={(e) => removeProduct(e, product.id)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role === "admin" ? "9" : "8"}>
                    No Products Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? 'active-page' : ''}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  )
}

export default Products