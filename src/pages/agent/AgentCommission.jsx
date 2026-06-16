import { useEffect, useState } from "react"
import Sidebar from "../../components/Sidebar"
import { supabase } from "../../config/supabase"

const AgentCommission = () => {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    totalCommission: 0,
    withdrawableCommission: 0,
    pendingCommission: 0,
    totalBills: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("commissions")
        .select(`
          *,
          bills (
            id,
            bill_no,
            customer_name,
            grand_total,
            bill_status,
            created_at
          )
        `)
        .eq("agent_id", user.id)
        .order("id", { ascending: false })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      setCommissions(data || [])

      const totalCommission =
        data?.reduce(
          (sum, item) =>
            sum +
            Number(item.commission_amount || 0),
          0
        ) || 0

      const withdrawableCommission =
        data
          ?.filter(
            (item) =>
              item.status ===
              "withdrawable"
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.commission_amount || 0
              ),
            0
          ) || 0

      const pendingCommission =
        data
          ?.filter(
            (item) =>
              item.status === "unpaid"
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.commission_amount || 0
              ),
            0
          ) || 0

      setStats({
        totalCommission,
        withdrawableCommission,
        pendingCommission,
        totalBills: data?.length || 0
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <div className="page-header">
          <h1>💰 My Commission</h1>
        </div>

        <div className="report-cards">

          <div className="report-card">
            <h3>Total Commission</h3>
            <p>
              ₹
              {stats.totalCommission.toFixed(
                2
              )}
            </p>
          </div>

          <div className="report-card">
            <h3>Withdrawable</h3>
            <p>
              ₹
              {stats.withdrawableCommission.toFixed(
                2
              )}
            </p>
          </div>

          <div className="report-card">
            <h3>Pending</h3>
            <p>
              ₹
              {stats.pendingCommission.toFixed(
                2
              )}
            </p>
          </div>

          <div className="report-card">
            <h3>Total Bills</h3>
            <p>{stats.totalBills}</p>
          </div>

        </div>

        <div className="card">
          <div className="table-wrapper">

            <table className="bill-table">

              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td colSpan="6">
                      Loading...
                    </td>
                  </tr>
                ) : commissions.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      No Commission Found
                    </td>
                  </tr>
                ) : (
                  commissions.map(
                    (commission) => (
                      <tr
                        key={commission.id}
                      >
                        <td>
                          {
                            commission.bills
                              ?.bill_no
                          }
                        </td>

                        <td>
                          {
                            commission.bills
                              ?.customer_name
                          }
                        </td>

                        <td>
                          ₹
                          {Number(
                            commission.bills
                              ?.grand_total ||
                              0
                          ).toFixed(2)}
                        </td>

                        <td>
                          ₹
                          {Number(
                            commission.commission_amount ||
                              0
                          ).toFixed(2)}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${commission.status}`}
                          >
                            {
                              commission.status
                            }
                          </span>
                        </td>

                        <td>
                          {commission.bills
                            ?.created_at
                            ? new Date(
                                commission.bills.created_at
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </div>
  )
}

export default AgentCommission