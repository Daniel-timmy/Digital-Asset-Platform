import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";
import { USER } from "../../utils/constants";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const getStatusConfig = (status) => {
  const configs = {
    completed: {
      color: "text-emerald-600 bg-emerald-50",
      icon: <CheckCircleIcon className="w-4 h-4" />,
    },
    pending: {
      color: "text-amber-600 bg-amber-50",
      icon: <ClockIcon className="w-4 h-4" />,
    },
    failed: {
      color: "text-red-600 bg-red-50",
      icon: <XCircleIcon className="w-4 h-4" />,
    },
  };
  return (
    configs[status] || { color: "text-gray-600 bg-gray-50", icon: null }
  );
};

const CreatorTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [initialTransactions, setInitialTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const observer = useRef(null);
  const loadMoreRef = useRef(null);
  const creator = JSON.parse(localStorage.getItem(USER) || "{}");

  const getTransactions = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return;
    setLoading(true);
    setError(null);
    try {
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

  useEffect(() => {
    getTransactions(page, page > 1);
  }, [page]);

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

  const handleSelectTransaction = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Sales Transactions
        </h2>
        <p className="text-gray-500">
          Track all your product sales and earnings
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm"
            placeholder="Search by user name or asset ID..."
            value={searchQuery}
            onChange={handleSearch}
            disabled={loading}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in" style={{ animationDelay: "200ms" }}>
        {loading && transactions.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <LoadingIndicator />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4">
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
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => {
                    const statusConfig = getStatusConfig(txn.payment_status);
                    return (
                      <tr
                        key={txn.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(txn.id)}
                            onChange={() => handleSelectTransaction(txn.id)}
                            disabled={loading}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-600">
                            {txn.id.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {txn?.user?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {txn?.asset?.id?.slice(0, 8) || "N/A"}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-emerald-600">
                            {txn.price.toLocaleString("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            {txn?.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(txn.created_at).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {page < totalPages && (
          <div ref={loadMoreRef} className="h-16 flex justify-center items-center border-t border-gray-100">
            {loading && <LoadingIndicator />}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorTransactions;