import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import BarcodeScanner from "../components/BarcodeScanner"
import { supabase } from "../config/supabase"

const Billing = () => {
  const navigate = useNavigate()

  const [cart, setCart] = useState([])
  const [barcode, setBarcode] = useState("")
  const [showScanner, setShowScanner] = useState(false)

  // ================= FETCH PRODUCT =================
  const getProductByBarcode = async (code) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", code)
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
  const handleScan = (code) => {
    handleSearch(code)
  }


  // ========= Checkout ============


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

  // billing 



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
  
  // ================= TOTALS =================
  const subtotal = cart.reduce(
    (sum, i) => sum + i.selling_price * i.qty,
    0
  )

  const gst = subtotal * 0.18
  const total = subtotal + gst

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
              {cart.length === 0 ? (
                <tr>
                  <td colSpan="4">No products added</td>
                </tr>
              ) : (
                cart.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => {
                          const qty = Number(e.target.value)

                          setCart((prev) =>
                            prev.map((p) =>
                              p.id === item.id ? { ...p, qty } : p
                            )
                          )
                        }}
                      />
                    </td>

                    <td>₹{item.selling_price}</td>

                    <td>₹{item.qty * item.selling_price}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* SUMMARY */}
        <div className="card">
          <h2>Bill Summary</h2>

          <p>Subtotal: ₹{subtotal}</p>
          <p>GST (18%): ₹{gst.toFixed(2)}</p>
          <h3>Total: ₹{total.toFixed(2)}</h3>


            <button className="btn green" onClick={checkout}>
              Generate Bill
            </button>

            <button className="btn blue" onClick={printBill}>
              Print Bill
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