import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const SocialMedia = () => {
  return (
    <>
      <Header />
      <div className="bg-white py-16 px-4 min-h-screen font-[Inter] flex justify-center items-start">
        <div className="bg-[#f8f1e6] rounded-2xl shadow-xl p-10 w-full max-w-4xl">

          {/* Tabs */}
          <div className="flex justify-center gap-10 mb-8 border-b border-gray-300">
            <button className="text-black text-lg font-semibold pb-2 border-b-2 border-black">
               Social Media Management
            </button>
           
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold mb-8">Request A Service</h2>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Business Name</label>
              <input
                type="text"
                placeholder="Enter Business Name"
                className="w-full bg-white text-black p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Social Platform</label>
              <select className="w-full bg-white text-black p-3 border border-gray-300 rounded-md">
                <option>Select platform (e.g., Instagram, TikTok)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Target Audience</label>
              <input
                type="text"
                placeholder="e.g. Students, Entrepreneurs"
                className="w-full bg-white text-black p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Content Type</label>
              <select className="w-full bg-white text-black p-3 border border-gray-300 rounded-md">
                <option>Reels, Carousels, Story Ads, etc.</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Description</label>
              <textarea
                placeholder="Tell us what you're looking for..."
                className="w-full bg-white text-black p-3 border border-gray-300 rounded-md h-28"
              ></textarea>
            </div>

            <div>
              <label className="block font-medium mb-2">Preferred Communication</label>
              <select className="w-full bg-white text-black p-3 border border-gray-300 rounded-md">
                <option>Email, WhatsApp, Call, etc.</option>
              </select>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center mt-10">
            <button className="bg-black text-white py-3 px-12 rounded-sm flex items-center justify-center gap-2">
              Proceed <span>→</span>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SocialMedia;
