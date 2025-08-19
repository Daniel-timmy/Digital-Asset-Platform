import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Webdev = () => {
  return (
    <>
      <Header />
      <div className="bg-[var(--main-bg)] py-16 px-4 min-h-screen font-['Inter', sans-serif] flex justify-center items-start">
        <div className="bg-[var(--card-bg)] rounded-2xl shadow-xl p-10 w-full max-w-4xl">
          {/* Tabs */}
          <div className="flex justify-center gap-10 mb-8 border-b border-[var(--border-color)]">
            <button className="text-[var(--text-color)] text-lg font-semibold pb-2 border-b-2 border-[var(--text-color)]">
              UI/UX Design
            </button>
            <button className="text-[var(--muted-text)] text-lg font-medium pb-2 border-b-2 border-[var(--muted-border)]">
              Website Development
            </button>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold mb-8 text-[var(--text-color)]">
            Request A Service
          </h2>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2 text-[var(--text-color)]">
                Brand Name
              </label>
              <input
                type="text"
                placeholder="Enter Company Name"
                className="w-full bg-white text-black p-3 border border-[var(--border-color)] rounded-md"
              />
            </div>
            <div>
              <label className="block font-medium mb-2 text-[var(--text-color)]">
                Preferred Means of Communication
              </label>
              <select className="w-full bg-white text-black p-3 border border-[var(--border-color)] rounded-md">
                <option>Select your preferred means of communication</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 text-[var(--text-color)]">
                Company Type
              </label>
              <input
                type="text"
                placeholder="Enter Email Address"
                className="w-full bg-white text-black p-3 border border-[var(--border-color)] rounded-md"
              />
            </div>
            <div>
              <label className="block font-medium mb-2 text-[var(--text-color)]">
                Target Audience
              </label>
              <select className="w-full bg-white text-black p-3 border border-[var(--border-color)] rounded-md">
                <option>Teenagers</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 text-[var(--text-color)]">
                Enter Slogan
              </label>
              <textarea
                placeholder="Enter your Brand Slogan"
                className="w-full bg-white text-black p-3 border border-[var(--border-color)] rounded-md h-28"
              ></textarea>
            </div>

            <div>
              <label className="block font-medium mb-2 text-[var(--text-color)]">
                Description
              </label>
              <textarea
                placeholder="Add description"
                className="w-full bg-white text-black p-3 border border-[var(--border-color)] rounded-md h-28"
              ></textarea>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center mt-10">
            <button className="bg-[var(--text-color)] text-white py-3 px-12 rounded-sm flex items-center justify-center gap-2">
              Proceed <span>→</span>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Webdev;
