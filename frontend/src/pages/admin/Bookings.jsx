// src/pages/Bookings.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

const CACHE_DURATION = 0.2 * 60 * 60 * 1000; //  12 minutes in milliseconds

const PhotographyTable = ({ bookings }) => (
  <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
    <h3 className="text-lg font-semibold mb-2 text-gray-800">
      Photography Bookings
    </h3>
    <table className="min-w-full text-sm text-left text-gray-800">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 font-semibold">Client Name</th>
          <th className="px-4 py-3 font-semibold">Email</th>
          <th className="px-4 py-3 font-semibold">Event Date</th>
          <th className="px-4 py-3 font-semibold">Event Type</th>
          <th className="px-4 py-3 font-semibold">Picture Type</th>
          <th className="px-4 py-3 font-semibold">Description</th>
          <th className="px-4 py-3 font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.length === 0 ? (
          <tr>
            <td colSpan="7" className="px-4 py-3 text-center text-gray-600">
              No photography bookings found.
            </td>
          </tr>
        ) : (
          bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">{booking.name}</td>
              <td className="px-4 py-3">{booking.contact}</td>
              <td className="px-4 py-3">
                {new Date(booking.event_date).toLocaleDateString("en-US", {
                  timeZone: "Africa/Lagos",
                })}
              </td>
              <td className="px-4 py-3">{booking.event_type}</td>
              <td className="px-4 py-3">{booking.picture_type}</td>
              <td className="px-4 py-3">{booking.description}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status || "Pending"}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const WebsiteTable = ({ bookings }) => (
  <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
    <h3 className="text-lg font-semibold mb-2 text-gray-800">
      Web Dev/UIUX Bookings
    </h3>
    <table className="min-w-full text-sm text-left text-gray-800">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 font-semibold">Company Name</th>
          <th className="px-4 py-3 font-semibold">Email</th>
          <th className="px-4 py-3 font-semibold">Website Type</th>
          <th className="px-4 py-3 font-semibold">Industry</th>
          <th className="px-4 py-3 font-semibold">Features</th>
          <th className="px-4 py-3 font-semibold">Description</th>
          <th className="px-4 py-3 font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.length === 0 ? (
          <tr>
            <td colSpan="7" className="px-4 py-3 text-center text-gray-600">
              No website bookings found.
            </td>
          </tr>
        ) : (
          bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">{booking.company_name}</td>
              <td className="px-4 py-3">{booking.contact_email}</td>
              <td className="px-4 py-3">{booking.website_type}</td>
              <td className="px-4 py-3">{booking.industry}</td>
              <td className="px-4 py-3">{booking.features}</td>
              <td className="px-4 py-3">{booking.description}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status || "Pending"}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const BrandingTable = ({ bookings }) => (
  <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
    <h3 className="text-lg font-semibold mb-2 text-gray-800">
      Branding Bookings
    </h3>
    <table className="min-w-full text-sm text-left text-gray-800">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 font-semibold">Brand Name</th>
          <th className="px-4 py-3 font-semibold">Email</th>
          <th className="px-4 py-3 font-semibold">Colors</th>
          <th className="px-4 py-3 font-semibold">Contact Method</th>
          <th className="px-4 py-3 font-semibold">Description</th>
          <th className="px-4 py-3 font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-4 py-3 text-center text-gray-600">
              No branding bookings found.
            </td>
          </tr>
        ) : (
          bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">{booking.brand_name}</td>
              <td className="px-4 py-3">{booking.contact_email}</td>
              <td className="px-4 py-3">{booking.colors.join(", ")}</td>
              <td className="px-4 py-3">
                {booking.preferred_contact_method ||
                  booking.contact_means ||
                  "N/A"}
              </td>
              <td className="px-4 py-3">{booking.description}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status || "Pending"}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const SocialMediaTable = ({ bookings }) => (
  <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
    <h3 className="text-lg font-semibold mb-2 text-gray-800">
      Social Media Management Bookings
    </h3>
    <table className="min-w-full text-sm text-left text-gray-800">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 font-semibold">Company Name</th>
          <th className="px-4 py-3 font-semibold">Email</th>
          <th className="px-4 py-3 font-semibold">Audience</th>
          <th className="px-4 py-3 font-semibold">Contact Method</th>
          <th className="px-4 py-3 font-semibold">Description</th>
          <th className="px-4 py-3 font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-4 py-3 text-center text-gray-600">
              No social media bookings found.
            </td>
          </tr>
        ) : (
          bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">{booking.company_name}</td>
              <td className="px-4 py-3">{booking.contact_email}</td>
              <td className="px-4 py-3">{booking.audience}</td>
              <td className="px-4 py-3">
                {booking.preferred_contact_method ||
                  booking.contact_means ||
                  "N/A"}
              </td>
              <td className="px-4 py-3">{booking.description}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status || "Pending"}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const Bookings = () => {
  const { service } = useParams(); // Get service from URL (e.g., photography, webdev)
  const [filterService, setFilterService] = useState(service || "all");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [photography, setPhotography] = useState([]);
  const [branding, setBranding] = useState([]);
  const [website, setWebsite] = useState([]);
  const [socialmedia, setSocialmedia] = useState([]);

  const serviceOptions = [
    { value: "all", label: "All Services" },
    { value: "photography", label: "Photography" },
    { value: "website", label: "Web Dev/UIUX" },
    { value: "branding", label: "Branding" },
    { value: "social-media", label: "Social Media Management" },
  ];

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const services = ["photography", "website", "branding", "social-media"];
      const setters = [setPhotography, setWebsite, setBranding, setSocialmedia];
      const cacheKeys = [
        "photographyBookings",
        "websiteBookings",
        "brandingBookings",
        "socialmediaBookings",
      ];
      setFilterService(service);

      for (let i = 0; i < services.length; i++) {
        const cacheKey = cacheKeys[i];
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(`${cacheKey}Timestamp`);

        if (
          cachedData &&
          cachedTimestamp &&
          Date.now() - parseInt(cachedTimestamp) < CACHE_DURATION
        ) {
          setters[i](JSON.parse(cachedData));
        } else {
          const res = await api.get(`/${services[i]}`);
          const data = res.data || [];
          setters[i](data);
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(`${cacheKey}Timestamp`, Date.now().toString());
        }
      }
      setApiError("");
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setApiError(
        error.response?.data?.message ||
          "Failed to load bookings. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [service]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Service Bookings
      </h2>
      {apiError && (
        <div className="mb-4">
          <p className="text-red-500 text-sm">{apiError}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Retry Loading Data
          </button>
        </div>
      )}
      {isLoading && <LoadingIndicator />}
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
      {!isLoading && (
        <>
          {(filterService === "all" || filterService === "photography") && (
            <PhotographyTable bookings={photography} />
          )}
          {(filterService === "all" || filterService === "website") && (
            <WebsiteTable bookings={website} />
          )}
          {(filterService === "all" || filterService === "branding") && (
            <BrandingTable bookings={branding} />
          )}
          {(filterService === "all" || filterService === "social-media") && (
            <SocialMediaTable bookings={socialmedia} />
          )}
          {filterService === "all" &&
            photography.length === 0 &&
            website.length === 0 &&
            branding.length === 0 &&
            socialmedia.length === 0 && (
              <p className="text-gray-600 text-center">
                No bookings found for any service.
              </p>
            )}
          {filterService !== "all" &&
            filterService === "photography" &&
            photography.length === 0 && (
              <p className="text-gray-600 text-center">
                No photography bookings found.
              </p>
            )}
          {filterService !== "all" &&
            filterService === "website" &&
            website.length === 0 && (
              <p className="text-gray-600 text-center">
                No website bookings found.
              </p>
            )}
          {filterService !== "all" &&
            filterService === "branding" &&
            branding.length === 0 && (
              <p className="text-gray-600 text-center">
                No branding bookings found.
              </p>
            )}
          {filterService !== "all" &&
            filterService === "social-media" &&
            socialmedia.length === 0 && (
              <p className="text-gray-600 text-center">
                No social media bookings found.
              </p>
            )}
        </>
      )}
    </div>
  );
};

export default Bookings;
