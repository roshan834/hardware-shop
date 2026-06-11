import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Barcode from 'react-barcode'
import Webcam from 'react-webcam'

import Sidebar from '../components/Sidebar'
import { addProduct } from '../services/productService'
import { uploadImage } from '../services/uploadService'
import { useAuth } from '../context/AuthContext'

const AddProduct = () => {
  const navigate = useNavigate()
  const { role } = useAuth()

  const webcamRef = useRef(null)

  const [showCamera, setShowCamera] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

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
    image_file: null
  })

  // generate product code
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

  // gallery upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setForm(prev => ({ ...prev, image_file: file }))
    setPreview(URL.createObjectURL(file))
  }

  // convert base64 to file
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])

    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
  }

  // camera capture
  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot?.()

    if (!imageSrc) {
      alert('Camera not ready')
      return
    }

    setPreview(imageSrc)

    const file = dataURLtoFile(
      imageSrc,
      `${form.product_code || Date.now()}.jpg`
    )

    setForm(prev => ({
      ...prev,
      image_file: file
    }))

    setShowCamera(false)
  }

  // submit product
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
          alert(error.message)
          setLoading(false)
          return
        }

        imageUrl = url
      }

      const payload = {
        product_code: form.product_code,
        barcode: form.barcode,
        product_name: form.product_name,
        category: form.category,
        brand: form.brand,
        unit: form.unit,
        purchase_price: Number(form.purchase_price),
        selling_price: Number(form.selling_price),
        quantity: Number(form.quantity),
        reorder_level: Number(form.reorder_level),
        location: form.location,
        image_url: imageUrl
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

        <button className="btn-back" onClick={() => navigate('/products')}>
          ← Back
        </button>

        <h1>Add Product</h1>

        <form className="form-card" onSubmit={submit}>

          {/* Generate Code */}
          <button
            type="button"
            className="btn-primary"
            onClick={generateCode}
          >
            Generate Product Code
          </button>

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
                <Barcode value={form.barcode} width={1.5} height={50} />
              )}
            </div>

            {/* Product Name */}
            <div className="form-group">
              <label>Product Name</label>
              <input
                value={form.product_name}
                onChange={(e) => handleChange('product_name', e.target.value)}
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

            {/* Prices */}
            {role === 'admin' && (
              <div className="form-group">
                <label>Purchase Price</label>
                <input
                  type="number"
                  value={form.purchase_price}
                  onChange={(e) => handleChange('purchase_price', e.target.value)}
                />
              </div>
            )}

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

            {/* Reorder */}
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

            {/* IMAGE SECTION */}
            <div className="form-group">
              <label>Product Image</label>

              <div style={{ display: 'flex', gap: '10px' }}>

                {/* GALLERY (FIXED FOR MOBILE) */}
                <label className="btn-success">
                  🖼️ Gallery
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>

                {/* CAMERA */}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowCamera(true)}
                >
                  📷 Camera
                </button>

              </div>

              {/* PREVIEW */}
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    width: '180px',
                    marginTop: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              )}
            </div>

          </div>

          <br />

          <button type="submit" className="btn-success" disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </form>

        {/* CAMERA MODAL */}
        {showCamera && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              style={{ width: '90%', maxWidth: '500px', borderRadius: '10px' }}
            />

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button className="btn-success" onClick={capturePhoto}>
                Capture
              </button>

              <button className="btn-danger" onClick={() => setShowCamera(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AddProduct