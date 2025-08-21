import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Landingpage from "./pages/Landingpage";
import Stock from "./pages/Stock";
import CartPage from "./pages/CartPage";
import Productdetails from "./pages/Productdetails";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoutes from "./components/ProtectedRoutes";
import VerifyPaymentPage from "./pages/VerifyPaymentPage";
import ClientsPage from "./pages/Client/ClientsPage";
import Photography from "./pages/services/Photography";
import Branding from "./pages/services/Branding";
import Socialmedia from "./pages/services/Socialmedia";
import Webdev from "./pages/services/Webdev";
import Layout from "./pages/admin/Layout";
import CustomRequest from "./pages/admin/CustomRequest";
import Tickets from "./pages/admin/Tickets";
import Users from "./pages/admin/Users";
import UploadProduct from "./pages/admin/UploadProduct";
import Bookings from "./pages/admin/Bookings";
import Transactions from "./pages/admin/Transactions";
import VerifyCode from "./pages/VerifyCode";
import ProtectedAdminRoutes from "./components/ProtectedAdminRoutes";

function Logout() {
  localStorage.clear();
  return <AuthPage />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/socialmedia" element={<Socialmedia />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="/branding" element={<Branding />} />
        <Route path="/webdev" element={<Webdev />} />
        <Route path="/" element={<Landingpage />} />
        <Route path="/verify" element={<VerifyCode />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoutes>
              <Layout />
            </ProtectedAdminRoutes>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customizations" element={<CustomRequest />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="users" element={<Users />} />
          <Route path="upload" element={<UploadProduct />} />
          <Route path="bookings/:service" element={<Bookings />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>

        <Route path="/login" element={<AuthPage />} />
        <Route path="/verify-payment" element={<VerifyPaymentPage />} />
        <Route path="/sign-up" element={<AuthPage state={false} />} />
        <Route path="/product-details/:id" element={<Productdetails />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <ClientsPage />
            </ProtectedRoutes>
          }
        />
        <Route path="/logout" element={<Logout />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </Router>
  );
}

export default App;
