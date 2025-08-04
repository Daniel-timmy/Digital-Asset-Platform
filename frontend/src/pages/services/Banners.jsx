import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Banners = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-1 flex flex-col items-center py-10 px-4">
        {/* Back Button */}
        <div className="w-full max-w-2xl mb-6">
          <Link
            to="/"
            className="inline-block text-sm text-gray-600 hover:text-black transition"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Custom Banner Design</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700">Banner Title</label>
              <input
                type="text"
                placeholder="Enter your banner headline"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-gray-700">Subtext</label>
              <input
                type="text"
                placeholder="Add a subtitle or caption"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-gray-700">Preferred Colors</label>
              <input
                type="text"
                placeholder="e.g., Black, White, Orange"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
              Submit Request
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Banners;
