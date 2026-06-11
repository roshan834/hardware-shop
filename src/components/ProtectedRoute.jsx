import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { session, role, loading } = useAuth()

  if (loading) return <div className="loader">Loading...</div>

  // not logged in → go to login
  if (!session) return <Navigate to="/" />

  // staff trying to access admin-only page → go to products
  if (adminOnly && role !== "admin") return <Navigate to="/products" />

  return children
}

export default ProtectedRoute