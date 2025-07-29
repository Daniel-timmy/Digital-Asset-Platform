import React from 'react';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  return (
    <div className="relative w-full min-h-screen bg-gray-100 font-sans">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 p-6 shadow-md min-h-screen">
          <ul className="space-y-2 text-gray-800 text-sm font-medium">
            <li className="bg-black text-white px-4 py-2 rounded-md shadow-sm">Dashboard</li>
            <li className="hover:bg-gray-200 px-4 py-2 rounded-md cursor-pointer transition">Orders</li>
         
            <li className="hover:bg-gray-200 px-4 py-2 rounded-md cursor-pointer transition">Transactions</li>
            <li className="hover:bg-gray-200 px-4 py-2 rounded-md cursor-pointer transition">Logout</li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-tr from-black to-gray-800 text-white p-6 rounded-xl shadow-lg flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Hello, Client </h2>
              <p className="text-sm mt-1">Welcome to your dashboard</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-full shadow-md" />
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { title: 'Pending Orders', value: 0, sub: 'Unpaid orders' },
              { title: 'Processed Order', value: 0, sub: 'Orders under processing' },
              { title: 'Completed Order', value: 1, sub: 'Orders shipped or delivered' },
              { title: 'Wallet Balance', value: '₦0.00', sub: 'Total wallet balance', highlight: true }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                <p className="text-gray-500 text-sm">{item.title}</p>
                <h3 className={`text-2xl font-bold mt-2 ${item.highlight ? 'text-green-600' : ''}`}>
                  {item.value}
                </h3>
                <p className="text-gray-400 text-xs mt-1">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Your Recent Orders</h3>
            <div className="overflow-x-auto rounded-lg shadow-md bg-white">
              <table className="min-w-full text-sm">
                <thead className="text-left bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: '64579',
                      items: 'Creative Tools',
                      date: 'March 4, 2025',
                      status: 'Cancelled',
                      color: 'text-red-600',
                      total: '₦100,000.00',
                    },
                    {
                      id: '64577',
                      items: 'Arts and Design assets',
                      date: 'March 4, 2025',
                      status: 'Completed',
                      color: 'text-green-600',
                      total: '₦100,000.00',
                    }
                  ].map((row, i) => (
                    <tr className="border-t hover:bg-gray-50 transition" key={i}>
                      <td className="px-4 py-3">{row.id}</td>
                      <td className="px-4 py-3">{row.items}</td>
                      <td className="px-4 py-3">{row.date}</td>
                      <td className={`px-4 py-3 font-semibold ${row.color}`}>{row.status}</td>
                      <td className="px-4 py-3">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
