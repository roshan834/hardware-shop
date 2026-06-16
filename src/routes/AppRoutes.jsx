import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import Products from "../pages/Products"
import AddProduct from "../pages/AddProduct"
import EditProduct from "../pages/EditProduct"
import ProductView from "../pages/ProductView"
import Billing from "../pages/Billing"
import BillHistory from "../pages/BillHistory"
import Reports from "../pages/Reports"
import Users from "../pages/Users"
import Profile from "../pages/Profile"
import PaymentHistory from "../pages/PaymentHistory"

import AgentDashboard from "../pages/AgentDashboard"
import AgentBills from "../pages/agent/AgentBills"
import AgentCommission from "../pages/agent/AgentCommission"

import ProtectedRoute from "../components/ProtectedRoute"

const AppRoutes = () => {
return ( <BrowserRouter> <Routes>


    {/* PUBLIC */}
    <Route
      path="/"
      element={<Login />}
    />

    {/* ADMIN + STAFF */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/products"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <Products />
        </ProtectedRoute>
      }
    />

    <Route
      path="/products/view/:id"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <ProductView />
        </ProtectedRoute>
      }
    />

    <Route
      path="/products/add"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <AddProduct />
        </ProtectedRoute>
      }
    />

    <Route
      path="/products/edit/:id"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <EditProduct />
        </ProtectedRoute>
      }
    />

    <Route
      path="/billing"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <Billing />
        </ProtectedRoute>
      }
    />

    <Route
      path="/bills"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <BillHistory />
        </ProtectedRoute>
      }
    />

    {/* ADMIN ONLY */}

    <Route
      path="/users"
      element={
        <ProtectedRoute
          roles={["admin"]}
        >
          <Users />
        </ProtectedRoute>
      }
    />

    <Route
      path="/reports"
      element={
        <ProtectedRoute
          roles={["admin"]}
        >
          <Reports />
        </ProtectedRoute>
      }
    />

    <Route
      path="/profile"
      element={
        <ProtectedRoute
          roles={["admin"]}
        >
          <Profile />
        </ProtectedRoute>
      }
    />

    {/* PAYMENT HISTORY */}

    <Route
      path="/payment-history/:billId"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <PaymentHistory />
        </ProtectedRoute>
      }
    />

    {/* AGENT */}

    <Route
      path="/agent/dashboard"
      element={
        <ProtectedRoute
          roles={["agent"]}
        >
          <AgentDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/agent/bills"
      element={
        <ProtectedRoute
          roles={["agent"]}
        >
          <AgentBills />
        </ProtectedRoute>
      }
    />

    <Route
      path="/agent/commission"
      element={
        <ProtectedRoute
          roles={["agent"]}
        >
          <AgentCommission />
        </ProtectedRoute>
      }
    />

  </Routes>
</BrowserRouter>


)
}

export default AppRoutes
