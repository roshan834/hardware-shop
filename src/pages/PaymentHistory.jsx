import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { supabase } from "../config/supabase"

const PaymentHistory = () => {
  const { billId } = useParams()
  const navigate = useNavigate()

  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBill()
  }, [])

  const fetchBill = async () => {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("id", billId)
      .single()

    if (!error) setBill(data)
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
              <span className="header-sub">
                Bill #{bill.bill_no}
              </span>
            )}
          </div>
          <button
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
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

              {/* scroll wrapper fixes mobile overflow */}
              <div className="table-wrapper">
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
                          <td style={{ fontWeight: 600, color: "var(--green-600)" }}>
                            ₹{log.amount}
                          </td>
                          <td>
                            <span className={`payment-badge ${log.payment_mode?.toLowerCase()}`}>
                              {log.payment_mode}
                            </span>
                          </td>
                          <td style={{ color: "var(--gray-500)" }}>
                            {log.note || "—"}
                          </td>
                          <td style={{ color: "var(--gray-500)" }}>
                            {new Date(log.date).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                            color: "var(--gray-400)",
                            padding: "32px",
                          }}
                        >
                          No payment logs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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