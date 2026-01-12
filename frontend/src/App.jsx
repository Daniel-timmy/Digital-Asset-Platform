import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Client/Dashboard";
import ClientsTickets from "./pages/Client/ClientsTickets";
import ClientsOrders from "./pages/Client/ClientsOrders";
import CLientsTransactions from "./pages/Client/ClientsTransactions";
import Landingpage from "./pages/Landingpage";
import Stock from "./pages/Stock";
import CartPage from "./pages/CartPage";
import Productdetails from "./pages/Productdetails";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoutes from "./components/ProtectedRoutes";
import VerifyPaymentPage from "./pages/VerifyPaymentPage";
import Layout from "./pages/admin/Layout";
import Tickets from "./pages/admin/Tickets";
import Users from "./pages/admin/Users";
import UploadProduct from "./pages/admin/UploadProduct";
import Transactions from "./pages/admin/Transactions";
import VerifyCode from "./pages/VerifyCode";
import ProtectedAdminRoutes from "./components/ProtectedAdminRoutes";
import Downloads from "./pages/Client/Downloads";
import ClientsLayout from "./pages/Client/ClientsLayout";
import NotFound from "./pages/NotFound";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import CreatorTickets from "./pages/creator/CreatorTickets";
import CreatorUploadProduct from "./pages/creator/CreatorUploadProduct";
import CreatorProfile from "./pages/creator/CreatorProfile";
import CreatorTransactions from "./pages/creator/CreatorTransactions";
import ProtectedCreatorRoutes from "./components/ProtectedCreatorRoutes";
import CreatorLayout from "./pages/creator/CreatorLayout";
import Categories from "./pages/Categories";
import CreatorsPage from "./pages/CreatorsPage";
import ClientProfile from "./pages/Client/ClientProfile";

function Logout() {
  localStorage.clear();
  return <AuthPage />;
}

function App() {
  return (
    <Router>
      <Routes>
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
          <Route path="tickets" element={<Tickets />} />
          <Route path="users" element={<Users />} />
          <Route path="upload" element={<UploadProduct />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
        <Route
          path="/creator"
          element={
            <ProtectedCreatorRoutes>
              <CreatorLayout />
            </ProtectedCreatorRoutes>
          }
        >
          <Route index element={<CreatorDashboard />} />
          <Route path="dashboard" element={<CreatorDashboard />} />
          <Route path="tickets" element={<CreatorTickets />} />
          <Route path="upload" element={<CreatorUploadProduct />} />
          <Route path="transactions" element={<CreatorTransactions />} />
          <Route path="profile" element={<CreatorProfile />} />
        </Route>

        <Route path="/login" element={<AuthPage />} />
        <Route path="/verify-payment" element={<VerifyPaymentPage />} />
        <Route path="/sign-up" element={<AuthPage state={false} />} />
        <Route path="/product-details/:id" element={<Productdetails />} />
        <Route path="/creator-profile/:id" element={<CreatorsPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <ClientsLayout />
            </ProtectedRoutes>
          }
        >
          <Route index element={<Dashboard />} />

          {/* <Route path="orders" element={<ClientsOrders />} /> */}
          <Route path="downloads" element={<Downloads />} />
          <Route path="transactions" element={<CLientsTransactions />} />
          <Route path="tickets" element={<ClientsTickets />} />
          <Route path="profile" element={<ClientProfile />} />
        </Route>

        <Route path="/logout" element={<Logout />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
