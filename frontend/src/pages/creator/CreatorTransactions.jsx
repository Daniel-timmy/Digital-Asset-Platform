import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";
import { USER } from "../../utils/constants";

const CreatorTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [initialTransactions, setInitialTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Changed from offset to page for clarity
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const observer = useRef(null); // Ref for Intersection Observer
  const loadMoreRef = useRef(null); // Ref for the sentinel element
  const creator = JSON.parse(localStorage.getItem(USER) || "{}");

  const getTransactions = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching transactions...");
      const res = await api.get(
        `/downloads?creator=${creator.id}page=${page}&limit=${limit}`
      );
      const txns = res.data.results || [];
      const newTotalPages = res.data.totalPages || 1;

      setTransactions((prev) => (append ? [...prev, ...txns] : txns));
      setInitialTransactions((prev) => (append ? [...prev, ...txns] : txns));
      setTotalPages(newTotalPages);

      setError("");
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  // Fetch transactions
  useEffect(() => {
    getTransactions(page, page > 1);
  }, [page]);

  // Handle search filtering
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === "") {
      setTransactions(initialTransactions);
    } else {
      const filtered = initialTransactions.filter(
        (txn) =>
          txn.user?.name?.toLowerCase().includes(query) ||
          txn.asset?.id?.toLowerCase().includes(query)
      );
      setTransactions(filtered);
    }
  };

  // Handle checkbox selection for batch delete
  const handleSelectTransaction = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  // Handle single transaction deletion

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Transactions</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
          <button
            className="ml-4 text-sm underline"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input and Batch Delete Button */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black mb-4 sm:mb-0"
          placeholder="Search by user name or asset ID..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search transactions by user name or asset ID"
          disabled={loading}
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <LoadingIndicator />
        ) : (
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === transactions.length &&
                      transactions.length > 0
                    }
                    onChange={() =>
                      setSelectedIds(
                        selectedIds.length === transactions.length
                          ? []
                          : transactions.map((txn) => txn.id)
                      )
                    }
                    disabled={loading || transactions.length === 0}
                    aria-label="Select all transactions"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">User Name</th>
                <th className="px-4 py-3 font-semibold">Asset ID</th>
                <th className="px-4 py-3 font-semibold">Amount (₦)</th>
                <th className="px-4 py-3 font-semibold">Payment Status</th>
                <th className="px-4 py-3 font-semibold">Created At</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-3 text-center text-gray-600"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(txn.id)}
                        onChange={() => handleSelectTransaction(txn.id)}
                        disabled={loading}
                        aria-label={`Select transaction ${txn.id}`}
                      />
                    </td>
                    <td className="px-4 py-3">{txn.id}</td>
                    <td className="px-4 py-3">{txn?.user?.name || "N/A"}</td>
                    <td className="px-4 py-3">{txn?.asset?.id || "N/A"}</td>
                    <td className="px-4 py-3">
                      {txn.price.toLocaleString("en-NG", {
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
                        {txn?.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(txn.created_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {page < totalPages && (
        <div ref={loadMoreRef} className="h-10">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default CreatorTransactions;
