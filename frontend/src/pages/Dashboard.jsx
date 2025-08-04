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
    <div className="relative w-full min-h-screen bg-gray-100 font-sans">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 p-6 shadow-md min-h-screen">
          <ul className="space-y-2 text-gray-800 text-sm font-medium">
            <li className="bg-black text-white px-4 py-2 rounded-md shadow-sm">
              Dashboard
            </li>
            <li className="hover:bg-gray-200 px-4 py-2 rounded-md cursor-pointer transition">
              Orders
            </li>

            <li className="hover:bg-gray-200 px-4 py-2 rounded-md cursor-pointer transition">
              Transactions
            </li>
            <Link to={"/logout"}>
              <li className="hover:bg-gray-200 px-4 py-2 rounded-md cursor-pointer transition">
                Logout
              </li>
            </Link>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-tr from-black to-gray-800 text-white p-6 rounded-xl shadow-lg flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Hello, {user.name} </h2>
              <p className="text-sm mt-1">Welcome to your dashboard</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-full shadow-md" />
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <p className="text-gray-500 text-sm">Processed Order</p>
              <h3 className={`text-2xl font-bold mt-2 `}>
                {orderCounts.processing}
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Orders under processing
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <p className="text-gray-500 text-sm">Completed Order</p>
              <h3 className={`text-2xl font-bold mt-2 `}>{orderCounts.paid}</h3>
              <p className="text-gray-400 text-xs mt-1">
                Orders shipped or delivered
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <h3 className={`text-2xl font-bold mt-2`}>
                {orderCounts.pending}
              </h3>
              <p className="text-gray-400 text-xs mt-1">Unpaid orders</p>
            </div>
          </div>

          {/* Recent Orders */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Your Recent Orders</h3>
            <div className="overflow-x-auto rounded-lg shadow-md bg-white">
              <table className="min-w-full text-sm">
                <thead className="text-left bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((row, i) => (
                    <tr
                      className="border-t hover:bg-gray-50 transition"
                      key={i}
                    >
                      <td className="px-4 py-3">{row.id.slice(0, 6)}...</td>
                      <td className="px-4 py-3">{row.name}</td>
                      <td className="px-4 py-3">{row.date}</td>
                      <td className={`px-4 py-3 font-semibold ${row.color}`}>
                        {row.payment_status}
                      </td>
                      <td className="px-4 py-3">{row.price}</td>

                      <td className="px-4 py-3 ">
                        {row.payment_status === "pending" ? (
                          <button
                            className="rounded-2xl bg-blue-300 h-10 w-25"
                            onClick={() => initialize_payment(row.id)}
                          >
                            Make Payment
                          </button>
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-4">Your Transactions</h3>
            <div className="overflow-x-auto rounded-lg shadow-md bg-white">
              <table className="min-w-full text-sm">
                <thead className="text-left bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3"> Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((row, i) => (
                    <tr
                      className="border-t hover:bg-gray-50 transition"
                      key={i}
                    >
                      <td className="px-4 py-3">{row.id.slice(0, 6)}</td>
                      <td className="px-4 py-3">{row.created_at}</td>
                      <td className={`px-4 py-3 font-semibold ${row.color}`}>
                        {row.payment_status}
                      </td>
                      <td className="px-4 py-3">{row.price}</td>

                      <td className="px-4 py-3 ">
                        {row.payment_status === "pending" ? (
                          <button className="rounded-2xl bg-emerald-300 h-10 w-25">
                            Verify
                          </button>
                        ) : (
                          ""
                        )}
                      </td>
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
