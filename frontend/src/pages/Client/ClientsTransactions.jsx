import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

const getColor = (status) => {
  switch (status) {
    case "Successful":
      return "text-green-600";
    case "Reversed":
      return "text-blue-600";
    case "Failed":
      return "text-red-600";
    case "pending":
      return "text-yellow-600";
    default:
      return "text-gray-700";
  }
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState({});
  const [error, setError] = useState(null);
  const observer = useRef(null); // Ref for Intersection Observer
  const loadMoreRef = useRef(null); // Ref for the sentinel element

  // Fetch transactions with pagination
  const getTransactions = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return; // Prevent fetching beyond total pages
    try {
      setLoading(true);
      const res = await api.get(`/transactions?page=${pageNum}&limit=${limit}`);
      const newTransactions = res.data.results || [];
      const newTotalPages = res.data.totalPages || 1;

      setTransactions((prev) =>
        append ? [...prev, ...newTransactions] : newTransactions
      );
      setTotalPages(newTotalPages);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions when page changes or on mount
  useEffect(() => {
    getTransactions(page, page > 1);
  }, [page]);

  // Set up Intersection Observer for infinite scrolling
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current && observer.current) {
        observer.current.unobserve(loadMoreRef.current);
      }
    };
  }, [loading, page, totalPages]);

  const verify_payment = async (id) => {
    setPaymentLoading((prev) => ({ ...prev, [id]: true }));
    setError(null);

    try {
      const response = await api.get(`/transactions/verify/${id}`);
      const { status, message } = response.data;

      if (status === "success") {
        // Update the transaction's payment_status
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === id
              ? { ...transaction, payment_status: "Successful" }
              : transaction
          )
        );
      } else {
        setError(message || "Payment verification failed.");
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      setError("Failed to verify payment. Please try again.");
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6 px-4 sm:px-6 md:px-8">
      <h2 className="text-3xl font-bold text-black">Transaction History</h2>
      {error && (
        <div className="mb-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => getTransactions(1, false)}
            className="mt-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Retry Loading Transactions
          </button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        {loading && transactions.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <LoadingIndicator />
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Custom Asset ID</th>
                <th className="px-4 py-3 font-semibold">Custom Asset Name</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((row) => (
                <tr
                  className="border-t hover:bg-gray-50 transition"
                  key={row.id}
                >
                  <td className="px-4 py-3">{row.id.slice(0, 6)}...</td>
                  <td className="px-4 py-3">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {row.custom_asset.id.slice(0, 6)}...
                  </td>
                  <td className="px-4 py-3">{row.custom_asset.name}...</td>
                  <td
                    className={`px-4 py-3 font-semibold ${getColor(
                      row.payment_status
                    )}`}
                  >
                    {row.payment_status}
                  </td>
                  <td className="px-4 py-3">
                    {row.amount
                      ? `₦${parseFloat(row.amount).toLocaleString("en-NG")}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {paymentLoading[row.id] ? (
                      <LoadingIndicator />
                    ) : row.payment_status === "pending" ? (
                      <button
                        onClick={() => verify_payment(row.id)}
                        className="rounded-2xl bg-emerald-300 h-10 w-25 cursor-pointer hover:bg-emerald-400 transition-all duration-300"
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
        )}
        {/* Sentinel for Infinite Scrolling */}
        {page < totalPages && (
          <div ref={loadMoreRef} className="h-10 flex justify-center py-4">
            {loading && <LoadingIndicator />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
