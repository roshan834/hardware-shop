import { useState } from "react"
import Sidebar from "../components/Sidebar"
import BarcodeScanner from "../components/BarcodeScanner"
import { supabase } from "../config/supabase"

const Billing = () => {
  const [cart, setCart] = useState([])
  const [barcode, setBarcode] = useState("")
  const [showScanner, setShowScanner] = useState(false)

  const getProduct = async (code) => {
    return await supabase
      .from("products")
      .select("*")
      .eq("barcode", code)
      .single()
  }

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find(i => i.id === product.id)

      if (exists) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      }

      return [...prev, { ...product, qty: 1 }]
    })
  }

  const handleScan = async (code) => {
    const { data, error } = await getProduct(code)
    if (error || !data) return alert("Product not found")
    addToCart(data)
  }

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return

    const { data, error } = await getProduct(barcode.trim())
    if (error || !data) return alert("Not found")

    addToCart(data)
    setBarcode("")
  }

  const subtotal = cart.reduce((s, i) => s + i.selling_price * i.qty, 0)
  const gst = subtotal * 0.18
  const total = subtotal + gst

  const checkout = async () => {
    const invoice = "INV" + Date.now()

    const { data: sale } = await supabase
      .from("sales")
      .insert({
        invoice_no: invoice,
        subtotal,
        gst,
        grand_total: total
      })
      .select()
      .single()

    for (let item of cart) {
      await supabase.from("sale_items").insert({
        sale_id: sale.id,
        product_id: item.id,
        product_name: item.product_name,
        qty: item.qty,
        price: item.selling_price,
        total: item.qty * item.selling_price
      })

      await supabase.rpc("decrease_stock", {
        pid: item.id,
        qty: item.qty
      })
    }

    alert("Bill Created Successfully")
    setCart([])
  }

  const printBill = () => {
    const win = window.open("", "", "width=350,height=600")

    win.document.write(`
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial; padding: 10px; }
          h2 { text-align: center; }
          .item { display:flex; justify-content:space-between; margin:5px 0; }
          .total { font-weight:bold; font-size:18px; margin-top:10px; }
        </style>
      </head>
      <body>
        <h2>INVOICE</h2>
        <p>${new Date().toLocaleString()}</p>
        <hr/>
        ${cart.map(i => `
          <div class="item">
            <span>${i.product_name} x ${i.qty}</span>
            <span>₹${i.qty * i.selling_price}</span>
          </div>
        `).join("")}
        <hr/>
        <p class="total">Total: ₹${total}</p>
      </body>
      </html>
    `)

    win.print()
    win.close()
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <div className="page-header">
          <h1>POS Billing System</h1>

          <button className="scan-btn" onClick={() => setShowScanner(true)}>
            📷 Scan Barcode
          </button>
        </div>

        {/* INPUT CARD */}
        <div className="card">
          <input
            className="input"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scan or Enter Barcode..."
          />
        </div>

        <div className="billing-grid">

          {/* CART */}
          <div className="card cart">
            <h2>Cart Items</h2>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.qty}</td>
                    <td>₹{item.selling_price}</td>
                    <td>₹{item.qty * item.selling_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUMMARY */}
          <div className="card summary">
            <h2>Bill Summary</h2>

            <div className="row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="row">
              <span>GST (18%)</span>
              <span>₹{gst}</span>
            </div>

            <div className="row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button className="btn green" onClick={checkout}>
              Generate Bill
            </button>

            <button className="btn blue" onClick={printBill}>
              Print Bill
            </button>
          </div>

        </div>
      </div>

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