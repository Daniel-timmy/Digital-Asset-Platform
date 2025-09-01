import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

const CustomRequest = () => {
  const [customizationRequests, setCustomizationRequests] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const observer = useRef(null);
  const loadMoreRef = useRef(null);
  // New state for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [customUrl, setCustomUrl] = useState("");

  const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour

  // Fetch customization requests
  const getCustomRequest = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return;
    setIsLoading(true);
    try {
      const res = await api.get(
        `/custom?page=${pageNum}&limit=${limit}&type=custom`
      );
      const requests = res.data.data?.results || [];
      const newTotalPages = res.data.data?.totalPages || 1;
      console.log(requests);

      setCustomizationRequests((prev) =>
        append ? [...prev, ...requests] : requests
      );
      setTotalPages(newTotalPages);
      setError("");
    } catch (error) {
      console.error("Error fetching customization requests:", error);
      setError("Failed to fetch customization requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Intersection Observer for infinite scrolling
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && page < totalPages) {
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
  }, [isLoading, page, totalPages]);

  // Fetch data when page changes
  useEffect(() => {
    getCustomRequest(page, page > 1);
  }, [page]);

  // Toggle expansion state for a specific item
  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle checkbox selection for batch delete
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  // Handle single delete
  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await api.delete(`/custom/${id}`);
      const updatedRequests = customizationRequests.filter(
        (req) => req.id !== id
      );
      setCustomizationRequests(updatedRequests);
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      setError("");
    } catch (error) {
      console.error("Error deleting customization request:", error);
      setError(
        error.response?.data?.message ||
          "Failed to delete customization request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      setError("Please select at least one request to delete.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/custom/batch-delete", { ids: selectedIds });
      const updatedRequests = customizationRequests.filter(
        (req) => !selectedIds.includes(req.id)
      );
      setCustomizationRequests(updatedRequests);
      setSelectedIds([]);
      setError("");
    } catch (error) {
      console.error("Error during batch delete:", error);
      setError(
        error.response?.data?.message ||
          "Failed to delete selected requests. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Approve/Decline actions
  const handleStatusUpdate = async (id, newStatus) => {
    setIsLoading(true);
    try {
      const payload = { status: newStatus };
      if (newStatus === "closed" && customUrl) {
        payload.custom_url = customUrl; // Include custom_url for closed status
      }
      const res = await api.put(`/custom/${id}`, payload);
      const updatedRequests = customizationRequests.map((req) =>
        req.id === id ? { ...req, ...res.data.data, ...res.data } : req
      );
      setCustomizationRequests(updatedRequests);
      setError("");
      // Close modal and reset customUrl after successful update
      setIsModalOpen(false);
      setCustomUrl("");
      setSelectedRequestId(null);
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error);
      setError(
        error.response?.data?.message ||
          `Failed to update status to ${newStatus}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal for Close action
  const openCloseModal = (id) => {
    setSelectedRequestId(id);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCustomUrl("");
    setSelectedRequestId(null);
  };

  // Handle modal form submission
  const handleModalSubmit = () => {
    if (!customUrl.trim()) {
      setError("Please provide a valid URL.");
      return;
    }
    handleStatusUpdate(selectedRequestId, "closed");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Customization Requests
      </h2>
      {error && (
        <div className="mb-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => getCustomRequest(1, false)}
            className="mt-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Retry Loading Data
          </button>
        </div>
      )}
      {isLoading && <LoadingIndicator />}
      <div className="mb-4">
        <button
          onClick={handleBatchDelete}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400"
          disabled={isLoading || selectedIds.length === 0}
        >
          Delete Selected ({selectedIds.length})
        </button>
      </div>
      <ul className="space-y-4">
        {customizationRequests.length === 0 ? (
          <li className="text-gray-600 text-center">
            No customization requests found.
          </li>
        ) : (
          customizationRequests.map((req) => (
            <li
              key={req.id}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(req.id)}
                    onChange={() => handleSelect(req.id)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {req.name}
                    </h3>
                    <p className="text-gray-600">{req.description}</p>
                    <p className="text-xs text-gray-500">
                      Created:{" "}
                      {req.created_at
                        ? new Date(req.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Africa/Lagos",
                          })
                        : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Status:{" "}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          req.status === "closed"
                            ? "bg-green-100 text-green-700"
                            : req.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : req.status === "open"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleExpand(req.id)}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-label={expandedItems[req.id] ? "Collapse" : "Expand"}
                  disabled={isLoading}
                >
                  {expandedItems[req.id] ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {expandedItems[req.id] && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Asset Details
                      </h4>
                      <p className="text-gray-600">Name: {req.asset.name}</p>
                      <p className="text-gray-600">
                        Description: {req.asset.description}
                      </p>
                      <p className="text-gray-600">
                        Price: ₦
                        {parseFloat(req.asset.price).toLocaleString("en-NG")}
                      </p>
                      <p className="text-gray-600">
                        File Type: {req.asset.file_type}
                      </p>
                      <p className="text-gray-600">
                        Status:{" "}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            req.asset.status === "closed"
                              ? "bg-green-100 text-green-700"
                              : req.asset.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {req.asset.status}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        Created:{" "}
                        {req.asset.created_at
                          ? new Date(req.asset.created_at).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "Africa/Lagos",
                              }
                            )
                          : "N/A"}
                      </p>
                      {req.asset.file_url && (
                        <p className="text-gray-600">
                          <a
                            href={req.asset.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View File
                          </a>
                        </p>
                      )}
                      {req.asset.thumbnail_url && (
                        <p className="text-gray-600">
                          <a
                            href={req.asset.thumbnail_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Thumbnail
                          </a>
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        User Details
                      </h4>
                      <p className="text-gray-600">Name: {req.user.name}</p>
                      <p className="text-gray-600">Email: {req.user.email}</p>
                      <p className="text-gray-600">Role: {req.user.role}</p>
                      <p className="text-gray-600">
                        Status:{" "}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            req.user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : req.user.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {req.user.status}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        Created:{" "}
                        {req.user.created_at
                          ? new Date(req.user.created_at).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "Africa/Lagos",
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Request Details
                    </h4>
                    <p className="text-gray-600">
                      Payment Status:{" "}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          req.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {req.payment_status}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Due Date:{" "}
                      {req.due_date
                        ? new Date(req.due_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            timeZone: "Africa/Lagos",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openCloseModal(req.id)} // Open modal instead of direct update
                      className="px-4 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
                      disabled={req.status === "closed" || isLoading}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(req.id, "cancelled")}
                      className="px-4 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400"
                      disabled={req.status === "cancelled" || isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="px-4 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
      {/* Modal for Close Action */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Close Request</h3>
            <p className="text-gray-600 mb-4">
              Please provide the custom URL for this request.
            </p>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Enter custom URL"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 mb-4"
            />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
                disabled={isLoading}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sentinel element for Intersection Observer */}
      {page < totalPages && (
        <div ref={loadMoreRef} className="h-10">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default CustomRequest;
