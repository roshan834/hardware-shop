import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import BarcodeScanner from "../components/BarcodeScanner"
import { supabase } from "../config/supabase"
import PrintInvoice from "../components/PrintInvoice"
import { FaTrashAlt } from "react-icons/fa"

const Billing = () => {
  const navigate = useNavigate()

  const [userId, setUserId] = useState(null)

  useEffect(() => {
  const getUser = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (user) {
      setUserId(user.id)
    }
  }

  getUser()
}, [])

  const [cart, setCart] = useState([])

  useEffect(() => {
    if (!userId) return

    const savedCart = localStorage.getItem(
      `cart_${userId}`
    )

    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [userId])

      useEffect(() => {
    if (!userId) return

    localStorage.setItem(
      `cart_${userId}`,
      JSON.stringify(cart)
    )
  }, [cart, userId])

  const [barcode, setBarcode] = useState("")
  const [showScanner, setShowScanner] = useState(false)

  // ================= FETCH PRODUCT =================
    const getProductByBarcode = async (code) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`barcode.eq.${code},product_code.eq.${code}`)
      .maybeSingle()

    return { data, error }
  }

  // ================= ADD TO CART =================
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id)

      if (exists) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: i.qty + 1 }
            : i
        )
      }

      return [...prev, { ...product, qty: 1 }]
    })
  }

  // ================= HANDLE SEARCH =================
  const handleSearch = async (code) => {
    const cleanCode = code.trim()

    if (!cleanCode) return

    const { data, error } = await getProductByBarcode(cleanCode)

    if (error || !data) {
      alert("Product not found")
      return
    }

    addToCart(data)
    setBarcode("")
  }

  // ================= KEY ENTER SEARCH =================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(barcode)
    }
  }

  // ================= SCANNER RESULT =================
  const handleScan = async (code) => {
  await handleSearch(code)
  // setShowScanner(false)
  }

  // ============remove item ============

    const removeItem = (id) => {
    setCart((prev) =>
      prev.filter((item) => item.id !== id)
    )
  }

  // ========= Checkout ============


      const checkout = async () => {
      try {
        if (cart.length === 0) {
          alert("Cart is empty")
          return
        }

        const billNo = "BILL-" + Date.now()

        const { data: bill, error } = await supabase
          .from("bills")
          .insert({
            bill_no: billNo,
            subtotal,
            gst,
            grand_total: total,
            payment_mode: "cash"
          })
          .select()
          .single()

        if (error) {
          alert(error.message)
          return
        }

        for (const item of cart) {
          await supabase
            .from("bill_items")
            .insert({
              bill_id: bill.id,
              product_id: item.id,
              qty: item.qty,
              price: item.selling_price
            })

          await supabase.rpc("decrease_stock", {
            pid: item.id,
            qty: item.qty
          })
        }

        printBill()

        alert("Bill Saved Successfully")

        setCart([])
        localStorage.removeItem(`cart_${userId}`)
      } catch (err) {
        console.error(err)
        alert("Checkout Failed")
      }
    }

 
  
  // ================= TOTALS =================
  const subtotal = cart.reduce(
    (sum, i) => sum + i.selling_price * i.qty,
    0
  )

  const gst = subtotal * 0.18
  const total = subtotal + gst

    const printBill = PrintInvoice({
    cart,
    subtotal,
    gst,
    total
  })

  
  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        {/* HEADER */}
        <div className="page-header">
          <h1>POS Billing System</h1>

          <button
            className="btn-primary"
            onClick={() => setShowScanner(true)}
          >
            📷 Scan Barcode
          </button>
        </div>

        {/* INPUT SECTION */}
        <div className="card" style={{ display: "flex", gap: "10px" }}>

          <input
            className="input"
            placeholder="Scan or Enter Barcode..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />

          <button
            className="btn-primary"
            onClick={() => handleSearch(barcode)}
          >
            🔍 Search & Add to Cart
          </button>
          

        </div>

        {/* CART */}
        <div className="card">
          <h2>Cart Items</h2>

          <div className="table-wrapper">
            <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Action</th>

              </tr>
            </thead>

            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan="5">No products added</td>
                </tr>
              ) : (
                cart.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="product-cell">
                        <span>{item.product_name}</span>

                        {item.qty > 1 && (
                          <span className="added-badge">
                            +{item.qty - 1}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                    <div className="qty-box">
                      <button
                        className="qty-btn"
                        onClick={() => {
                          setCart((prev) =>
                            prev.map((p) =>
                              p.id === item.id
                                ? {
                                    ...p,
                                    qty: Math.max(1, p.qty - 1)
                                  }
                                : p
                            )
                          )
                        }}
                      >
                        -
                      </button>

                      <span className="qty-value">
                        {item.qty}
                      </span>

                      <button
                        className="qty-btn qty-plus"
                        onClick={() => {
                          setCart((prev) =>
                            prev.map((p) =>
                              p.id === item.id
                                ? {
                                    ...p,
                                    qty: p.qty + 1
                                  }
                                : p
                            )
                          )
                        }}
                      >
                        +
                      </button>
                    </div>
                  </td>

                    <td>₹{item.selling_price}</td>

                    <td>
                      ₹{(item.qty * item.selling_price).toFixed(2)}
                    </td>

                    <td>
                     <button
                      className="delete-btn"
                      onClick={() => removeItem(item.id)}
                      title="Remove Product"
                    >
                      <FaTrashAlt />
                    </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY */}
     <div className="bill-summary">
            <h2>🧾 Bill Summary</h2>

            <div className="bill-row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>

            <div className="bill-row">
              <span>GST (18%)</span>
              <strong>₹{gst.toFixed(2)}</strong>
            </div>

            <div className="bill-total">
              ₹{total.toFixed(2)}
            </div>


            <button
              className="generate-btn"
              onClick={checkout}
            >
              💳 Generate Bill
            </button>

            <button
              className="print-btn"
              onClick={printBill}
            >
              🖨️ Print Bill
            </button>
        </div>

        
      </div>

      {/* SCANNER MODAL */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )

  
}


export default Billing