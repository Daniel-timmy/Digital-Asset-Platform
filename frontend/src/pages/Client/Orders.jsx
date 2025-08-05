import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [offset, setOffset] = useState(1);
  const [limit, setLimit] = useState(10);

  const statusColors = {
    Processing: "text-yellow-600",
    Completed: "text-green-600",
    Cancelled: "text-red-600",
  };

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
    const getOrders = async () => {
      try {
        const res = await api.get(`/custom?page=${offset}&limit=${limit}`);
        setOrders(res.data.results);
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    getOrders();
  }, []);
  return (
    <div className="animate-fade-in-up space-y-6">
      <h2 className="text-3xl font-bold text-black">Your Orders</h2>
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
              <tr className="border-t hover:bg-gray-50 transition" key={i}>
                <td className="px-4 py-3">{row.id.slice(0, 6)}...</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.date}</td>

                <td
                  className={`px-6 py-4 font-semibold ${
                    statusColors[row.payment_status]
                  }`}
                >
                  {row.status}
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
    </div>
  );
};

export default Orders;
