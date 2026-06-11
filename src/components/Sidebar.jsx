import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path ? "active-link" : "";

  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Dark overlay behind sidebar */}
      {open && <div className="sidebar-overlay" onClick={close} />}

      <div className={`sidebar ${open ? "sidebar-open" : ""}`}>

        <div className="logo">🔩 Hardware Shop</div>

        <nav>
          <Link className={isActive("/dashboard")} to="/dashboard" onClick={close}>
            📊 Dashboard
          </Link>
          <Link className={isActive("/products")} to="/products" onClick={close}>
            📦 Products
          </Link>
          <Link className={isActive("/billing")} to="/billing" onClick={close}>
            🧾 Billing
          </Link>
          <Link className={isActive("/bills")} to="/bills" onClick={close}>
            📜 Bill History
          </Link>
          <Link className={isActive("/reports")} to="/reports" onClick={close}>
            📈 Reports
          </Link>
          <Link className={isActive("/users")} to="/users" onClick={close}>
            👥 Users
          </Link>
          <Link className={isActive("/profile")} to="/profile" onClick={close}>
            ⚙️ Profile
          </Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>

      </div>
    </>
  );
};

export default Sidebar;