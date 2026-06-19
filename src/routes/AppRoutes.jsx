import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "../pages/admin/Login"
import Dashboard from "../pages/admin/Dashboard"
import Products from "../pages/admin/Products"
import AddProduct from "../pages/admin/AddProduct"
import EditProduct from "../pages/admin/EditProduct"
import ProductView from "../pages/admin/ProductView"
import Billing from "../pages/admin/Billing"
import BillHistory from "../pages/admin/BillHistory"
import Reports from "../pages/admin/Reports"
import Users from "../pages/admin/Users"
import Profile from "../pages/admin/Profile"
import PaymentHistory from "../pages/admin/PaymentHistory"

import AgentDashboard from "../pages/agent/AgentDashboard"
import AgentBills from "../pages/agent/AgentBills"
import AgentCommission from "../pages/agent/AgentCommission"

import CustomerDashboard from "../pages/customer/CustomerDashboard"
import Home from "../pages/website/Home"
import Shop from "../pages/website/Products"
// import ProductDetails from "../pages/website/ProductDetails"
// import Cart from "../pages/website/Cart"

import ProtectedRoute from "../components/ProtectedRoute"

const AppRoutes = () => {
return ( <BrowserRouter> <Routes>


    {/* PUBLIC */}
   {/* WEBSITE */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/shop"
        element={<Shop />}
      />

      {/* <Route
        path="/product/:id"
        element={<ProductDetails />}
      />

      <Route
        path="/cart"
        element={<Cart />}
      /> */}

      <Route
        path="/login"
        element={<Login />}
      />

    {/* ADMIN + STAFF */}
    <Route
      path="/admin/dashboard"
      element={
        <ProtectedRoute
          roles={["admin"]}
        >
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/products"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <Products />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/products/view/:id"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <ProductView />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/products/add"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <AddProduct />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/products/edit/:id"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <EditProduct />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/billing"
      element={
        <ProtectedRoute
          roles={["admin", "staff"]}
        >
          <Billing />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/bills"
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
      path="/admin/users"
      element={
        <ProtectedRoute
          roles={["admin"]}
        >
          <Users />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/reports"
      element={
        <ProtectedRoute
          roles={["admin"]}
        >
          <Reports />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/profile"
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
      path="/admin/payment-history/:billId"
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


    {/* =================customer route ====================== */}

      <Route
        path="/customer"
        element={
          <ProtectedRoute
            roles={["customer"]}
          >
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />


  </Routes>
</BrowserRouter>


)
}

export default AppRoutes
