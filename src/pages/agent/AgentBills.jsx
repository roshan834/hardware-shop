import { useEffect, useState } from "react"
import Sidebar from "../../components/Sidebar"
import { supabase } from "../../config/supabase"

const AgentBills = () => {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBills()
  }, [])

  const loadBills = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false })

      if (error) { console.error(error); return }
      setBills(data || [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <div className="loader">Loading...</div>
      </div>
    </div>
  )

  return (
    <div className="layout">
      <Sidebar />
      <div className="content">

        <div className="page-header">
          <h1>📋 My Bills</h1>
        </div>

        {bills.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--gray-400)" }}>
            No Bills Found
          </div>
        ) : (
          <>
            {/* ===== DESKTOP TABLE ===== */}
            <div className="table-container desktop-only">
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>Bill No</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.bill_no}</td>
                      <td>{bill.customer_name || "—"}</td>
                      <td>₹{Number(bill.grand_total || 0).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${bill.bill_status}`}>
                          {bill.bill_status}
                        </span>
                      </td>
                      <td>{new Date(bill.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== MOBILE CARDS ===== */}
            <div className="mobile-only bill-cards">
              {bills.map((bill) => (
                <div key={bill.id} className="bill-card">

                  <div className="bill-card-header">
                    <span className="bill-card-no">{bill.bill_no}</span>
                    <span className={`status-badge ${bill.bill_status}`}>
                      {bill.bill_status}
                    </span>
                  </div>

                  <div className="bill-card-row">
                    <span className="bill-card-label">Customer</span>
                    <span className="bill-card-value">{bill.customer_name || "Walk-In"}</span>
                  </div>

                  <div className="bill-card-row">
                    <span className="bill-card-label">Total</span>
                    <span className="bill-card-value bill-card-total">
                      ₹{Number(bill.grand_total || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="bill-card-row">
                    <span className="bill-card-label">Date</span>
                    <span className="bill-card-value">
                      {new Date(bill.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default AgentBills