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
    return <Navigate to="/" replace />
  }

  if (
    roles.length > 0 &&
    !roles.includes(role)
  ) {
    if (role === "agent") {
      return (
        <Navigate
          to="/agent/dashboard"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute