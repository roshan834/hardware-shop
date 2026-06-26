import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const WebsiteRoute = ({ children }) => {
  const { session, role, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  // Allow guest users
  if (!session) {
    return children
  }

  const currentRole = String(
    session.user?.app_metadata?.provider === "google"
      ? "customer"
      : role || ""
  )
    .trim()
    .toLowerCase()



  switch (currentRole) {
    case "staff":
      return <Navigate to="/admin/products" replace />

    case "admin":
      return <Navigate to="/admin/dashboard" replace />

    case "agent":
      return <Navigate to="/agent/dashboard" replace />

    default:
      return children // customer or guest
  }
}

export default WebsiteRoute