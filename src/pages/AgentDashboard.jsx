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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return

      const agentId = user.id

      const { data: bills } = await supabase
        .from("bills")
        .select("*")
        .eq("agent_id", agentId)

      const { data: commissions } = await supabase
        .from("commissions")
        .select("*")
        .eq("agent_id", agentId)

      const totalSales = bills?.reduce((sum, i) => sum + Number(i.grand_total), 0) || 0
      const totalBills = bills?.length || 0
      const totalCommission = commissions?.reduce((sum, i) => sum + Number(i.commission_amount), 0) || 0
      const withdrawable = commissions?.filter(x => x.status === "withdrawable").reduce((sum, i) => sum + Number(i.commission_amount), 0) || 0
      const locked = commissions?.filter(x => x.status === "locked").reduce((sum, i) => sum + Number(i.commission_amount), 0) || 0

      setStats({ totalSales, totalBills, totalCommission, withdrawable, locked })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Total Sales",
      value: `₹${stats.totalSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: "🛒",
      color: "var(--blue-600)",
      bg: "var(--blue-50)"
    },
    {
      label: "Total Bills",
      value: stats.totalBills,
      icon: "🧾",
      color: "var(--indigo-600)",
      bg: "var(--indigo-50)"
    },
    {
      label: "Total Commission",
      value: `₹${stats.totalCommission.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: "💰",
      color: "var(--green-600)",
      bg: "var(--green-50)"
    },
    {
      label: "Withdrawable",
      value: `₹${stats.withdrawable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: "✅",
      color: "#10b981",
      bg: "#d1fae5"
    },
    {
      label: "Locked",
      value: `₹${stats.locked.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: "🔒",
      color: "var(--amber-600)",
      bg: "var(--amber-50)"
    },
  ]

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <div className="page-header">
          <h1>Agent Dashboard</h1>
        </div>

        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          <div className="agent-stat-grid">
            {statCards.map((card) => (
              <div className="agent-stat-card" key={card.label}>

                <div
                  className="agent-stat-icon"
                  style={{ background: card.bg, color: card.color }}
                >
                  {card.icon}
                </div>

                <div className="agent-stat-info">
                  <span className="agent-stat-label">{card.label}</span>
                  <span className="agent-stat-value" style={{ color: card.color }}>
                    {card.value}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default AgentDashboard