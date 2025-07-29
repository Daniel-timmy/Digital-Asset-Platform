import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../App.css';
import {
  FaBoxOpen,
  FaUsers,
  FaClipboardList,
  FaMoneyBillWave,
  FaComments
} from 'react-icons/fa';

import Dashboard from '../admin/Dashboard';
import UploadProduct from '../admin/UploadProduct';
import Customizations from '../admin/Customizations';
import Users from '../admin/Users';
import Tickets from '../admin/Tickets';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [ticketChats, setTicketChats] = useState({
    'Assets Problems': [
      { sender: 'User', message: 'My T-shirt was not delivered as expected.' },
      { sender: 'User', message: 'It had a stain on it as well.' }
    ],
    'Payment Problems': [
      { sender: 'User', message: 'My payment went through but I didn’t receive confirmation.' },
      { sender: 'User', message: 'Please check this urgently.' }
    ]
  });

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const updatedChats = [...(ticketChats[selectedTicket] || []), { sender: 'Admin', message: chatInput }];
    setTicketChats(prev => ({ ...prev, [selectedTicket]: updatedChats }));
    setChatInput('');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <UploadProduct />;
      case 'customizations':
        return <Customizations />;
      case 'users':
        return <Users />;
      case 'tickets':
        return (
          <Tickets
            ticketChats={ticketChats}
            selectedTicket={selectedTicket}
            setSelectedTicket={setSelectedTicket}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendMessage={handleSendMessage}
          />
        );
      default:
        return <p className="text-red-500">Invalid section</p>;
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gray-100 font-sans">
      <Header />
      <div className="flex">
        <aside className="w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 p-6 shadow-md min-h-screen">
          <ul className="space-y-2 text-gray-800 text-sm font-medium">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'upload', label: 'Upload Products' },
              { key: 'customizations', label: 'Customization Requests' },
              { key: 'users', label: 'View Users' },
              { key: 'tickets', label: 'Tickets' }
            ].map(tab => (
              <li
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md cursor-pointer transition ${
                  activeTab === tab.key ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
