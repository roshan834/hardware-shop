import { Link, NavLink } from "react-router-dom"
import { useEffect, useState } from "react"

import "../../styles/website/header.css"

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Products" },
  { to: "/cart", label: "Cart" },
]

const WebsiteHeader = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12)
        ticking = false
      })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // lock background scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header className={`website-header ${scrolled ? "is-scrolled" : ""}`}>

      <div className="website-container">

        <Link
          to="/"
          className="website-logo"
          onClick={() => setMenuOpen(false)}
        >
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
            </NavLink>
          ))}

          <Link
            to="/login"
            className="login-btn"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>

        </nav>

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

      <div
        className={`nav-backdrop ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

    </header>
  )
}

export default WebsiteHeader