import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { supabase } from '../config/supabase'
import { useAuth } from '../context/AuthContext'   // 👈 add this

const EditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const { role } = useAuth()                       // 👈 add this

  const [form, setForm] = useState({
    product_code: '',
    product_name: '',
    category: '',
    brand: '',
    unit: '',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    reorder_level: '',
    location: '',
    image_file: null
  })

  const loadProduct = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setForm({
      ...data,
      purchase_price: data.purchase_price ?? '',
      selling_price: data.selling_price ?? '',
      quantity: data.quantity ?? '',
      reorder_level: data.reorder_level ?? ''
    })

    setLoading(false)
  }

  useEffect(() => {
    loadProduct()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    let imageUrl = form.image_url

    if (form.image_file) {
      const { url, error } = await uploadImage(form.image_file)
      if (error) {
        alert('Image upload failed')
        return
      }
      imageUrl = url
    }

    const { error } = await supabase
      .from('products')
      .update({
        ...form,
        image_url: imageUrl,
        purchase_price: Number(form.purchase_price),
        selling_price: Number(form.selling_price),
        quantity: Number(form.quantity),
        reorder_level: Number(form.reorder_level)
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    alert('Product updated successfully')
    navigate('/products')
  }

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="content">
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <button
          type="button"
          onClick={() => navigate('/products')}
          className="btn-back"
        >
          ← Back
        </button>

        <h1>Edit Product</h1>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label>Product Image</label>
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="product"
                  style={{ width: '80px', marginBottom: '10px', borderRadius: '8px' }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, image_file: e.target.files[0] })
                }
              />
            </div>

            <div className="form-group">
              <label>Product Code</label>
              <input
                value={form.product_code}
                onChange={(e) =>
                  setForm({ ...form, product_code: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Product Name</label>
              <input
                value={form.product_name}
                onChange={(e) =>
                  setForm({ ...form, product_name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Brand</label>
              <input
                value={form.brand || ''}
                onChange={(e) =>
                  setForm({ ...form, brand: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Unit</label>
              <input
                value={form.unit}
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value })
                }
              />
            </div>

            {/* Purchase Price — admin only */}
            {role === "admin" && (
              <div className="form-group">
                <label>🔒 Purchase Price</label>
                <input
                  type="number"
                  value={form.purchase_price}
                  onChange={(e) =>
                    setForm({ ...form, purchase_price: e.target.value })
                  }
                />
              </div>
            )}

            <div className="form-group">
              <label>Selling Price</label>
              <input
                type="number"
                value={form.selling_price}
                onChange={(e) =>
                  setForm({ ...form, selling_price: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Reorder Level</label>
              <input
                type="number"
                value={form.reorder_level}
                onChange={(e) =>
                  setForm({ ...form, reorder_level: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                value={form.location || ''}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </div>

          </div>

          <br />

          <button type="submit" className="btn-success">
            Update Product
          </button>
        </form>

      </div>
    </div>
  )
}

export default EditProduct