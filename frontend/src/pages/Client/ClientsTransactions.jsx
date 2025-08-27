import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const getColor = (status) => {
  switch (status) {
    case "Successful":
      return "text-green-600";
    case "Reversed":
      return "text-blue-600";
    case "Failed":
      return "text-red-600";
    default:
      return "text-gray-700";
  }
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("Verifying payment...");
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState({});

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const res = await api.get("/transactions?page=1&limit=10");
        setTransactions(res.data.results);
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getTransactions();
  }, []);

  const verify_payment = async (id) => {
    console.log("verifying");
    setPaymentLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await api.get(`/transactions/verify/${id}`);
      console.log("Response from verification:", response);
      const { status, message } = response.data;

      if (status === "success") {
        setStatus("Payment verified successfully!");
      } else {
        setStatus("Payment verification failed.");
        setError(message || "Unknown error.");
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      setStatus("Error verifying payment.");
      setError("Failed to verify payment. Please try again.");
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [id]: false }));
      // Optionally, you can refresh the transactions after verification
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === id
          ? { ...transaction, payment_status: status }
          : transaction
      );
      setTransactions(updatedTransactions);
      console.log("Updated transactions:", updatedTransactions);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <h2 className="text-3xl font-bold text-black">Transaction History</h2>
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
              <tr className="border-t hover:bg-gray-50 transition" key={i}>
                <td className="px-4 py-3">{row.id.slice(0, 6)}</td>
                <td className="px-4 py-3">{row.created_at}</td>
                <td className={`px-4 py-3 font-semibold ${row.color}`}>
                  {row.payment_status}
                </td>
                <td className="px-4 py-3">{row.amount}</td>

                <td className="px-4 py-3 ">
                  {row.payment_status === "pending" ? (
                    <button
                      onClick={verify_payment(row.id)}
                      className="rounded-2xl bg-emerald-300 h-10 w-25"
                    >
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
    </div>
  );
};

export default Transactions;
