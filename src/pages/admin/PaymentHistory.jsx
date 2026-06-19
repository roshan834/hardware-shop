import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Sidebar from "../../components/Sidebar"
import { supabase } from "../../config/supabase"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const PaymentHistory = () => {
  const { billId } = useParams()
  const navigate = useNavigate()

  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBill()
  }, [])

        const handleDownloadPDF = () => {
  if (!bill) return

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // =========================
  // HEADER (CENTER)
  // =========================
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("NEELKANTH ENTERPRISES", pageWidth / 2, 15, { align: "center" })

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Kandivali West, Mumbai", pageWidth / 2, 21, { align: "center" })
  doc.text("Mobile: 8286357442", pageWidth / 2, 26, { align: "center" })
  doc.text("Email: contact.webtechgenz@gmail.com", pageWidth / 2, 31, { align: "center" })

  // dashed line
  doc.setLineDash([2, 2], 0)
  doc.line(10, 35, pageWidth - 10, 35)
  doc.setLineDash([])

  // =========================
  // TITLE
  // =========================
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("TAX INVOICE", pageWidth / 2, 42, { align: "center" })

  // =========================
  // INVOICE INFO ROW
  // =========================
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  doc.text(`Invoice No: ${bill.bill_no}`, 10, 50)
  doc.text(
    `Date: ${new Date(bill.created_at).toLocaleString()}`,
    pageWidth - 10,
    50,
    { align: "right" }
  )

  // dashed line
  doc.setLineDash([2, 2], 0)
  doc.line(10, 54, pageWidth - 10, 54)
  doc.setLineDash([])

  // =========================
  // ITEMS TABLE (MATCH STYLE)
  // =========================
  const tableData =
    bill.items?.map((item) => [
      item.products?.product_name || "Item",
      item.qty,
      `₹${Number(item.price).toFixed(2)}`,
      `₹${(item.qty * item.price).toFixed(2)}`
    ]) || []

  autoTable(doc, {
    startY: 60,
    head: [["Item", "Qty", "Rate", "Amount"]],
    body: tableData,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      textColor: 0,
      fontStyle: "bold",
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
    },
    bodyStyles: {
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
    },
  })

  // =========================
  // SUMMARY SECTION
  // =========================
  const finalY = doc.lastAutoTable.finalY + 10

  const cgst = Number(bill.gst) / 2
  const sgst = Number(bill.gst) / 2

  doc.setFontSize(10)

  doc.text(`Subtotal`, 130, finalY)
  doc.text(`₹${Number(bill.subtotal).toFixed(2)}`, 180, finalY, { align: "right" })

  doc.text(`CGST (9%)`, 130, finalY + 6)
  doc.text(`₹${cgst.toFixed(2)}`, 180, finalY + 6, { align: "right" })

  doc.text(`SGST (9%)`, 130, finalY + 12)
  doc.text(`₹${sgst.toFixed(2)}`, 180, finalY + 12, { align: "right" })

  // line above total
  doc.line(130, finalY + 15, 200, finalY + 15)

  // GRAND TOTAL
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")

  doc.text(`Grand Total`, 130, finalY + 22)
  doc.text(
    `₹${Number(bill.grand_total).toFixed(2)}`,
    180,
    finalY + 22,
    { align: "right" }
  )

  // =========================
  // FOOTER
  // =========================
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")

  doc.text("Total Items: " + bill.items.length, 10, finalY + 35)
  doc.text(
    "Total Qty: " +
      bill.items.reduce((s, i) => s + i.qty, 0),
    10,
    finalY + 40
  )

  doc.text("• Goods once sold will not be taken back.", 10, finalY + 50)
  doc.text("• Please retain invoice for warranty.", 10, finalY + 55)
  doc.text("• Thank you for shopping with us.", 10, finalY + 60)

  doc.setFont("helvetica", "bold")
  doc.text("NEELKANTH ENTERPRISES", pageWidth / 2, finalY + 75, {
    align: "center",
  })

  doc.save(`Invoice_${bill.bill_no}.pdf`)
}

const fetchBill = async () => {
  const { data: billData, error: billError } = await supabase
    .from("bills")
    .select("*")
    .eq("id", billId)
    .single()

  if (billError) {
    setLoading(false)
    return
  }

  const { data: items, error: itemError } = await supabase
    .from("bill_items")
    .select(`
      qty,
      price,
      product_id,
      products (
        product_name
      )
    `)
    .eq("bill_id", billId)

  if (!itemError) {
    billData.items = items
  }

  setBill(billData)
  setLoading(false)
}

  const pendingAmount = bill?.pending_amount ?? 0

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        {/* ── Header ── */}
        <div className="page-header">

            <div className="header-left">
                <h1>Payment History</h1>
                {bill && (
                    <span className="header-sub">Bill #{bill.bill_no}</span>
                )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn-back" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <button
                    className="download-btn"
                    onClick={handleDownloadPDF}
                >
                    ⬇ Download PDF
                </button>
                </div>
          <div className="header-left">
            <h1>Payment History</h1>
            {bill && (
              <span className="header-sub">
                Bill #{bill.bill_no}
              </span>
            )}
          </div>
          
        </div>

        {loading ? (
          <div className="loader">Loading…</div>
        ) : !bill ? (
          <div className="card" style={{ textAlign: "center", color: "var(--gray-400)", padding: "40px" }}>
            Bill not found.
          </div>
        ) : (
          <>

            {/* ── Bill Summary Card ── */}
            <div className="card" style={{ marginBottom: "20px" }}>
              <h2 style={{ marginBottom: "16px", fontSize: "17px" }}>
                Bill Summary
              </h2>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px"
              }}>

                <SummaryField label="Bill No"      value={bill.bill_no} />
                <SummaryField label="Customer"     value={bill.customer_name || "Walk-In Customer"} />
                <SummaryField label="Phone"        value={bill.customer_phone || "—"} />
                <SummaryField
                  label="Grand Total"
                  value={`₹${bill.grand_total}`}
                  valueStyle={{ color: "var(--gray-900)", fontWeight: 700 }}
                />
                <SummaryField
                  label="Paid"
                  value={`₹${bill.paid_amount}`}
                  valueStyle={{ color: "var(--green-600)", fontWeight: 700 }}
                />
                <SummaryField
                  label="Pending"
                  value={`₹${pendingAmount}`}
                  valueStyle={{
                    color: pendingAmount > 0 ? "var(--red-500)" : "var(--green-600)",
                    fontWeight: 700
                  }}
                />

              </div>
            </div>

            {/* ── Payment Logs Card ── */}
           <div className="card">
  <h2 style={{ marginBottom: "16px", fontSize: "17px" }}>
    Payment Logs
  </h2>

  {/* ================= DESKTOP TABLE ================= */}
  <div className="table-wrapper desktop-only">
    <table className="bill-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Amount</th>
          <th>Mode</th>
          <th>Note</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>
        {bill.payment_logs?.length > 0 ? (
          bill.payment_logs.map((log, index) => (
            <tr key={index}>
              <td>{index + 1}</td>

              <td style={{ fontWeight: 600, color: "green" }}>
                ₹{log.amount}
              </td>

              <td>
                <span className={`payment-badge ${log.payment_mode?.toLowerCase()}`}>
                  {log.payment_mode}
                </span>
              </td>

              <td style={{ color: "#6b7280" }}>
                {log.note || "—"}
              </td>

              <td style={{ color: "#6b7280" }}>
                {new Date(log.date).toLocaleString()}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" style={{ textAlign: "center", padding: "30px" }}>
              No payment logs recorded yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* ================= MOBILE CARDS ================= */}
  <div className="mobile-only payment-cards">

    {bill.payment_logs?.length > 0 ? (
      bill.payment_logs.map((log, index) => (
        <div className="payment-card" key={index}>

          <div className="payment-card-header">
            <span>#{index + 1}</span>

            <span className={`payment-badge ${log.payment_mode?.toLowerCase()}`}>
              {log.payment_mode}
            </span>
          </div>

          <div className="payment-row">
            <span>Amount</span>
            <strong style={{ color: "green" }}>
              ₹{log.amount}
            </strong>
          </div>

          <div className="payment-row">
            <span>Note</span>
            <span>{log.note || "—"}</span>
          </div>

          <div className="payment-row">
            <span>Date</span>
            <span>{new Date(log.date).toLocaleString()}</span>
          </div>

        </div>
      ))
    ) : (
      <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
        No payment logs recorded yet.
      </div>
    )}

  </div>
</div>
          </>
        )}

      </div>
    </div>
  )
}

/* ── Small helper component ── */
const SummaryField = ({ label, value, valueStyle = {} }) => (
  <div style={{
    background: "var(--gray-50)",
    border: "1px solid var(--gray-200)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  }}>
    <span style={{
      fontSize: "10px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".7px",
      color: "var(--gray-400)"
    }}>
      {label}
    </span>
    <span style={{
      fontSize: "15px",
      fontWeight: 500,
      color: "var(--gray-900)",
      ...valueStyle
    }}>
      {value}
    </span>
  </div>
)

export default PaymentHistory