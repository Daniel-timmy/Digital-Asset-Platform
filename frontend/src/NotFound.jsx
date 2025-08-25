import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        {/* Image Placeholder */}
        <div className="w-64 h-64 mb-6">
          <img
            src="../src/assets/cute-grim-reaper-halloween-vector-clipart_644874-10572.avif" 
            alt="Not Found Illustration"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-9xl font-extrabold text-black animate-bounce">404</h1>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-800">
          Page Not Found
        </h2>
        <p className="mt-2 text-gray-500 max-w-md">
          Oops! The page you are looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
