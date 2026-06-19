import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({
  children,
  roles = []
}) => {
  const {
    session,
    role,
    loading
  } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

 if (!session) {
  return <Navigate to="/login" replace />
}

      if (roles.length > 0 && !roles.includes(role) ) {

      switch (role) {

        case "customer":
          return (
            <Navigate
              to="/customer"
              replace
            />
          )

        case "staff":
          return (
            <Navigate
              to="/admin/products"
              replace
            />
          )

        case "agent":
          return (
            <Navigate
              to="/agent/dashboard"
              replace
            />
          )

        case "admin":
          return (
            <Navigate
              to="/admin/dashboard"
              replace
            />
          )

        default:
          return (
            <Navigate
              to="/"
              replace
            />
          )
      }
    }

  return children
}

export default ProtectedRoute