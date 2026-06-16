import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../config/supabase"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"

const Sidebar = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { role } = useAuth()   
  const [cartCount, setCartCount] = useState(0)


    useEffect(() => {
      loadCartCount()

      const handleCartUpdate = () => {
        loadCartCount()
      }

      window.addEventListener(
        "cartUpdated",
        handleCartUpdate
      )

      return () => {
        window.removeEventListener(
          "cartUpdated",
          handleCartUpdate
        )
      }
    }, [])

      const loadCartCount = async () => {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase
          .from("cart_items")
          .select("qty")
          .eq("user_id", user.id)

        const count =
          data?.reduce(
            (sum, item) => sum + Number(item.qty || 0),
            0
          ) || 0

        setCartCount(count)
      }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  const isActive = (path) =>
    location.pathname === path ? "active-link" : ""

  const close = () => setOpen(false)

  return (
    <>
      <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? "✕" : "☰"}
      </button>

      {open && <div className="sidebar-overlay" onClick={close} />}

      <div className={`sidebar ${open ? "sidebar-open" : ""}`}>

        <div className="logo">🔩 Hardware Shop
          <div className="user-role">
          {role?.toUpperCase()}
        </div>
        
        </div>
        

        <nav>

            {/* ADMIN MENU */}
            {role === "admin" && (
              <>
                <Link
                  className={isActive("/dashboard")}
                  to="/dashboard"
                  onClick={close}
                >
                  📊 Dashboard
                </Link>

                <Link
                  className={isActive("/products")}
                  to="/products"
                  onClick={close}
                >
                  📦 Products
                </Link>

               <Link
              className={isActive("/billing")}
              to="/billing"
              onClick={close}
            >
              <div className="menu-item-with-badge">
                <span>🧾 Billing</span>

                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

                <Link
                  className={isActive("/bills")}
                  to="/bills"
                  onClick={close}
                >
                  📜 Bill History
                </Link>

                <Link
                  className={isActive("/reports")}
                  to="/reports"
                  onClick={close}
                >
                  📈 Reports
                </Link>

                <Link
                  className={isActive("/users")}
                  to="/users"
                  onClick={close}
                >
                  👥 Users
                </Link>

                <Link
                  className={isActive("/profile")}
                  to="/profile"
                  onClick={close}
                >
                  ⚙️ Profile
                </Link>
              </>
            )}

            {/* STAFF MENU */}
            {role === "staff" && (
              <>
                <Link
                  className={isActive("/products")}
                  to="/products"
                  onClick={close}
                >
                  📦 Products
                </Link>

                <Link
                  className={isActive("/billing")}
                  to="/billing"
                  onClick={close}
                >
                  🧾 Billing
                </Link>

                <Link
                  className={isActive("/bills")}
                  to="/bills"
                  onClick={close}
                >
                  📜 Bill History
                </Link>
              </>
            )}

            {/* AGENT MENU */}
            {role === "agent" && (
              <>
                <Link
                  className={isActive("/agent/dashboard")}
                  to="/agent/dashboard"
                  onClick={close}
                >
                  💰 Dashboard
                </Link>

                <Link
                  className={isActive("/agent/commission")}
                  to="/agent/commission"
                  onClick={close}
                >
                  💵 Commission
                </Link>

                <Link
                  className={isActive("/agent/bills")}
                  to="/agent/bills"
                  onClick={close}
                >
                  🧾 My Bills
                </Link>

                <Link
                  className={isActive("/profile")}
                  to="/profile"
                  onClick={close}
                >
                  👤 Profile
                </Link>
              </>
            )}

          </nav>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>

      </div>
    </>
  )
}

export default Sidebar