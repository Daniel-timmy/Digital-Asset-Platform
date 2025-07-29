import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../App.css';
import { FaBoxOpen, FaUsers, FaClipboardList, FaMoneyBillWave, FaComments } from 'react-icons/fa';

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

  const renderChat = () => {
    if (!selectedTicket) {
      return <p className="text-gray-600 italic mt-4">Select a ticket to view conversation.</p>;
    }

    const chats = ticketChats[selectedTicket] || [];

    return (
      <div className="mt-6">
        <div className="h-64 overflow-y-auto bg-white p-4 rounded-md shadow-inner space-y-2 border border-gray-200">
          {chats.map((chat, i) => (
            <div
              key={i}
              className={`max-w-xs p-2 rounded-md text-sm ${
                chat.sender === 'Admin'
                  ? 'bg-black text-white self-end ml-auto'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <strong>{chat.sender}: </strong> {chat.message}
            </div>
          ))}
        </div>
        <div className="flex mt-4 gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-md"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type your response..."
          />
          <button
            className="px-4 py-2 bg-black text-white rounded-md"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome, Admin</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[{ title: 'Total Products', value: 120, icon: <FaBoxOpen className="text-2xl" /> },
              { title: 'Active Users', value: 457, icon: <FaUsers className="text-2xl" /> },
              { title: 'Custom Requests', value: 18, icon: <FaClipboardList className="text-2xl" /> },
              { title: 'Today’s Sales', value: '₦87,500', icon: <FaMoneyBillWave className="text-2xl" /> }].map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">{item.icon}</div>
                  <div>
                    <p className="text-sm text-gray-500">{item.title}</p>
                    <h3 className="text-xl font-bold">{item.value}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'upload':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Upload New Product</h2>
            <form className="space-y-4 bg-white p-6 rounded-lg shadow-md max-w-xl">
              <input type="text" placeholder="Product Name" className="w-full px-4 py-2 border rounded-md" />
              <input type="number" placeholder="Price (₦)" className="w-full px-4 py-2 border rounded-md" />
              <textarea placeholder="Description" className="w-full px-4 py-2 border rounded-md" rows="4" />
              <select className="w-full px-4 py-2 border rounded-md">
                <option value="">Select Category</option>
                <option value="hoodie">Hoodies</option>
                <option value="tees">T-Shirts</option>
                <option value="joggers">Joggers</option>
              </select>
              <input type="file" className="w-full" />
              <button type="submit" className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800">Upload</button>
            </form>
          </div>
        );

      case 'customizations':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Customization Requests</h2>
            <ul className="space-y-4">
              {['User A requested a red hoodie with initials.', 'User B wants a slim-fit jogger in navy.'].map((req, i) => (
                <li key={i} className="bg-white p-4 rounded-lg shadow-md">
                  <p>{req}</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-4 py-1 text-sm bg-green-600 text-white rounded-md">Approve</button>
                    <button className="px-4 py-1 text-sm bg-red-600 text-white rounded-md">Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'users':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">All Registered Users</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[{ name: 'Jane Doe', email: 'jane@example.com', role: 'Client', status: 'Active' },
                  { name: 'John Smith', email: 'john@example.com', role: 'Vendor', status: 'Pending' }].map((user, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.role}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'tickets':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaComments /> Support Tickets</h2>
            <div className="flex gap-8">
              <div className="w-1/3 space-y-3">
                {Object.keys(ticketChats).map((ticket, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-md shadow-sm cursor-pointer transition ${
                      selectedTicket === ticket ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    {ticket}
                  </div>
                ))}
              </div>
              <div className="w-2/3">{renderChat()}</div>
            </div>
          </div>
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
            <li onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-md shadow-sm cursor-pointer transition ${activeTab === 'dashboard' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Dashboard</li>
            <li onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-md cursor-pointer transition ${activeTab === 'upload' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Upload Products</li>
            <li onClick={() => setActiveTab('customizations')} className={`px-4 py-2 rounded-md cursor-pointer transition ${activeTab === 'customizations' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Customization Requests</li>
            <li onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-md cursor-pointer transition ${activeTab === 'users' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>View Users</li>
            <li onClick={() => setActiveTab('tickets')} className={`px-4 py-2 rounded-md cursor-pointer transition ${activeTab === 'tickets' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Tickets</li>
          </ul>
        </aside>
        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
