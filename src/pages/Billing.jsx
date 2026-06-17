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
  const [partialAmount, setPartialAmount] = useState("")
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState("")

  const loadAgents = async () => {
    const { data, error } = await supabase
      .from("users").select("*").eq("role", "agent").order("name", { ascending: true })
    if (!error) setAgents(data || [])
  }

  useEffect(() => { loadAgents() }, [])

    const loadCart = async () => {
      if (!userId) return

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          qty,
          products (*)
        `)
        .eq("user_id", userId)
        .order("id", { ascending: true })

      if (error) {
        console.log(error)
        return
      }

      setCart(
        data?.map((item) => ({
          ...item.products,
          qty: item.qty
        })) || []
      )
    }

  useEffect(() => { loadCart() }, [userId])

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

  const getProductByBarcode = async (code) => {
    const { data, error } = await supabase
      .from("products").select("*")
      .or(`barcode.eq.${code},product_code.eq.${code}`)
      .maybeSingle()
    return { data, error }
  }

  const addToCart = async (product) => {
    const { data: existing } = await supabase
      .from("cart_items").select("*")
      .eq("user_id", userId).eq("product_id", product.id).maybeSingle()
    if (existing) {
      await supabase.from("cart_items").update({ qty: existing.qty + 1 }).eq("id", existing.id)
    } else {
      await supabase.from("cart_items").insert({ user_id: userId, product_id: product.id, qty: 1 })
    }
    await loadCart()
  }

  const increaseQty = async (productId) => {
    const { data } = await supabase.from("cart_items").select("*")
      .eq("user_id", userId).eq("product_id", productId).single()
    await supabase.from("cart_items").update({ qty: data.qty + 1 }).eq("id", data.id)
    window.dispatchEvent(new Event("cartUpdated"))
    loadCart()
  }

  const decreaseQty = async (productId) => {
    const { data } = await supabase.from("cart_items").select("*")
      .eq("user_id", userId).eq("product_id", productId).single()
    if (data.qty <= 1) return
    await supabase.from("cart_items").update({ qty: data.qty - 1 }).eq("id", data.id)
    window.dispatchEvent(new Event("cartUpdated"))
    loadCart()
  }

  const removeItem = async (productId) => {
    await supabase.from("cart_items").delete()
      .eq("user_id", userId).eq("product_id", productId)
    window.dispatchEvent(new Event("cartUpdated"))
    loadCart()
  }

  const handleSearch = async (code) => {
    const cleanCode = code.trim()
    if (!cleanCode) return
    const { data, error } = await getProductByBarcode(cleanCode)
    if (error || !data) { toast.error("Product not found ❌"); return }
    addToCart(data)
    playBeep()
    setScanMessage(`${data.product_name} added to cart`)
    setTimeout(() => setScanMessage(""), 2000)
    setBarcode("")
  }

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(barcode) }
  const handleScan = async (code) => { await handleSearch(code); toast.success("Product Added To Cart 🛒") }

  const subtotal = cart.reduce((sum, i) => sum + i.selling_price * i.qty, 0)
  const gst = subtotal * 0.18
  const total = subtotal + gst

  const printBill = PrintInvoice({ cart, subtotal, gst, total })

  const validateCustomerDetails = () => {
    if (!customerName.trim() && !customerPhone.trim()) return true
    if (customerName.trim()) {
      if (!/^[A-Za-z ]+$/.test(customerName.trim())) {
        toast.error("Customer name should contain only letters and spaces"); return false
      }
      if (customerName.trim().length < 2) {
        toast.error("Customer name must be at least 2 characters"); return false
      }
    }
    if (customerPhone.trim()) {
      if (!/^[6-9]\d{9}$/.test(customerPhone.trim())) {
        toast.error("Enter a valid 10-digit Indian mobile number"); return false
      }
    }
    return true
  }

  const handleGenerateBill = () => {
    if (cart.length === 0) { toast.error("Cart is empty ❌"); return }
    setShowCheckoutModal(true)
  }

  const handlePrintBill = () => {
    if (cart.length === 0) { toast.error("Cart is empty ❌"); return }
    printBill()
  }

  const checkout = async () => {
    let commissionAmount = 0
    let commissionPercent = 0

    if (selectedAgent) {
      const agent = agents.find((a) => a.id == selectedAgent)
      commissionPercent = agent?.commission_percent || 0
      commissionAmount = (total * commissionPercent) / 100
    }

    if (!validateCustomerDetails()) return

    try {
      if (paymentMode === "partial") {
        if (!partialAmount || Number(partialAmount) <= 0) { toast.error("Enter paid amount"); return }
        if (Number(partialAmount) > total) { toast.error("Paid amount cannot exceed bill total"); return }
      }

      const billNo = "BILL-" + Date.now()
      let paidAmount = total, pendingAmount = 0, billStatus = "completed"

      if (paymentMode === "credit") { paidAmount = 0; pendingAmount = total; billStatus = "pending" }
      if (paymentMode === "partial") {
        paidAmount = Number(partialAmount)
        pendingAmount = total - Number(partialAmount)
        billStatus = pendingAmount > 0 ? "pending" : "completed"
      }

      const paymentLogs = [{
        amount: paidAmount, payment_mode: paymentMode,
        date: new Date().toISOString(),
        note: paymentMode === "partial" ? "Initial Partial Payment"
          : paymentMode === "credit" ? "Credit Bill Created" : "Bill Paid"
      }]

      const { data: bill, error } = await supabase.from("bills").insert({
        bill_no: billNo,
        customer_name: customerName || "Walk-In Customer",
        customer_phone: customerPhone || null,
        subtotal, gst, grand_total: total,
        payment_mode: paymentMode,
        paid_amount: paidAmount,
        pending_amount: pendingAmount,
        payment_logs: paymentLogs,
        bill_status: billStatus,
        agent_id: selectedAgent || null
      }).select().single()

      if (error) { toast.error(error.message); return }

      if (selectedAgent) {
        const commissionStatus = billStatus === "completed" ? "withdrawable" : "locked"
        await supabase.from("commissions").insert({
          agent_id: selectedAgent, bill_id: bill.id,
          commission_percent: commissionPercent,
          commission_amount: commissionAmount,
          status: commissionStatus
        })
      }

      for (const item of cart) {
        await supabase.from("bill_items").insert({
          bill_id: bill.id, product_id: item.id,
          product_name: item.product_name, product_code: item.product_code,
          qty: item.qty, price: item.selling_price
        })
        await supabase.rpc("decrease_stock", { pid: item.id, qty: item.qty })
      }

      printBill()
      setShowCheckoutModal(false)
      setCustomerName(""); setCustomerPhone(""); setPaymentMode("cash"); setPartialAmount("")
      await supabase.from("cart_items").delete().eq("user_id", userId)
      setCart([])
      toast.success("Bill Saved Successfully 🎉")

    } catch (err) {
      console.error(err)
      toast.error("Checkout Failed ❌")
    }
  }

  const skipAndCheckout = async () => {
    setCustomerName(""); setCustomerPhone(""); setPaymentMode("cash"); setPartialAmount("")
    await checkout()
  }

  // ── Qty Controls reused in both views ──
  const QtyControls = ({ item }) => (
    <div className="qty-box">
      <button className="qty-btn" onClick={() => decreaseQty(item.id)}>-</button>
      <span className="qty-value">{item.qty}</span>
      <button className="qty-btn qty-plus" onClick={() => increaseQty(item.id)}>+</button>
    </div>
  )

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

        {scanMessage && <div className="scan-success">{scanMessage}</div>}

        {/* BARCODE INPUT */}
        <div className="barcode-scanner-card">
          <input
            className="search-input"
            placeholder="Scan or Enter Barcode..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn-primary btn-search" onClick={() => handleSearch(barcode)}>
            <span className="search-icon">🔍</span>
            <span className="search-text">Search & Add</span>
          </button>
        </div>

        {/* ===== DESKTOP CART TABLE ===== */}
        <div className="card desktop-only">
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
                  <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--gray-400)" }}>No products added</td></tr>
                ) : (
                  cart.map((item) => (
                    <tr key={item.id}>
                      <td><div className="product-cell"><span>{item.product_name}</span></div></td>
                      <td><QtyControls item={item} /></td>
                      <td>₹{item.selling_price}</td>
                      <td>₹{(item.qty * item.selling_price).toFixed(2)}</td>
                      <td>
                        <button className="delete-btn" onClick={() => removeItem(item.id)}>
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

        {/* ===== MOBILE CART CARDS ===== */}
        <div className="mobile-only">
          <h2 style={{ marginBottom: "var(--space-3)" }}>Cart Items</h2>

          {cart.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "30px", color: "var(--gray-400)" }}>
              No products added
            </div>
          ) : (
            <div className="cart-cards">
              {cart.map((item) => (
                <div key={item.id} className="cart-card">

                  {/* Top: name + delete */}
                  <div className="cart-card-header">
                    <span className="cart-card-name">{item.product_name}</span>
                    <button className="delete-btn" onClick={() => removeItem(item.id)}>
                      <FaTrashAlt />
                    </button>
                  </div>

                  {/* Bottom: qty + price + total */}
                  <div className="cart-card-footer">
                    <QtyControls item={item} />

                    <div className="cart-card-prices">
                      <div className="cart-card-price-row">
                        <span className="cart-card-label">Price</span>
                        <span className="cart-card-price">₹{item.selling_price}</span>
                      </div>
                      <div className="cart-card-price-row">
                        <span className="cart-card-label">Total</span>
                        <span className="cart-card-total">
                          ₹{(item.qty * item.selling_price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
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
          <button className="generate-btn" onClick={handleGenerateBill}>💳 Generate Bill</button>
          <button className="print-btn" onClick={handlePrintBill}>🖨️ Print Bill</button>
        </div>

      </div>

      {/* SCANNER MODAL */}
      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="checkout-modal">
            <h2>Generate Bill</h2>

            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text" placeholder="Customer Name (optional)"
                value={customerName} maxLength={50}
                onChange={(e) => { if (/^[A-Za-z ]*$/.test(e.target.value)) setCustomerName(e.target.value) }}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel" placeholder="Mobile Number (optional)"
                value={customerPhone} maxLength={10}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            {paymentMode === "partial" && (
              <div className="form-group">
                <label>Paid Amount</label>
                <input
                  type="number" min="1" max={total}
                  value={partialAmount} placeholder={`Max ₹${total.toFixed(2)}`}
                  onChange={(e) => {
                    if (e.target.value === "" || Number(e.target.value) <= total)
                      setPartialAmount(e.target.value)
                  }}
                />
                {partialAmount && (
                  <div style={{ marginTop: "8px", color: "#ef4444", fontWeight: "600" }}>
                    Pending: ₹{(total - Number(partialAmount)).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Agent</label>
              <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                <option value="">No Agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Payment Mode</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
                <option value="partial">Partial Payment</option>
              </select>
            </div>

            <div className="modal-buttons">
              <button className="skip-btn" onClick={skipAndCheckout}>Skip & Generate</button>
              <button className="confirm-btn" onClick={checkout}>Generate Bill</button>
              <button className="cancel-btn" onClick={() => setShowCheckoutModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Billing