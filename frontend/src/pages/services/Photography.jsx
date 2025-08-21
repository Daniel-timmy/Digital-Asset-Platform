import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

const Photography = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    eventType: "",
    pictureType: "",
    event_date: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact information is required";
    } else if (
      !/^\S+@\S+\.\S+$/.test(formData.contact) && // email validation
      !/^\+?[\d\s-]{10,}$/.test(formData.contact) // phone validation
    ) {
      newErrors.contact = "Please enter a valid email or Whatsapp number";
    }

    if (!formData.eventType) {
      newErrors.eventType = "Please select an event type";
    }

    if (!formData.pictureType) {
      newErrors.pictureType = "Please select a picture type";
    }

    if (!formData.event_date) {
      newErrors.event_date = "Please select date and time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/photography", formData);
      setSubmitStatus("success");
      setTimeout(() => {
        setSubmitStatus(null);
        setFormData({
          name: "",
          contact: "",
          eventType: "",
          pictureType: "",
          event_date: "",
          description: "",
        });
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      console.error("Booking error:", error);
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    // Cleanup for alerts
    let timer;
    if (submitStatus) {
      timer = setTimeout(() => setSubmitStatus(null), 3000);
    }
    return () => clearTimeout(timer);
  }, [submitStatus]);

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-[Inter,sans-serif]">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          Book Photography Session
        </h1>

        {/* Success/Error Alert */}
        {submitStatus === "success" && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
            Booking submitted successfully!
          </div>
        )}
        {submitStatus === "error" && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            Error submitting booking. Please try again.
          </div>
        )}

        {/* Card Section */}
        <div className="bg-[#f8f1e6] rounded-xl p-6 md:p-10 shadow-md flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-5xl font-extrabold leading-tight mb-4">
              Book A <br /> Session
            </h2>
            <p className="text-gray-600 text-lg">
              Capture your moments with a professional photography session. Book
              now for stunning, timeless memories.
            </p>
          </div>

          <div className="flex-1 space-y-4">
            <form onSubmit={handleFormSubmit}>
              <div>
                <label className="text-base font-semibold">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Your Name"
                  className={`w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="text-base font-semibold">
                  Contact(Email or Whatsapp Number)
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Email/Phone"
                  className={`w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ${
                    errors.contact ? "border-red-500" : ""
                  }`}
                />
                {errors.contact && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
                )}
              </div>
              <div>
                <label className="text-base font-semibold">Event Type</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ${
                    errors.eventType ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Event Type</option>
                  <option value="wedding">Wedding</option>
                  <option value="portrait">Portrait</option>
                  <option value="event">Event</option>
                  <option value="commercial">Commercial</option>
                </select>
                {errors.eventType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventType}
                  </p>
                )}
              </div>
              <div>
                <label className="text-base font-semibold">Picture Type</label>
                <select
                  name="pictureType"
                  value={formData.pictureType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ${
                    errors.pictureType ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Picture Type</option>
                  <option value="color">Color</option>
                  <option value="black-and-white">Black & White</option>
                  <option value="vintage">Vintage</option>
                </select>
                {errors.pictureType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.pictureType}
                  </p>
                )}
              </div>
              <div>
                <label className="text-base font-semibold">Date And Time</label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ${
                    errors.event_date ? "border-red-500" : ""
                  }`}
                />
                {errors.event_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.event_date}
                  </p>
                )}
              </div>
              <div>
                <label className="text-base font-semibold">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add description"
                  rows={3}
                  className="w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded transition flex items-center justify-center ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {isLoading ? <LoadingIndicator /> : "Submit Booking"}
              </button>
            </form>
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
              [
                "STEP 1",
                "Send email",
                "We receive your request and respond promptly to initiate your project.",
              ],
              [
                "STEP 2",
                "Meet online",
                "A meeting is scheduled to understand your goals and vision clearly.",
              ],
              [
                "STEP 3",
                "Price estimation",
                "We provide a detailed estimate tailored to your specific needs.",
              ],
              [
                "STEP 4",
                "Work together",
                "Collaboration begins to bring your project to life.",
              ],
            ].map(([step, title, desc], idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-8">
                <div className="min-w-[150px] text-lg font-bold text-gray-800">
                  {step}
                </div>
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
