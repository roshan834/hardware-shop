import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login       from '../pages/Login'
import Dashboard   from '../pages/Dashboard'
import Products    from '../pages/Products'
import AddProduct  from '../pages/AddProduct'
import EditProduct from '../pages/EditProduct'
import ProductView from '../pages/ProductView'
import Billing     from '../pages/Billing'
import BillHistory from '../pages/BillHistory'
import Reports     from '../pages/Reports'
import Users       from '../pages/Users'
import Profile     from '../pages/Profile'

import ProtectedRoute from '../components/ProtectedRoute'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Admin only */}
        <Route path="/dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute adminOnly={true}>
            <Users />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute adminOnly={true}>
            <Profile />
          </ProtectedRoute>
        } />

        {/* All roles */}
        <Route path="/products" element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } />

        <Route path="/products/view/:id" element={
          <ProtectedRoute>
            <ProductView />
          </ProtectedRoute>
        } />

        <Route path="/products/add" element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        } />

        <Route path="/products/edit/:id" element={
          <ProtectedRoute>
            <EditProduct />
          </ProtectedRoute>
        } />

        <Route path="/billing" element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        } />

        <Route path="/bills" element={
          <ProtectedRoute>
            <BillHistory />
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes