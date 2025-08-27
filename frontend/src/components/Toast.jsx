import React, { useEffect } from "react";

const Toast = ({ message, type = "info", onClose }) => {
  // Auto close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
  };

  return (
    <div
      className={`fixed top-5 right-5 max-w-sm w-full px-4 py-3 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${typeStyles[type]}`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Toast;
