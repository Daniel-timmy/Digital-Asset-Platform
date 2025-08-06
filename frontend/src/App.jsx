import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Landingpage from "./pages/Landingpage";
import Stock from "./pages/Stock";
import CartPage from "./pages/CartPage";
import Productdetails from "./pages/productdetails";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/admin/AdminPage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import ClientsPage from "./pages/Client/ClientsPage";
import Photography from './pages/services/Photography';
import Branding from './pages/services/Branding';
import Socialmedia from './pages/services/Socialmedia';
import Webdev from "./pages/services/Webdev";

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
        <Route path="/client" element={<ClientsPage />} />
        <Route path="/" element={<Landingpage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/sign-up" element={<AuthPage state={false} />} />
        <Route path="/product-details" element={<Productdetails />} />
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
