import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import Billing from '../pages/Billing';
import BillHistory from '../pages/BillHistory';
import Reports from '../pages/Reports';
import Users from '../pages/Users';
import Profile from '../pages/Profile';
import EditProduct from '../pages/EditProduct';

import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

  <Route path="/" element={<Login />} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/products"
    element={
      <ProtectedRoute>
        <Products />
      </ProtectedRoute>
    }
  />

  <Route
    path="/products/add"
    element={
      <ProtectedRoute>
        <AddProduct />
      </ProtectedRoute>
    }
  />

  <Route
    path="/billing"
    element={
      <ProtectedRoute>
        <Billing />
      </ProtectedRoute>
    }
  />

  <Route
    path="/bills"
    element={
      <ProtectedRoute>
        <BillHistory />
      </ProtectedRoute>
    }
  />

  <Route
    path="/reports"
    element={
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    }
  />

  <Route
    path="/users"
    element={
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    }
  />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />


  <Route
  path="/products/edit/:id"
  element={
    <ProtectedRoute>
      <EditProduct />
    </ProtectedRoute>
  }
/>



      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes