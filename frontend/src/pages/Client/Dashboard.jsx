import { Suspense } from "react";
import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import { initialize_payment, verify_payment } from "../../utils/payment";
import LoadingIndicator from "../../components/LoadingIndicator";

function StatCards({ orderCounts }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <p className="text-gray-500 text-sm">Open Orders</p>
        <h3 className={`text-2xl font-bold mt-2 `}>{orderCounts.open}</h3>
        <p className="text-gray-400 text-xs mt-1">Orders under processing</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <p className="text-gray-500 text-sm">Completed Order</p>
        <h3 className={`text-2xl font-bold mt-2 `}>{orderCounts.closed}</h3>
        <p className="text-gray-400 text-xs mt-1">Orders delivered</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <p className="text-gray-500 text-sm">Pending Orders</p>
        <h3 className={`text-2xl font-bold mt-2`}>{orderCounts.pending}</h3>
        <p className="text-gray-400 text-xs mt-1">Unpaid orders</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <p className="text-gray-500 text-sm">Paid Orders</p>
        <h3 className={`text-2xl font-bold mt-2`}>{orderCounts.paid}</h3>
        <p className="text-gray-400 text-xs mt-1">Paid orders</p>
      </div>
    </div>
  );
}
const statusColors = {
  Processing: "text-yellow-600",
  Completed: "text-green-600",
  Cancelled: "text-red-600",
};

function RecentOrders({ orders, setOrders }) {
  const [paymentLoading, setPaymentLoading] = useState({});

  const handlePayment = async (orderId) => {
    try {
      setPaymentLoading((prev) => ({ ...prev, [orderId]: true }));
      await initialize_payment(orderId); // Ensure initialize_payment is async
      // setPaymentLoading((prev) => ({ ...prev, [orderId]: false }));
    } catch (error) {
      setPaymentLoading((prev) => ({ ...prev, [orderId]: false }));
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [orderId]: false }));
      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? { ...order, payment_status: "processing" }
          : order
      );
    }
    setOrders(updatedOrders);
  };
  return (
    <section className="animate-fade-in-up delay-400">
      <h3 className="text-lg font-semibold mb-4">Your Recent Orders</h3>
      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-left bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Created at</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment status</th>

              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((row, i) => (
              <tr className="border-t hover:bg-gray-50 transition" key={i}>
                <td className="px-4 py-3">{row.id.slice(0, 6)}...</td>
                <td className="px-4 py-3">{row.created_at.slice(0, 10)}</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.due_date}</td>

                <td
                  className={`px-6 py-4 font-semibold ${
                    statusColors[row.payment_status]
                  }`}
                >
                  {row.status}
                </td>
                <td>{row.payment_status}</td>
                <td className="px-4 py-3">{row.price}</td>
                <td className="px-4 py-3">
                  {paymentLoading[row.id] ? (
                    <LoadingIndicator key={row.id} />
                  ) : row.payment_status === "pending" ? (
                    <button
                      className="rounded-2xl bg-blue-300 h-10 w-25 cursor-pointer hover:bg-blue-400 transition-all duration-300"
                      onClick={() => handlePayment(row.id)}
                    >
                      Make Payment
                    </button>
                  ) : row.payment_status === "processing" ? (
                    <button
                      className="rounded-2xl bg-green-300 h-10 w-25 cursor-pointer hover:bg-green-400 transition-all duration-300"
                      // onClick={() => handlePayment(row.id)}
                    >
                      Verify payment
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
      <div>
        <Link to={"/dashboard/orders"}>
          <button className="bg-black text-white text-xl p-3 rounded-lg mt-4 hover:bg-gray-400 transition-colors duration-300">
            See All
          </button>
        </Link>
      </div>
    </section>
  );
}

const Dashboard = () => {
  const [orderCounts, setOrderCounts] = useState({});
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [errors, setErrors] = useState({
    count: "",
    orders: "",
  });

  useEffect(() => {
    const newErrors = {};
    const getCounts = async () => {
      try {
        const res = await api.get("/custom/counts");
        setOrderCounts(res.data.data);
      } catch (error) {
        newErrors.count = "Unable to get users stat. Network error.";
        console.log(error);
      }
    };

    const getOrders = async () => {
      try {
        const res = await api.get("/custom?page=1&limit=5");
        setOrders(res.data.data.results);
      } catch (error) {
        newErrors.orders = "Unable to get recent orders. Network error.";
      }
    };

    getCounts();
    getOrders();
    setErrors(newErrors);
  }, []);
  return (
    <>
      <div className="bg-gradient-to-tr from-black to-gray-800 text-white p-6 rounded-xl shadow-lg flex justify-between items-center mb-8 animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold">Hello, {user.name}</h2>
          <p className="text-sm mt-1">Welcome to your dashboard</p>
        </div>
        <div className="w-14 h-14 bg-white rounded-full shadow-md" />
      </div>
      <Suspense fallback={<div>Loading stats...</div>}>
        <StatCards orderCounts={orderCounts} />
        <RecentOrders orders={orders} setOrders={setOrders} />
      </Suspense>
    </>
  );
};

export default Dashboard;
