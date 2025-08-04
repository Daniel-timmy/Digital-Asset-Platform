import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Fliers = () => {
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
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Flier Customization</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700">Event or Purpose</label>
              <input
                type="text"
                placeholder="e.g., Birthday, Burial, Naming Ceremony"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-gray-700">Date & Time</label>
              <input
                type="text"
                placeholder="e.g., August 25th"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-gray-700">Venue</label>
              <input
                type="text"
                placeholder="Event location"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-gray-700">Design Notes</label>
              <textarea
                placeholder="Any ideas, themes, or design instructions?"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black"
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
              Request Flyer
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Fliers;
