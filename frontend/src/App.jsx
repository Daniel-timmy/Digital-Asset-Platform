import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Landingpage from "./pages/Landingpage";
import Stock from "./pages/Stock";
import CartPage from "./pages/CartPage";
import Productdetails from "./pages/Productdetails";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/admin/AdminPage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import VerifyPaymentPage from "./pages/VerifyPaymentPage";

function Logout() {
  localStorage.clear();
  return <AuthPage />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/verify-payment" element={<VerifyPaymentPage />} />
        <Route path="/sign-up" element={<AuthPage state={false} />} />
        <Route path="/product-details/:id" element={<Productdetails />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
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
