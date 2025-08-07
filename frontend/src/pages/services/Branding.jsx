import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Branding() {
  return (
    <div className="bg-[#ffffff] flex flex-col min-h-screen font-[Inter]">
      <Header />
      <main className="flex justify-center p-4">
        <div className="bg-[#f4e8d8] w-full max-w-3xl rounded-3xl p-8 shadow-lg">
          {/* Tabs */}
          <div className="flex justify-between border-b-2 border-[#b4a99b] mb-8">
            <div className="text-black font-semibold text-lg pb-2 border-b-4 border-black w-1/2 text-center">
              Branding
            </div>
          
          </div>

          <h2 className="text-black text-2xl font-semibold mb-6">Request A Branding Service</h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Brand Name</label>
              <input className="w-full border rounded-md p-3 text-sm bg-white" placeholder="Select Branding Type" />
            </div>

            {/* Preferred Means of Communication */}
            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Means of Communication</label>
              <input className="w-full border rounded-md p-3 text-sm bg-white" placeholder="Select" />
            </div>

            {/* Branding Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">Branding Type</label>
              <select className="w-full border rounded-md p-3 text-sm bg-white">
                <option>Select Branding Type</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input type="email" className="w-full border rounded-md p-3 text-sm bg-white" placeholder="Enter Email Address" />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-semibold mb-2">Colors</label>
              <select className="w-full border rounded-md p-3 text-sm bg-white">
                <option>Select Brand Color</option>
              </select>
              <div className="flex space-x-2 mt-2">
                <div className="w-6 h-2 bg-red-600"></div>
                <div className="w-6 h-2 bg-blue-600"></div>
              </div>
            </div>

            {/* Preferred means of communication (Duplicate spelling kept as per image) */}
            <div>
              <label className="block text-sm font-semibold mb-2">Prefered means of communicaton</label>
              <select className="w-full border rounded-md p-3 text-sm bg-white">
                <option>Select</option>
              </select>
            </div>

            {/* Slogan */}
            <div>
              <label className="block text-sm font-semibold mb-2">Enter Slogan</label>
              <textarea className="w-full border rounded-md p-3 text-sm bg-white" placeholder="Enter your Brand Sogan"></textarea>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Descriprion</label>
              <textarea className="w-full border rounded-md p-3 text-sm bg-white" placeholder="Add description"></textarea>
            </div>

            {/* Logo Upload */}
            <div className="col-span-1 md:col-span-2 flex flex-col items-center">
              <label className="text-sm font-semibold mb-2">Upload Logo</label>
              <button className="border-2 border-[#c4b7a6] px-6 py-3 rounded-md text-sm flex items-center gap-2 bg-white">
                <span className="text-xl">\u2B06</span> Upload Logo
              </button>
            </div>

            {/* Submit */}
            <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
              <button className="bg-black text-white px-12 py-3 rounded-md text-sm">Proceed →</button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
