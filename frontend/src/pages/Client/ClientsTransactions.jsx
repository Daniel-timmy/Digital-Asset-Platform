import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const getStatusConfig = (status) => {
  const configs = {
    Successful: {
      color: "text-emerald-600 bg-emerald-50",
      icon: <CheckCircleIcon className="w-4 h-4" />,
    },
    Reversed: {
      color: "text-blue-600 bg-blue-50",
      icon: <ClockIcon className="w-4 h-4" />,
    },
    Failed: {
      color: "text-red-600 bg-red-50",
      icon: <XCircleIcon className="w-4 h-4" />,
    },
    pending: {
      color: "text-amber-600 bg-amber-50",
      icon: <ClockIcon className="w-4 h-4" />,
    },
  };
  return configs[status] || { color: "text-gray-600 bg-gray-50", icon: null };
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState({});
  const [error, setError] = useState(null);
  const observer = useRef(null);
  const loadMoreRef = useRef(null);
  const [issue, setIssue] = useState("");
  const [customIssue, setCustomIssue] = useState("");
  const [description, setDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const openReportModal = (orderId) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const reportIssue = async () => {
    const issueToReport = issue === "Other" ? customIssue : issue;
    if (!issueToReport.trim()) {
      setToast({
        show: true,
        message: "Please select or enter a valid issue",
        type: "error",
      });
      return;
    }
    try {
      setReportLoading(true);
      await api.post("/ticket", {
        name: issueToReport,
        transaction: selectedOrderId,
        description: description.trim() || undefined,
      });
      setToast({
        show: true,
        message: "Issue reported successfully",
        type: "success",
      });
      setModalOpen(false);
      setIssue("");
      setCustomIssue("");
      setDescription("");
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to report issue. Please try again.",
        type: "error",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const commonIssues = [
    "Order not delivered",
    "Wrong item received",
    "Item damaged",
    "Payment issue",
    "Other",
  ];

  const getTransactions = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return;
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

  useEffect(() => {
    getTransactions(page, page > 1);
  }, [page]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Transaction History
        </h2>
        <p className="text-gray-500">
          View and manage all your transactions in one place
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => getTransactions(1, false)}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
        {loading && transactions.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <LoadingIndicator />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((row) => {
                  const statusConfig = getStatusConfig(row.payment_status);
                  return (
                    <tr
                      className="hover:bg-gray-50 transition-colors duration-200"
                      key={row.id}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600">
                          {row.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.color}`}
                        >
                          {statusConfig.icon}
                          {row.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {row.asset ? row.asset.name : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {row.amount
                            ? `₦${parseFloat(row.amount).toLocaleString(
                                "en-NG"
                              )}`
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {paymentLoading[row.id] ? (
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                          ) : row.payment_status === "pending" ? (
                            <button
                              onClick={() => verify_payment(row.id)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                            >
                              Verify
                            </button>
                          ) : null}
                          <button
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                            onClick={() => openReportModal(row.id)}
                          >
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Issue Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-xl font-bold">Report an Issue</h3>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setIssue("");
                    setCustomIssue("");
                    setDescription("");
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="issue"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Select Issue Type
                  </label>
                  <select
                    id="issue"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    <option value="" disabled>
                      Choose an issue...
                    </option>
                    {commonIssues.map((issueOption) => (
                      <option key={issueOption} value={issueOption}>
                        {issueOption}
                      </option>
                    ))}
                  </select>
                </div>

                {issue === "Other" && (
                  <div className="animate-fade-in">
                    <label
                      htmlFor="customIssue"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Describe Your Issue
                    </label>
                    <input
                      id="customIssue"
                      type="text"
                      value={customIssue}
                      onChange={(e) => setCustomIssue(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter your issue"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Additional Details (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    placeholder="Provide more details about the issue"
                    rows="4"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                    onClick={() => {
                      setModalOpen(false);
                      setIssue("");
                      setCustomIssue("");
                      setDescription("");
                    }}
                  >
                    Cancel
                  </button>
                  {reportLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <button
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                      onClick={reportIssue}
                      disabled={reportLoading}
                    >
                      Submit Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sentinel for Infinite Scrolling */}
        {page < totalPages && (
          <div ref={loadMoreRef} className="h-16 flex justify-center items-center">
            {loading && <LoadingIndicator />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;