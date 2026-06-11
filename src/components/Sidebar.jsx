import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active-link" : "";
  };

  return (
    <div className="sidebar">

      <div className="logo">
        🔩 Hardware Shop
      </div>

      <nav>
        <Link className={isActive("/dashboard")} to="/dashboard">
          📊 Dashboard
        </Link>

        <Link className={isActive("/products")} to="/products">
          📦 Products
        </Link>

        <Link className={isActive("/billing")} to="/billing">
          🧾 Billing
        </Link>

        <Link className={isActive("/bills")} to="/bills">
          📜 Bill History
        </Link>

        <Link className={isActive("/reports")} to="/reports">
          📈 Reports
        </Link>

        <Link className={isActive("/users")} to="/users">
          👥 Users
        </Link>

        <Link className={isActive("/profile")} to="/profile">
          ⚙️ Profile
        </Link>
      </nav>

      <button
        className="logout-btn"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;