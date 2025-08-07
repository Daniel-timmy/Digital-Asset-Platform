import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";

const Photography = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-[Inter,sans-serif]">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          Book Photography Session
        </h1>

        {/* Card Section */}
        <div className="bg-[#f8f1e6] rounded-xl p-6 md:p-10 shadow-md flex flex-col md:flex-row gap-8">
          {/* Left Text */}
          <div className="flex-1">
            <h2 className="text-5xl font-extrabold leading-tight mb-4">
              Book A <br /> Session
            </h2>
            <p className="text-gray-600 text-lg">
              Capture your moments with a professional photography session.
              Book now for stunning, timeless memories.
            </p>
          </div>

          {/* Right Form */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-base font-semibold">Name</label>
              <input
                type="text"
                placeholder="Enter Your Name"
                className="w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
              />
            </div>
            <div>
              <label className="text-base font-semibold">Contact</label>
              <input
                type="text"
                placeholder="Email/Phone"
                className="w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
              />
            </div>
            <div>
              <label className="text-base font-semibold">Event Type</label>
              <select className="w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition">
                <option>Select Picture type</option>
              </select>
            </div>
            <div>
              <label className="text-base font-semibold">Picture Type</label>
              <select className="w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition">
                <option>Select Picture type</option>
              </select>
            </div>
            <div>
              <label className="text-base font-semibold">Date And Time</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
              />
            </div>
            <div>
              <label className="text-base font-semibold">Description</label>
              <textarea
                placeholder="Add description"
                rows={3}
                className="w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
              />
            </div>

            <button
              onClick={() => alert("Redirect to payment")}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
            >
              Proceed to pay →
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full mt-2 bg-gray-200 text-black py-2 rounded hover:bg-gray-300 transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Promotional Services */}
        <div className="mt-20">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <h3 className="text-3xl font-bold min-w-[200px]">
              Promotional <br /> Services
            </h3>
            <ul className="list-disc text-lg text-gray-700 space-y-2 pl-6">
              <li>Full Logo Design</li>
              <li>Product Branding</li>
              <li>Full Brand Identity</li>
              <li>Additional Services</li>
            </ul>
          </div>
        </div>

        {/* Working Process */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold mb-10">
            Working <span className="text-yellow-400">Process</span>
          </h2>

          <div className="space-y-12">
            {[
              ["STEP 1", "Send email", "We receive your request and respond promptly to initiate your project."],
              ["STEP 2", "Meet online", "A meeting is scheduled to understand your goals and vision clearly."],
              ["STEP 3", "Price estimation", "We provide a detailed estimate tailored to your specific needs."],
              ["STEP 4", "Work together", "Collaboration begins to bring your project to life."]
            ].map(([step, title, desc], idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-8">
                <div className="min-w-[150px] text-lg font-bold text-gray-800">{step}</div>
                <div>
                  <h4 className="text-xl font-semibold mb-1">{title}</h4>
                  <p className="text-gray-700 text-base">{desc}</p>
                  <hr className="mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Photography;
