import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10">
        {/* 404 Illustration */}
        <div className="mb-8 relative">
          <div className="text-[200px] sm:text-[250px] font-black text-gray-200 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-32 h-32 text-gray-400 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
          Oops! Page Not Found
        </h1>

        <p className="text-xl text-gray-600 max-w-md mb-8 leading-relaxed">
          The page you're looking for seems to have wandered off into the
          digital void.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="group relative px-8 py-4 bg-gradient-to-r from-black to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Home
            </span>
          </Link>

          <Link
            to="/stock"
            className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Browse Products
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600 text-sm mb-4">
            If you believe this is an error, please contact our support team.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="mailto:support@brush.com"
              className="text-black font-semibold hover:underline text-sm"
            >
              Contact Support
            </a>
            <span className="text-gray-300">|</span>
            <Link
              to="/categories"
              className="text-black font-semibold hover:underline text-sm"
            >
              View Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="relative z-10 text-center pb-8 text-gray-500 text-sm">
        <p>Error Code: 404 | Page Not Found</p>
      </div>
    </div>
  );
};

export default NotFound;
