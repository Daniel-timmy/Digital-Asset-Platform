import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const CustomRequest = () => {
  const [customizationRequests, setCustomizationRequests] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [error, setError] = useState("");

  // Fetch customization requests on mount
  useEffect(() => {
    const getCustomRequest = async () => {
      try {
        const res = await api.get("/custom");
        console.log(res.data);
        setCustomizationRequests(res.data.data.results);
      } catch (error) {
        console.error("Error fetching customization requests:", error);
        setError("Failed to fetch customization requests. Please try again.");
      }
    };
    getCustomRequest();
  }, []);

  // Toggle expansion state for a specific item
  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle Approve/Decline actions
  const handleStatusUpdate = async (id, newStatus) => {
    // try {
    //   const res = await api.put(`/custom/${id}`, { status: newStatus });
    //   console.log(res.data);
    //   setCustomizationRequests((prev) =>
    //     prev.map((req) =>
    //       req.id === id ? { ...req, ...res.data.data, ...res.data } : req
    //     )
    //   );
    //   setError("");
    // } catch (error) {
    //   console.error(`Error updating status to ${newStatus}:`, error);
    //   setError(
    //     error.connect?.data?.message ||
    //       `Failed to update status to ${newStatus}. Please try again.`
    //   );
    // }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Customization Requests
      </h2>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
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
              {/* Main summary row */}
              <div className="flex items-center justify-between">
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
                        })
                      : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status:{" "}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        req.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : req.status === "declined"
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
                <button
                  onClick={() => toggleExpand(req.id)}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-label={expandedItems[req.id] ? "Collapse" : "Expand"}
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

              {/* Expanded details */}
              {expandedItems[req.id] && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Asset Details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Asset Details
                      </h4>
                      <p className="text-gray-600">Name: {req.asset.name}</p>
                      <p className="text-gray-600">
                        Description: {req.asset.description}
                      </p>
                      <p className="text-gray-600">
                        Price: ${parseFloat(req.asset.price).toFixed(2)}
                      </p>
                      <p className="text-gray-600">
                        File Type: {req.asset.file_type}
                      </p>
                      <p className="text-gray-600">
                        Status:{" "}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            req.asset.status === "approved"
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
                    {/* User Details */}
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
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {/* Payment and Due Date */}
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
                          })
                        : "N/A"}
                    </p>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(req.id, "approved")}
                      className="px-4 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                      disabled={req.status === "approved"}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(req.id, "declined")}
                      className="px-4 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                      disabled={req.status === "declined"}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CustomRequest;
