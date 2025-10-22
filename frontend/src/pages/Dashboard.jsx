import React, { useEffect, useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../utils/api";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [orderCounts, setOrderCounts] = useState({});
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  // what if the user is not saved in the cache
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const initialize_payment = async (id) => {
    try {
      const res = await api.post("/transactions/initialize-payment", { id });
      const authorizationUrl = res.data.authorization_url;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
      } else {
        console.error("No authorization URL returned from API");
        alert("Failed to initialize payment: No authorization URL provided.");
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      alert("Failed to initialize payment. Please try again.");
    }
  };
  const statusColors = {
    Processing: "text-yellow-600",
    Completed: "text-green-600",
    Cancelled: "text-red-600",
  };
  useEffect(() => {
    const getCounts = async () => {
      try {
        const res = await api.get("/custom/counts");
        setOrderCounts(res.data);
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    };

    const getOrders = async () => {
      try {
        const res = await api.get("/custom");
        setOrders(res.data);
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    const getTransactions = async () => {
      try {
        const res = await api.get("/transactions");
        setTransactions(res.data);
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getTransactions();
    getCounts();
    getOrders();
  }, []);
  console.log(user);
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-sans">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 p-6 shadow-sm min-h-screen sticky top-0">
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li className="bg-gradient-to-r from-black to-gray-800 text-white px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </li>
              <li className="hover:bg-gray-100 px-5 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium text-gray-700 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Orders
              </li>
              <li className="hover:bg-gray-100 px-5 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium text-gray-700 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Transactions
              </li>
            </ul>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <Link to={"/logout"}>
              <button className="w-full hover:bg-red-50 text-red-600 px-5 py-3 rounded-xl cursor-pointer transition-all duration-200 font-semibold flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12">
          {/* Welcome Header */}
          <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-8 rounded-3xl shadow-2xl flex justify-between items-center mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-2">Welcome back, {user.name}! 👋</h2>
              <p className="text-gray-300 text-lg">Here's what's happening with your account today</p>
            </div>
            <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl shadow-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">👤</span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-2">Processing</p>
              <h3 className="text-4xl font-black text-gray-900 mb-2">
                {orderCounts.processing || 0}
              </h3>
              <p className="text-gray-500 text-sm">Orders being processed</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-2">Completed</p>
              <h3 className="text-4xl font-black text-gray-900 mb-2">
                {orderCounts.paid || 0}
              </h3>
              <p className="text-gray-500 text-sm">Successfully delivered</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
              <h3 className="text-4xl font-black text-gray-900 mb-2">
                {orderCounts.pending || 0}
              </h3>
              <p className="text-gray-500 text-sm">Awaiting payment</p>
            </div>
          </div>

          {/* Recent Orders */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Recent Orders</h3>
              <button className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">
                View All →
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          No orders yet
                        </td>
                      </tr>
                    ) : (
                      orders.map((row, i) => (
                        <tr
                          className="hover:bg-gray-50 transition-colors"
                          key={i}
                        >
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">
                            {row.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {row.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {row.date}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                row.payment_status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : row.payment_status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            {row.price}
                          </td>
                          <td className="px-6 py-4">
                            {row.payment_status === "pending" && (
                              <button
                                className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                                onClick={() => initialize_payment(row.id)}
                              >
                                Pay Now
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Transactions */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Recent Transactions</h3>
              <button className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">
                View All →
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          No transactions yet
                        </td>
                      </tr>
                    ) : (
                      transactions.map((row, i) => (
                        <tr
                          className="hover:bg-gray-50 transition-colors"
                          key={i}
                        >
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">
                            {row.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {row.created_at}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                row.payment_status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : row.payment_status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {row.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            {row.price}
                          </td>
                          <td className="px-6 py-4">
                            {row.payment_status === "pending" && (
                              <button className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                                Verify
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
