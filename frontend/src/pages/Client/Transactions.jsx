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
  useEffect(() => {
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
  }, []);

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
    </div>
  );
};

export default Transactions;
