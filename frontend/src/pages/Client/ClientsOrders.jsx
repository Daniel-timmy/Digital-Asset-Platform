import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import { initialize_payment } from "../../utils/payment";
import LoadingIndicator from "../../components/LoadingIndicator";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [issue, setIssue] = useState("");
  const [customIssue, setCustomIssue] = useState("");
  const [description, setDescription] = useState(""); // New state for description
  const [reportLoading, setReportLoading] = useState(false);
  const observer = useRef(null);
  const loadMoreRef = useRef(null);

  const statusColors = {
    Processing: "text-yellow-600",
    Completed: "text-green-600",
    Cancelled: "text-red-600",
  };

  const commonIssues = [
    "Order not delivered",
    "Wrong item received",
    "Item damaged",
    "Payment issue",
    "Other",
  ];

  const handlePayment = async (orderId) => {
    try {
      setPaymentLoading((prev) => ({ ...prev, [orderId]: true }));
      await initialize_payment(orderId);
    } catch (error) {
      console.error("Error initializing payment:", error);
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getOrders = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return;
    try {
      setLoading(true);
      const res = await api.get(
        `/custom?page=${pageNum}&limit=${limit}&type=custom`
      );
      const newOrders = res.data.data.results || [];
      const newTotalPages = res.data.data.totalPages || 1;

      setOrders((prev) => (append ? [...prev, ...newOrders] : newOrders));
      setTotalPages(newTotalPages);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const reportIssue = async () => {
    const issueToReport = issue === "Other" ? customIssue : issue;
    if (!issueToReport.trim()) {
      alert("Please select or enter a valid issue");
      return;
    }
    try {
      setReportLoading(true);
      await api.post("/ticket", {
        name: issueToReport,
        custom_asset: selectedOrderId,
        description: description.trim() || undefined, // Include description if provided
      });
      alert("Issue reported successfully");
      setModalOpen(false);
      setIssue("");
      setCustomIssue("");
      setDescription(""); // Reset description
    } catch (error) {
      alert("Failed to report issue");
    } finally {
      setReportLoading(false);
    }
  };

  const openReportModal = (orderId) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  useEffect(() => {
    getOrders(page, page > 1);
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

  return (
    <div className="animate-fade-in-up space-y-6 px-4 sm:px-6 md:px-8">
      <h2 className="text-3xl font-bold text-black">Your Orders</h2>
      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        {loading && orders.length === 0 ? (
          <LoadingIndicator />
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Created at</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Report an Issue</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((row) => (
                <tr
                  className="border-t hover:bg-gray-50 transition"
                  key={row.id}
                >
                  <td className="px-4 py-3">{row.id.slice(0, 6)}...</td>
                  <td className="px-4 py-3">{row.created_at.slice(0, 10)}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.date || "N/A"}</td>
                  <td
                    className={`px-6 py-4 font-semibold ${
                      statusColors[row.status] || "text-gray-600"
                    }`}
                  >
                    {row.status}
                  </td>
                  <td className="px-4 py-3">{row.payment_status}</td>
                  <td className="px-4 py-3">
                    {row.price
                      ? `₦${parseFloat(row.price).toLocaleString("en-NG")}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {paymentLoading[row.id] ? (
                      <LoadingIndicator />
                    ) : row.payment_status === "pending" ? (
                      <button
                        className="rounded-2xl bg-blue-300 h-10 w-25 cursor-pointer hover:bg-blue-400 transition-all duration-300"
                        onClick={() => handlePayment(row.id)}
                      >
                        Make Payment
                      </button>
                    ) : row.payment_status === "processing" ? (
                      <button className="rounded-2xl bg-green-300 h-10 w-25 cursor-pointer hover:bg-green-400 transition-all duration-300">
                        Verify Payment
                      </button>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded-2xl bg-red-300 h-10 w-25 cursor-pointer hover:bg-red-400 transition-all duration-300"
                      onClick={() => openReportModal(row.id)}
                    >
                      Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {page < totalPages && (
          <div ref={loadMoreRef} className="h-10 flex justify-center py-4">
            {loading && <LoadingIndicator />}
          </div>
        )}
      </div>

      {/* Report Issue Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Report an Issue</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="issue"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Issue
                </label>
                <select
                  id="issue"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select an issue
                  </option>
                  {commonIssues.map((issueOption) => (
                    <option key={issueOption} value={issueOption}>
                      {issueOption}
                    </option>
                  ))}
                </select>
              </div>
              {issue === "Other" && (
                <div>
                  <label
                    htmlFor="customIssue"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Describe Your Issue
                  </label>
                  <input
                    id="customIssue"
                    type="text"
                    value={customIssue}
                    onChange={(e) => setCustomIssue(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your issue"
                  />
                </div>
              )}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Additional Details (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Provide more details about the issue"
                  rows="4"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="rounded-2xl bg-gray-300 h-10 px-4 cursor-pointer hover:bg-gray-400 transition-all duration-300"
                  onClick={() => {
                    setModalOpen(false);
                    setIssue("");
                    setCustomIssue("");
                    setDescription(""); // Reset description
                  }}
                >
                  Cancel
                </button>
                <button
                  className="rounded-2xl bg-red-300 h-10 px-4 cursor-pointer hover:bg-red-400 transition-all duration-300 flex items-center"
                  onClick={reportIssue}
                  disabled={reportLoading}
                >
                  {reportLoading ? <LoadingIndicator /> : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
