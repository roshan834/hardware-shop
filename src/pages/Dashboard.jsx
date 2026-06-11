import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { supabase } from "../config/supabase"

const Dashboard = () => {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    todaySales: 0,
    monthlySales: 0
  })

  const todaySales = async () => {
  const { data } = await supabase
    .from("sales")
    .select("*")
    .gte("created_at", new Date().toISOString().split("T")[0])

  return data
}

  const loadStats = async () => {
    try {
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })

      const { data: products } = await supabase
        .from("products")
        .select("quantity, reorder_level")

      const lowStock =
        products?.filter(p => p.quantity <= p.reorder_level).length || 0

      const today = new Date().toISOString().slice(0, 10)
      const month = today.slice(0, 7)

      const { data: sales } = await supabase
        .from("sales")
        .select("total_amount, created_at")

      let todaySales = 0
      let monthlySales = 0

      if (sales) {
        sales.forEach(s => {
          const date = s.created_at?.slice(0, 10)
          const mon = s.created_at?.slice(0, 7)

          if (date === today) todaySales += Number(s.total_amount)
          if (mon === month) monthlySales += Number(s.total_amount)
        })
      }

      setStats({
        totalProducts: totalProducts || 0,
        lowStock,
        todaySales,
        monthlySales
      })

    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <h1>Dashboard</h1>

        <div className="cards">

          <div
            className="card clickable"
            onClick={() => navigate("/products?filter=all")}
          >
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>

          <div
            className="card clickable"
            onClick={() => navigate("/products?filter=lowstock")}
          >
            <h3>Low Stock</h3>
            <p>{stats.lowStock}</p>
          </div>

          <div
            className="card clickable"
            onClick={() => navigate("/products?filter=today")}
          >
            <h3>Today's Sales</h3>
            <p>₹{stats.todaySales}</p>
          </div>

          <div
            className="card clickable"
            onClick={() => navigate("/products?filter=monthly")}
          >
            <h3>Monthly Sales</h3>
            <p>₹{stats.monthlySales}</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard