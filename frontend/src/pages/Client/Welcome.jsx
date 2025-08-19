import React from "react";

export default function Welcome() {
  return (
    <div className="bg-gradient-to-tr from-black to-gray-800 text-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Hello, Client</h2>
        <p className="text-sm mt-1">Welcome to your dashboard</p>
      </div>
      <div className="w-14 h-14 bg-white rounded-full shadow-md self-end sm:self-auto" />
    </div>
  );
}
