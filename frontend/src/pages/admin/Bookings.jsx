// src/pages/Bookings.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";

const Bookings = () => {
  const { service } = useParams(); // Get service from URL (e.g., photography, webdev)
  const [filterService, setFilterService] = useState(service || "all");

  console.log(service);

  // Sample booking data
  const bookings = [
    {
      id: "BOOKING001",
      service: "Photography",
      clientName: "Jane Doe",
      clientEmail: "jane@example.com",
      date: "2025-09-01",
      status: "Confirmed",
      details: "Portrait session for family event",
    },
    {
      id: "BOOKING002",
      service: "Web Dev/UIUX",
      clientName: "John Smith",
      clientEmail: "john@example.com",
      date: "2025-09-05",
      status: "Pending",
      details: "E-commerce website redesign",
    },
    {
      id: "BOOKING003",
      service: "Branding",
      clientName: "Alice Johnson",
      clientEmail: "alice@example.com",
      date: "2025-09-10",
      status: "Confirmed",
      details: "Logo and brand identity creation",
    },
    {
      id: "BOOKING004",
      service: "Social Media Management",
      clientName: "Bob Brown",
      clientEmail: "bob@example.com",
      date: "2025-09-15",
      status: "Pending",
      details: "Monthly social media campaign",
    },
  ];

  // Filter options
  const serviceOptions = [
    { value: "all", label: "All Services" },
    { value: "photography", label: "Photography" },
    { value: "webdev", label: "Web Dev/UIUX" },
    { value: "branding", label: "Branding" },
    { value: "socialmedia", label: "Social Media Management" },
  ];

  // Filter bookings by service
  const filteredBookings =
    filterService === "all"
      ? bookings
      : bookings.filter(
          (booking) => booking.service.toLowerCase() === filterService
        );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Service Bookings
      </h2>
      {/* Service Filter */}
      <div className="mb-6">
        <Select
          options={serviceOptions}
          value={serviceOptions.find(
            (option) => option.value === filterService
          )}
          onChange={(selected) =>
            setFilterService(selected ? selected.value : "all")
          }
          className="w-full max-w-xs"
          placeholder="Filter by Service"
          aria-label="Filter bookings by service"
        />
      </div>
      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Service</th>
              <th className="px-4 py-3 font-semibold">Client Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-600">
                  No bookings found.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{booking.service}</td>
                  <td className="px-4 py-3">{booking.clientName}</td>
                  <td className="px-4 py-3">{booking.clientEmail}</td>
                  <td className="px-4 py-3">{booking.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{booking.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;
