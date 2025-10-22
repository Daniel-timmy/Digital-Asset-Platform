import { Suspense } from "react";
import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import Toast from "../../components/Toast";
import { Link } from "react-router-dom";
import { initialize_payment, verify_payment } from "../../utils/payment";
import LoadingIndicator from "../../components/LoadingIndicator";
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const statusColors = {
  processing: "text-amber-600 bg-amber-50",
  pending: "text-yellow-600 bg-yellow-50",
  completed: "text-emerald-600 bg-emerald-50",
  cancelled: "text-red-600 bg-red-50",
};

const statusIcons = {
  processing: <ClockIcon className="w-4 h-4" />,
  pending: <ClockIcon className="w-4 h-4" />,
  completed: <CheckCircleIcon className="w-4 h-4" />,
  cancelled: <XCircleIcon className="w-4 h-4" />,
};

function StatCard({ title, value, icon, gradient, delay }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function RecentOrders({ orders, setOrders }) {
  const [paymentLoading, setPaymentLoading] = useState({});

  const handlePayment = async (orderId) => {
    try {
      setPaymentLoading((prev) => ({ ...prev, [orderId]: true }));
      await initialize_payment(orderId);
    } catch (error) {
      setPaymentLoading((prev) => ({ ...prev, [orderId]: false }));
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [orderId]: false }));
      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? { ...order, payment_status: "processing" }
          : order
      );
      setOrders(updatedOrders);
    }
  };

  return (
    <section className="animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track your latest transactions
          </p>
        </div>
        <Link to="/dashboard/transactions">
          <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 hover:gap-3 shadow-lg hover:shadow-xl">
            View All
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((row, i) => (
                <tr
                  className="hover:bg-gray-50 transition-colors duration-200"
                  key={i}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">
                      {row.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(row.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {row.asset ? row.asset.name : "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        statusColors[row.payment_status]
                      }`}
                    >
                      {statusIcons[row.payment_status]}
                      {row.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      ₦{parseFloat(row.amount).toLocaleString("en-NG")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {paymentLoading[row.id] ? (
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                      </div>
                    ) : row.payment_status === "pending" ? (
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                        onClick={() => handlePayment(row.id)}
                      >
                        <CreditCardIcon className="w-4 h-4" />
                        Pay Now
                      </button>
                    ) : row.payment_status === "processing" ? (
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg">
                        <CheckCircleIcon className="w-4 h-4" />
                        Verify
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const Dashboard = () => {
  const [orderCounts, setOrderCounts] = useState({});
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    const getCounts = async () => {
      try {
        const res = await api.get("/custom/counts");
        setOrderCounts(res.data.data);
      } catch (error) {
        setToast({
          show: true,
          message: "Unable to load dashboard statistics",
          type: "error",
        });
      }
    };

    const getOrders = async () => {
      try {
        const res = await api.get("/transactions?page=1&limit=5");
        console.log("Recent Orders Data:", res.data);
        setOrders(res.data.results);
      } catch (error) {
        setToast({
          show: true,
          message: "Unable to load recent orders",
          type: "error",
        });
        console.log(error);
      }
    };

    getCounts();
    getOrders();
  }, []);

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 mb-8 shadow-2xl animate-fade-in">
        {/* Animated background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-300 text-lg">
              Here's what's happening with your account today
            </p>
          </div>
          <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <span className="text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={orderCounts.total || 0}
          icon={<ShoppingBagIcon className="w-6 h-6 text-white" />}
          gradient="from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title="Pending"
          value={orderCounts.pending || 0}
          icon={<ClockIcon className="w-6 h-6 text-white" />}
          gradient="from-amber-500 to-orange-600"
          delay={100}
        />
        <StatCard
          title="Completed"
          value={orderCounts.completed || 0}
          icon={<CheckCircleIcon className="w-6 h-6 text-white" />}
          gradient="from-emerald-500 to-green-600"
          delay={200}
        />
        <StatCard
          title="Cancelled"
          value={orderCounts.cancelled || 0}
          icon={<XCircleIcon className="w-6 h-6 text-white" />}
          gradient="from-red-500 to-pink-600"
          delay={300}
        />
      </div>

      {/* Recent Orders */}
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <LoadingIndicator />
          </div>
        }
      >
        <RecentOrders orders={orders} setOrders={setOrders} />
      </Suspense>
    </>
  );
};

export default Dashboard;