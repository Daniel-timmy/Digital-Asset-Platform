import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const Transactions = () => {
  // Sample transaction data
  // const initialTransactions = [
  //   {
  //     id: "TXN001",
  //     userName: "Jane Doe",
  //     assetId: "ASSET123",
  //     amount: 15000,
  //     paymentStatus: "Completed",
  //     createdAt: "2025-08-18T10:30:00Z",
  //   },
  //   {
  //     id: "TXN002",
  //     userName: "John Smith",
  //     assetId: "ASSET456",
  //     amount: 25000,
  //     paymentStatus: "Pending",
  //     createdAt: "2025-08-19T09:15:00Z",
  //   },
  //   {
  //     id: "TXN003",
  //     userName: "Alice Johnson",
  //     assetId: "ASSET789",
  //     amount: 10000,
  //     paymentStatus: "Failed",
  //     createdAt: "2025-08-19T14:20:00Z",
  //   },
  // ];

  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialTransactions, setInitialTransactions] = useState([]);

  // Handle search filtering
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === "") {
      setTransactions(initialTransactions);
    } else {
      const filtered = initialTransactions.filter(
        (txn) =>
          txn.userName.toLowerCase().includes(query) ||
          txn.assetId.toLowerCase().includes(query)
      );
      setTransactions(filtered);
    }
  };
  useEffect(() => {
    const getTransactions = async () => {
      try {
        const res = await api.get("/transactions?page=1&limit=10");
        setTransactions(res.data.results);
        setInitialTransactions(res.data.results);
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getTransactions();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Transactions</h2>
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Search by user name or asset ID..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search transactions by user name or asset ID"
        />
      </div>
      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">User Name</th>
              <th className="px-4 py-3 font-semibold">Custom Asset ID</th>
              <th className="px-4 py-3 font-semibold">Amount (₦)</th>
              <th className="px-4 py-3 font-semibold">Payment Status</th>
              <th className="px-4 py-3 font-semibold">Created At</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-600">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{txn.id}</td>
                  <td className="px-4 py-3">{txn?.user?.name}</td>
                  <td className="px-4 py-3">{txn?.custom_asset?.id}</td>
                  <td className="px-4 py-3">
                    {txn.amount.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        txn.payment_status === "completed"
                          ? "bg-green-100 text-green-700"
                          : txn.payment_status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {txn.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(txn.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
