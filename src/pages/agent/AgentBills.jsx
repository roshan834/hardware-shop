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

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", {
          ascending: false
        })

      if (error) {
        console.error(error)
        return
      }

      setBills(data || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">

      <Sidebar />

      <div className="content">

        <div className="page-header">
          <h1>📋 My Bills</h1>
        </div>

        <div className="card">

          <div className="table-wrapper">

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

                {loading ? (
                  <tr>
                    <td colSpan="5">
                      Loading...
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      No Bills Found
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id}>

                      <td>{bill.bill_no}</td>

                      <td>
                        {bill.customer_name || "-"}
                      </td>

                      <td>
                        ₹
                        {Number(
                          bill.grand_total || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${bill.bill_status}`}
                        >
                          {bill.bill_status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          bill.created_at
                        ).toLocaleDateString()}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  )
}

export default AgentBills