import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import BarcodeScanner from "../components/BarcodeScanner"
import { supabase } from "../config/supabase"
import PrintInvoice from "../components/PrintInvoice"
import { FaTrashAlt } from "react-icons/fa"
import { toast } from "react-toastify"

const Billing = () => {
  const navigate = useNavigate()

  const [userId, setUserId] = useState(null)
  const [scanMessage, setScanMessage] = useState("")
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMode, setPaymentMode] = useState("cash")
  const [cart, setCart] = useState([])
  const [barcode, setBarcode] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [partialAmount, setPartialAmount] =useState("")

  const playBeep = () => {
    const audio = new Audio("/beep.mp3")
    audio.play()
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!userId) return
    const savedCart = localStorage.getItem(`cart_${userId}`)
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [userId])

  useEffect(() => {
    if (!userId) return
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cart))
  }, [cart, userId])

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
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
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
      toast.error("Product not found ❌")
      return
    }

    addToCart(data)
    playBeep()
    setScanMessage(`${data.product_name} added to cart`)
    setTimeout(() => setScanMessage(""), 2000)
    setBarcode("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch(barcode)
  }

  const handleScan = async (code) => {
    await handleSearch(code)
    toast.success("Product Added To Cart 🛒")
  }

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // ================= TOTALS =================
  const subtotal = cart.reduce((sum, i) => sum + i.selling_price * i.qty, 0)
  const gst = subtotal * 0.18
  const total = subtotal + gst

  const printBill = PrintInvoice({ cart, subtotal, gst, total })

  // ================= VALIDATION =================
  const validateCustomerDetails = () => {
    // if both empty — skip validation, allow checkout
    if (!customerName.trim() && !customerPhone.trim()) {
      return true
    }

    // name validation — only if filled
    if (customerName.trim()) {
      const nameRegex = /^[A-Za-z ]+$/
      if (!nameRegex.test(customerName.trim())) {
        toast.error("Customer name should contain only letters and spaces")
        return false
      }
      if (customerName.trim().length < 2) {
        toast.error("Customer name must be at least 2 characters")
        return false
      }
    }

    // phone validation — only if filled
    if (customerPhone.trim()) {
      const phoneRegex = /^[6-9]\d{9}$/
      if (!phoneRegex.test(customerPhone.trim())) {
        toast.error("Enter a valid 10-digit Indian mobile number starting with 6-9")
        return false
      }
    }

    return true
  }

  // ================= GENERATE BILL BUTTON =================
  const handleGenerateBill = () => {
    // step 1 — check cart
    if (cart.length === 0) {
      toast.error("Cart is empty ❌")
      return
    }

    // step 2 — open modal for customer details
    setShowCheckoutModal(true)
  }

    const handlePrintBill = () => {
    // step 1 — check cart
    if (cart.length === 0) {
      toast.error("Cart is empty ❌")
      return
    }

    // step 2 — open modal for customer details
    printBill()
  }

  // ================= CHECKOUT =================
  const checkout = async () => {
    // step 3 — validate customer details if filled
    if (!validateCustomerDetails()) return

    try {
      if (paymentMode === "partial") {
          if (!partialAmount || Number(partialAmount) <= 0) {
            toast.error("Enter paid amount")
            return
          }

          if (Number(partialAmount) > total) {
            toast.error("Paid amount cannot exceed bill total")
            return
          }
        }

      const billNo = "BILL-" + Date.now()

      let paidAmount = total
      let pendingAmount = 0
      let billStatus = "completed"

      if (paymentMode === "credit") {
        paidAmount = 0
        pendingAmount = total
        billStatus = "pending"
      }

      if (paymentMode === "partial") {
        paidAmount = Number(partialAmount)

        pendingAmount =
          total - Number(partialAmount)

        billStatus =
          pendingAmount > 0
            ? "pending"
            : "completed"
      }


      const paymentLogs = [
        {
          amount: paidAmount,
          payment_mode: paymentMode,
          date: new Date().toISOString(),
          note:
            paymentMode === "partial"
              ? "Initial Partial Payment"
              : paymentMode === "credit"
              ? "Credit Bill Created"
              : "Bill Paid"
        }
      ]

        const { data: bill, error } =
          await supabase
            .from("bills")
            .insert({
              bill_no: billNo,
              customer_name:
                customerName ||
                "Walk-In Customer",
              customer_phone:
                customerPhone || null,
              subtotal,
              gst,
              grand_total: total,
              payment_mode: paymentMode,
              paid_amount: paidAmount,
              pending_amount: pendingAmount,
              payment_logs: paymentLogs,
              bill_status: billStatus
            })
            .select()
            .single()

      if (error) {
        toast.error(error.message)
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
      setShowCheckoutModal(false)
      setCustomerName("")
      setCustomerPhone("")
      setPaymentMode("cash")
      setPartialAmount("")
      setCart([])
      localStorage.removeItem(`cart_${userId}`)
      toast.success("Bill Saved Successfully 🎉")

    } catch (err) {
      console.error(err)
      toast.error("Checkout Failed ❌")
    }
  }

  // ================= SKIP & GENERATE =================
  const skipAndCheckout = async () => {
  setCustomerName("")
  setCustomerPhone("")
  setPaymentMode("cash")
  setPartialAmount("")
  await checkout()
}

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        {/* HEADER */}
        <div className="page-header">
          <h1>POS Billing System</h1>
          <button className="btn-primary" onClick={() => setShowScanner(true)}>
            📷 Scan Barcode
          </button>
        </div>

        {scanMessage && (
          <div className="scan-success">{scanMessage}</div>
        )}

        {/* INPUT SECTION */}
        <div className="card" style={{ display: "flex", gap: "10px" }}>
          <input
            className="search-input"
            placeholder="Scan or Enter Barcode..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={() => handleSearch(barcode)}>
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
                            <span className="added-badge">+{item.qty - 1}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="qty-box">
                          <button
                            className="qty-btn"
                            onClick={() =>
                              setCart((prev) =>
                                prev.map((p) =>
                                  p.id === item.id
                                    ? { ...p, qty: Math.max(1, p.qty - 1) }
                                    : p
                                )
                              )
                            }
                          >
                            -
                          </button>
                          <span className="qty-value">{item.qty}</span>
                          <button
                            className="qty-btn qty-plus"
                            onClick={() =>
                              setCart((prev) =>
                                prev.map((p) =>
                                  p.id === item.id
                                    ? { ...p, qty: p.qty + 1 }
                                    : p
                                )
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td>₹{item.selling_price}</td>
                      <td>₹{(item.qty * item.selling_price).toFixed(2)}</td>
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

          <div className="bill-total">₹{total.toFixed(2)}</div>

          {/* 👇 fixed — was calling openCheckoutModal instead of handleGenerateBill */}
          <button className="generate-btn" onClick={handleGenerateBill}>
            💳 Generate Bill
          </button>

          <button className="print-btn" onClick={handlePrintBill}>
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

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="checkout-modal">

            <h2>Generate Bill</h2>

            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Customer Name (optional)"
                value={customerName}
                maxLength={50}
                onChange={(e) => {
                  const value = e.target.value
                  if (/^[A-Za-z ]*$/.test(value)) setCustomerName(value)
                }}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Mobile Number (optional)"
                value={customerPhone}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  setCustomerPhone(value)
                }}
              />
            </div>
            {paymentMode === "partial" && (
              <div className="form-group">
                <label>Paid Amount</label>

                <input
                      type="number"
                      min="1"
                      max={total}
                      value={partialAmount}
                      placeholder={`Max ₹${total.toFixed(2)}`}
                      onChange={(e) => {
                        const value = e.target.value

                        if (
                          value === "" ||
                          Number(value) <= total
                        ) {
                          setPartialAmount(value)
                        }
                      }}
                    />

                    {partialAmount && (
                        <div
                          style={{
                            marginTop: "8px",
                            color: "#ef4444",
                            fontWeight: "600"
                          }}
                        >
                          Pending Amount :
                          ₹
                          {(
                            total -
                            Number(partialAmount)
                          ).toFixed(2)}
                        </div>
                      )}
              </div>
            )}

            <div className="form-group">
              <label>Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
                <option value="partial">Partial Payment</option>
              </select>
            </div>

            <div className="modal-buttons">
              <button className="skip-btn" onClick={skipAndCheckout}>
                Skip & Generate
              </button>
              <button className="confirm-btn" onClick={checkout}>
                Generate Bill
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowCheckoutModal(false)}
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

export default Billing