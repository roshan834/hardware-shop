import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../context/AuthContext'
import { uploadImage } from '../../services/uploadService'
import Webcam from 'react-webcam'

const EditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()

  const webcamRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)
  const [showCamera, setShowCamera] = useState(false)

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
    image_url: '',
    image_file: null
  })

  // LOAD PRODUCT
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
      reorder_level: data.reorder_level ?? '',
      image_file: null
    })

    setPreview(data.image_url || null)
    setLoading(false)
  }

  useEffect(() => {
    loadProduct()
  }, [])

  // IMAGE SELECT (GALLERY)
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setForm(prev => ({
      ...prev,
      image_file: file
    }))

    setPreview(URL.createObjectURL(file))
  }

  // BASE64 TO FILE
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

  // CAMERA CAPTURE
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

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault()

    let imageUrl = form.image_url

    if (form.image_file) {
      const { url, error } = await uploadImage(
        form.image_file,
        form.product_code
      )

      if (error) {
        alert(error.message)
        return
      }

      imageUrl = url
    }

    const { id: _id, image_file, created_at, last_updated, ...rest } = form

    const { error } = await supabase
      .from('products')
      .update({
        ...rest,
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
    navigate('/admin/products')
  }

  // LOADING
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

        <button className="btn-back" onClick={() => navigate('/admin/products')}>
          ← Back
        </button>

        <h1>Edit Product</h1>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* IMAGE SECTION */}
            <div className="form-group">
              <label>Product Image</label>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowCamera(true)}
                >
                  📷 Take Photo
                </button>

                <label className="btn-success">
                  🖼️ Choose From Gallery
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>

              </div>

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    width: '150px',
                    marginTop: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              )}
            </div>

            {/* PRODUCT CODE */}
            <div className="form-group">
              <label>Product Code</label>
              <input
                value={form.product_code}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, product_code: e.target.value }))
                }
              />
            </div>

            {/* PRODUCT NAME */}
            <div className="form-group">
              <label>Product Name</label>
              <input
                value={form.product_name}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, product_name: e.target.value }))
                }
              />
            </div>

            {/* CATEGORY */}
            <div className="form-group">
              <label>Category</label>
              <input
                value={form.category}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, category: e.target.value }))
                }
              />
            </div>

            {/* BRAND */}
            <div className="form-group">
              <label>Brand</label>
              <input
                value={form.brand || ''}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, brand: e.target.value }))
                }
              />
            </div>

            {/* UNIT */}
            <div className="form-group">
              <label>Unit</label>
              <input
                value={form.unit}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, unit: e.target.value }))
                }
              />
            </div>

            {/* PURCHASE PRICE */}
            {role === "admin" && (
              <div className="form-group">
                <label>Purchase Price</label>
                <input
                  type="number"
                  value={form.purchase_price}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, purchase_price: e.target.value }))
                  }
                />
              </div>
            )}

            {/* SELLING PRICE */}
            <div className="form-group">
              <label>Selling Price</label>
              <input
                type="number"
                value={form.selling_price}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, selling_price: e.target.value }))
                }
              />
            </div>

            {/* QUANTITY */}
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, quantity: e.target.value }))
                }
              />
            </div>

            {/* REORDER */}
            <div className="form-group">
              <label>Reorder Level</label>
              <input
                type="number"
                value={form.reorder_level}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, reorder_level: e.target.value }))
                }
              />
            </div>

            {/* LOCATION */}
            <div className="form-group">
              <label>Location</label>
              <input
                value={form.location || ''}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, location: e.target.value }))
                }
              />
            </div>

          </div>

          <br />

          <button type="submit" className="btn-success">
            Update Product
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

export default EditProduct