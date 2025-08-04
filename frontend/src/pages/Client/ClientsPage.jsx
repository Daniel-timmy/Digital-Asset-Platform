import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from './Sidebar';
import Welcome from './Welcome';
import StatCards from './StatCards';
import RecentOrders from './RecentOrders';
import Orders from './Orders';
import Transactions from './Transactions';

const ClientsPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Welcome />
            <StatCards />
            <RecentOrders />
          </>
        );
      case 'orders':
        return <Orders />;
      case 'transactions':
        return <Transactions />;
      case 'logout':
        // Optional: redirect or reset state logic
        return <p className="text-lg font-semibold text-center mt-10">You have been logged out.</p>;
      default:
        return <p className="text-red-600">Invalid selection</p>;
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gray-100 font-sans">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
      <Footer />
    </div>
  );
};

export default ClientsPage;
