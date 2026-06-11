import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Barcode from 'react-barcode'

import Sidebar from '../components/Sidebar'
import { addProduct } from '../services/productService'
import { uploadImage } from '../services/uploadService'
import { useAuth } from '../context/AuthContext'

const AddProduct = () => {
  const navigate = useNavigate()
  const { role } = useAuth()

  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)       // 👈 image preview state

  const [form, setForm] = useState({
    product_code: '',
    barcode: '',
    product_name: '',
    category: '',
    brand: '',
    unit: 'pcs',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    reorder_level: '10',
    location: '',
    image_file: null                                 // 👈 removed image_url
  })

  const generateCode = () => {
    const code = 'PRD' + Math.floor(100000 + Math.random() * 900000)
    setForm({ ...form, product_code: code, barcode: code })
  }

  const handleChange = (field, value) => {
    if (field === 'product_code') {
      setForm({ ...form, product_code: value, barcode: value })
    } else {
      setForm({ ...form, [field]: value })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm({ ...form, image_file: file })
    setPreview(URL.createObjectURL(file))            // show preview immediately
  }

  const submit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      let imageUrl = null

      if (form.image_file) {
        if (!form.product_code) {
          alert('Enter product code before uploading image')
          setLoading(false)
          return
        }

        const { url, error } = await uploadImage(form.image_file, form.product_code)

        if (error) {
          alert('Image upload failed: ' + error.message)
          setLoading(false)
          return
        }

        imageUrl = url
      }

      const payload = {
        product_code:   form.product_code,
        barcode:        form.barcode,
        product_name:   form.product_name,
        category:       form.category,
        brand:          form.brand,
        unit:           form.unit,
        purchase_price: Number(form.purchase_price),
        selling_price:  Number(form.selling_price),
        quantity:       Number(form.quantity),
        reorder_level:  Number(form.reorder_level),
        location:       form.location,
        image_url:      imageUrl
      }

      const { error } = await addProduct(payload)

      setLoading(false)

      if (error) {
        alert(error.message)
        return
      }

      alert('Product Added Successfully')
      navigate('/products')

    } catch (err) {
      console.error(err)
      setLoading(false)
      alert('Something went wrong')
    }
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <button
          className="btn-back"
          onClick={() => navigate('/products')}
          type="button"
        >
          ← Back
        </button>

        <h1>Add Product</h1>

        <form className="form-card" onSubmit={submit}>

          <div style={{ marginBottom: '15px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={generateCode}
            >
              Generate Product Code
            </button>
          </div>

          <div className="form-grid">

            {/* Product Code */}
            <div className="form-group">
              <label>Product Code</label>
              <input
                value={form.product_code}
                onChange={(e) => handleChange('product_code', e.target.value)}
                required
              />
            </div>

            {/* Barcode */}
            <div className="form-group">
              <label>Barcode</label>
              <input value={form.barcode} readOnly />
              {form.barcode && (
                <div style={{ marginTop: '10px' }}>
                  <Barcode
                    value={form.barcode}
                    width={1.5}
                    height={50}
                    fontSize={14}
                  />
                </div>
              )}
            </div>

            {/* Product Name */}
            <div className="form-group">
              <label>Product Name</label>
              <input
                value={form.product_name}
                onChange={(e) => handleChange('product_name', e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category</label>
              <input
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              />
            </div>

            {/* Brand */}
            <div className="form-group">
              <label>Brand</label>
              <input
                value={form.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              />
            </div>

            {/* Unit */}
            <div className="form-group">
              <label>Unit</label>
              <select
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
              >
                <option value="pcs">PCS</option>
                <option value="kg">KG</option>
                <option value="box">BOX</option>
                <option value="ltr">LTR</option>
              </select>
            </div>

            {/* Purchase Price — admin only */}
            {role === 'admin' && (
              <div className="form-group">
                <label>🔒 Purchase Price</label>
                <input
                  type="number"
                  value={form.purchase_price}
                  onChange={(e) => handleChange('purchase_price', e.target.value)}
                />
              </div>
            )}

            {/* Selling Price */}
            <div className="form-group">
              <label>Selling Price</label>
              <input
                type="number"
                value={form.selling_price}
                onChange={(e) => handleChange('selling_price', e.target.value)}
              />
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
              />
            </div>

            {/* Reorder Level */}
            <div className="form-group">
              <label>Reorder Level</label>
              <input
                type="number"
                value={form.reorder_level}
                onChange={(e) => handleChange('reorder_level', e.target.value)}
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Location</label>
              <input
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>

            {/* Product Image */}
            <div className="form-group">
              <label>Product Image</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: '150px',
                    marginTop: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              )}
            </div>

          </div>

          <br />

          <button
            type="submit"
            className="btn-success"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Product'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default AddProduct