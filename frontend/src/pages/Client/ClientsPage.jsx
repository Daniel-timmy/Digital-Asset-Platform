import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Transactions from "./Transactions";
import Downloads from "./Downloads";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";

const FallbackComponent = ({ error }) => (
  <p className="text-red-600">Something went wrong: {error.message}</p>
);

const ClientsPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  function Logout() {
    localStorage.clear();
    const navigate = useNavigate();
    useEffect(() => {
      navigate("/login");
    }, [navigate]);
  }
  const tabContent = {
    dashboard: <Dashboard />,
    orders: <Orders />,
    transactions: <Transactions />,
    logout: <Logout />,
    downloads: <Downloads />,
  };
  const MemoizedHeader = React.memo(Header);
  const MemoizedFooter = React.memo(Footer);
  const renderContent = () =>
    tabContent[activeTab] || <p className="text-red-600">Invalid selection</p>;

  return (
    <div className="relative w-full min-h-screen bg-gray-100 font-sans">
      <MemoizedHeader />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8">
          <ErrorBoundary FallbackComponent={FallbackComponent}>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
      <MemoizedFooter />
    </div>
  );
};

export default ClientsPage;
