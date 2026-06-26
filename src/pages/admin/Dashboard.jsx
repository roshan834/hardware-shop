import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/Sidebar"
import { supabase } from "../../config/supabase"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"
import {
  FiBox,
  FiAlertTriangle,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiPieChart
} from "react-icons/fi"

import {
  MdOutlinePayment,
  MdOutlineShoppingCart
} from "react-icons/md"


const Dashboard = () => {
  const navigate = useNavigate()

 const [stats, setStats] = useState({
  totalProducts: 0,
  lowStock: 0,
  todaySales: 0,
  monthlySales: 0,
  totalAgents: 0,
  agentSales: 0,
  agentBusinessPercent: 0,cashPercent: 0,
  upiPercent: 0,
  partialPercent: 0
  })

  const [salesChart, setSalesChart] = useState([])

  const loadStats = async () => {
  try {
    const { data: bills } = await supabase
      .from("bills")
      .select(`
        grand_total,
        created_at,
        agent_id,
        payment_mode
      `)

    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    const { data: products } = await supabase
      .from("products")
      .select("quantity,reorder_level")
      .eq("is_active", true)

    const { count: totalAgents } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "agent")

    // 📅 DATE HELPERS
    const today = new Date().toISOString().slice(0, 10)
    const month = today.slice(0, 7)

    let todaySales = 0
    let monthlySales = 0
    let agentSales = 0

    let cashSales = 0
    let upiSales = 0
    let partialSales = 0

    const chartMap = {}

    // 🔥 SINGLE LOOP (OPTIMIZED)
    bills?.forEach((bill) => {
      const amount = Number(bill.grand_total || 0)
      const date = bill.created_at?.slice(0, 10)
      const mon = bill.created_at?.slice(0, 7)

      // sales
      if (date === today) todaySales += amount
      if (mon === month) monthlySales += amount
      if (bill.agent_id) agentSales += amount

      // chart
      chartMap[date] = (chartMap[date] || 0) + amount

      // payment modes
      if (bill.payment_mode === "cash") cashSales += amount
      if (bill.payment_mode === "upi") upiSales += amount
      if (bill.payment_mode === "partial") partialSales += amount
    })

    // 📊 CHART DATA
    const salesChartData = Object.entries(chartMap).map(([date, sales]) => ({
      date,
      sales: Number(sales.toFixed(2))
    }))

    setSalesChart(salesChartData)

    // 📦 LOW STOCK
    const lowStock =
      products?.filter(
        p => p.quantity <= p.reorder_level
      ).length || 0

    // 📊 TOTAL SALES
    const totalSales = cashSales + upiSales + partialSales

    // 📈 PERCENTAGES (ROUND 2 DECIMALS)
    const cashPercent = totalSales
      ? Number(((cashSales / totalSales) * 100).toFixed(2))
      : 0

    const upiPercent = totalSales
      ? Number(((upiSales / totalSales) * 100).toFixed(2))
      : 0

    const partialPercent = totalSales
      ? Number(((partialSales / totalSales) * 100).toFixed(2))
      : 0

    const agentBusinessPercent = monthlySales
      ? Number(((agentSales / monthlySales) * 100).toFixed(2))
      : 0

    // 🧠 FINAL STATE
    setStats({
      totalProducts: totalProducts || 0,
      lowStock,
      todaySales: Number(todaySales.toFixed(2)),
      monthlySales: Number(monthlySales.toFixed(2)),
      totalAgents: totalAgents || 0,
      agentSales: Number(agentSales.toFixed(2)),
      agentBusinessPercent,
      cashPercent,
      upiPercent,
      partialPercent
    })

  } catch (err) {
    console.error("Stats Error:", err)
  }
}


  const todaySales = async () => {
  const { data } = await supabase
    .from("sales")
    .select("*")
    .gte("created_at", new Date().toISOString().split("T")[0])

  return data
}

  

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <h1>Dashboard</h1>

        <div className="cards-grid">

  {/* Total Products */}
  <div
    className="card kpi-card clickable"
    onClick={() => navigate("/admin/products?filter=all")}
  >
    <div className="card-top">
      <FiBox className="card-icon blue" />
    </div>
    <div className="card-title">Total Products</div>
    <div className="card-value">{stats.totalProducts}</div>
  </div>

  {/* Low Stock */}
  <div
    className="card warning clickable"
    onClick={() => navigate("/admin/products?filter=lowstock")}
  >
    <div className="card-top">
      <FiAlertTriangle className="card-icon orange" />
    </div>
    <div className="card-title">Low Stock</div>
    <div className="card-value">{stats.lowStock}</div>
  </div>

  {/* Today's Sales */}
  <div
    className="card success clickable"
    onClick={() => navigate("/admin/products?filter=today")}
  >
    <div className="card-top">
      <FiDollarSign className="card-icon green" />
    </div>
    <div className="card-title">Today's Sales</div>
    <div className="card-value">₹{stats.todaySales}</div>
  </div>

  {/* Monthly Sales */}
  <div
    className="card primary clickable"
    onClick={() => navigate("/admin/products?filter=monthly")}
  >
    <div className="card-top">
      <FiTrendingUp className="card-icon blue" />
    </div>
    <div className="card-title">Monthly Sales</div>
    <div className="card-value">₹{stats.monthlySales}</div>
  </div>

  {/* Total Agents */}
  <div className="card purple">
    <div className="card-top">
      <FiUsers className="card-icon purple" />
    </div>
    <div className="card-title">Total Agents</div>
    <div className="card-value">{stats.totalAgents}</div>
  </div>

  {/* Agent Sales */}
  <div className="card pink">
    <div className="card-top">
      <MdOutlineShoppingCart className="card-icon pink" />
    </div>
    <div className="card-title">Agent Sales</div>
    <div className="card-value">
      ₹{stats.agentSales.toFixed(2)}
    </div>
  </div>

  {/* Agent Business % */}
  <div className="card kpi-card">
    <div className="card-top">
      <FiPieChart className="card-icon blue" />
    </div>
    <div className="card-title">Agent Business %</div>
    <div className="card-value">
      {stats.agentBusinessPercent}%
    </div>
  </div>

  {/* Cash Payment */}
  <div className="card success">
    <div className="card-top">
      <MdOutlinePayment className="card-icon green" />
    </div>
    <div className="card-title">Cash Payment</div>
    <div className="card-value">
      💵 {stats.cashPercent}%
    </div>
  </div>

  {/* UPI Payment */}
  <div className="card primary">
    <div className="card-top">
      <MdOutlinePayment className="card-icon blue" />
    </div>
    <div className="card-title">UPI Payment</div>
    <div className="card-value">
      📱 {stats.upiPercent}%
    </div>
  </div>

  {/* Partial Payment */}
  <div className="card warning">
    <div className="card-top">
      <MdOutlinePayment className="card-icon orange" />
    </div>
    <div className="card-title">Partial Payment</div>
    <div className="card-value">
      🧾 {stats.partialPercent}%
    </div>
  </div>

</div>

        <div className="card chart-card">
            <h3>Sales Trend</h3>

            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <LineChart
                data={salesChart}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

      </div>
    </div>
  )
}

export default Dashboard