import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import { supabase } from "../config/supabase"

const AgentDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalBills: 0,
    totalCommission: 0,
    withdrawable: 0,
    locked: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("User not found")
    return
  }

  const agentId = user.id

  console.log("agentId:",agentId)

  const { data: bills } = await supabase
    .from("bills")
    .select("*")
    .eq("agent_id", agentId)

  const { data: commissions } = await supabase
    .from("commissions")
    .select("*")
    .eq("agent_id", agentId)

  const totalSales =
    bills?.reduce(
      (sum, item) =>
        sum + Number(item.grand_total),
      0
    ) || 0

  const totalBills = bills?.length || 0

  const totalCommission =
    commissions?.reduce(
      (sum, item) =>
        sum + Number(item.commission_amount),
      0
    ) || 0

  const withdrawable =
    commissions
      ?.filter(
        (x) =>
          x.status === "withdrawable"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.commission_amount),
        0
      ) || 0

  const locked =
    commissions
      ?.filter(
        (x) => x.status === "locked"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.commission_amount),
        0
      ) || 0

  setStats({
    totalSales,
    totalBills,
    totalCommission,
    withdrawable,
    locked
  })
}

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <h1>
          Agent Dashboard
        </h1>

        <div className="report-grid">

          <div className="report-card">
            <h3>Total Sales</h3>
            <h2>
              ₹
              {stats.totalSales.toFixed(
                2
              )}
            </h2>
          </div>

          <div className="report-card">
            <h3>Total Bills</h3>
            <h2>
              {stats.totalBills}
            </h2>
          </div>

          <div className="report-card">
            <h3>
              Total Commission
            </h3>
            <h2>
              ₹
              {stats.totalCommission.toFixed(
                2
              )}
            </h2>
          </div>

          <div className="report-card">
            <h3>
              Withdrawable
            </h3>
            <h2>
              ₹
              {stats.withdrawable.toFixed(
                2
              )}
            </h2>
          </div>

          <div className="report-card">
            <h3>Locked</h3>
            <h2>
              ₹
              {stats.locked.toFixed(
                2
              )}
            </h2>
          </div>

        </div>

      </div>
    </div>
  )
}

export default AgentDashboard