import { Link, NavLink } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../../config/supabase"
import { useNavigate } from "react-router-dom"

import "../../styles/website/header.css"

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Products" },
  { to: "/cart", label: "Cart" },
]

const WebsiteHeader = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  const navigate = useNavigate()

  // Fetch session and cart count
  useEffect(() => {
    const fetchSessionAndCartCount = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      if (session?.user) {
        // Fetch cart item count
        const { count, error } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
        if (error) console.error('Error fetching cart count:', error)
        else setCartCount(count || 0)
      }
    }

    fetchSessionAndCartCount()

    const { subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        // Refresh cart count
        (async () => {
          const { count } = await supabase
            .from('cart_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
          setCartCount(count || 0)
        })()
      } else {
        setCartCount(0)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // ... existing scroll and menu handlers

  return (
    <header className={`website-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="website-container">
        {/* Logo and nav links */}
        <Link to="/" className="website-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-mark">🔧</span>
          <span className="logo-text">
            Neelkanth <span>Enterprises</span>
          </span>
        </Link>

        <nav className={`website-nav ${menuOpen ? "is-open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              {link.label}
              {/* Show cart count badge next to "Cart" link */}
              {link.to === "/cart" && cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </NavLink>
          ))}

          {/* Login/Logout */}
          {user ? (
            <button
              className="logout-btn"
              onClick={async () => {
                try {
                  await supabase.auth.signOut()

                  setUser(null)
                  setCartCount(0)

                  navigate("/")
                } catch (err) {
                  console.error("Logout Error:", err)
                }
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-btn" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </nav>

        {/* Hamburger menu button */}
        <button
          className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Backdrop for mobile menu */}
      <div
        className={`nav-backdrop ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    </header>
  )
}

export default WebsiteHeader