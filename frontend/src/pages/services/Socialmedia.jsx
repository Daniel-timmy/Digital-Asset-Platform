import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

const SocialMedia = () => {
  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    audience: "",
    contact_email: "",
    preferred_contact_method: "",
    contact_means: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.audience.trim()) {
      newErrors.audience = "Target audience is required";
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    if (!formData.preferred_contact_method) {
      newErrors.preferred_contact_method =
        "Preferred contact method is required";
    }

    if (!formData.contact_means.trim()) {
      newErrors.contact_means = "Contact means is required";
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
      const response = await api.post("/social-media", {
        ...formData,
        service: "social-media",
      });
      setSubmitStatus("success");
      setTimeout(() => {
        setSubmitStatus(null);
        setFormData({
          company_name: "",
          description: "",
          audience: "",
          contact_email: "",
          preferred_contact_method: "",
          contact_means: "",
        });
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      console.error("Social Media request error:", error);
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    let timer;
    if (submitStatus) {
      timer = setTimeout(() => setSubmitStatus(null), 3000);
    }
    return () => clearTimeout(timer);
  }, [submitStatus]);

  return (
    <>
      <Header />
      <div className="bg-white py-16 px-4 min-h-screen font-[Inter] flex justify-center items-start">
        <div className="bg-[#f8f1e6] rounded-2xl shadow-xl p-10 w-full max-w-4xl">
          {/* Success/Error Alert */}
          {submitStatus === "success" && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              Social Media request submitted successfully!
            </div>
          )}
          {submitStatus === "error" && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              Error submitting Social Media request. Please try again.
            </div>
          )}

          {/* Tabs */}
          <div className="flex justify-center gap-10 mb-8 border-b border-gray-300">
            <button className="text-black text-lg font-semibold pb-2 border-b-2 border-black">
              Social Media Management
            </button>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold mb-8">
            Request A Social Media Management Service
          </h2>

          {/* Form */}
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleFormSubmit}
          >
            <div>
              <label className="block font-medium mb-2">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Enter Company Name"
                className={`w-full bg-white text-black p-3 border rounded-md ${
                  errors.company_name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.company_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.company_name}
                </p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                placeholder="Enter Contact Email"
                className={`w-full bg-white text-black p-3 border rounded-md ${
                  errors.contact_email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.contact_email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contact_email}
                </p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2 text-[var(--text-color)]">Target Audience</label>
              <input
                type="text"
                name="audience"
                value={formData.audience}
                onChange={handleInputChange}
                placeholder="e.g., Students, Entrepreneurs"
                className={`w-full bg-white text-black p-3 border rounded-md ${
                  errors.audience ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.audience && (
                <p className="text-red-500 text-sm mt-1">{errors.audience}</p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">
                Preferred Contact Method
              </label>
              <select
                name="preferred_contact_method"
                value={formData.preferred_contact_method}
                onChange={handleInputChange}
                className={`w-full bg-white text-black p-3 border rounded-md ${
                  errors.preferred_contact_method
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select Preferred Contact Method</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="video-call">Video Call</option>
              </select>
              {errors.preferred_contact_method && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.preferred_contact_method}
                </p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Contact Means</label>
              <input
                type="text"
                name="contact_means"
                value={formData.contact_means}
                onChange={handleInputChange}
                placeholder="e.g., Phone number, WhatsApp handle"
                className={`w-full bg-white text-black p-3 border rounded-md ${
                  errors.contact_means ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.contact_means && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contact_means}
                </p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2 text-[var(--text-color)]">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us what you're looking for..."
                className={`w-full bg-white text-black p-3 border rounded-md h-28 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
            {/* Button */}
            <div className="col-span-1 md:col-span-2 flex justify-center mt-10">
              <button
                type="submit"
                disabled={isLoading}
                className={`py-3 px-12 rounded-sm flex items-center justify-center gap-2 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {isLoading ? <LoadingIndicator /> : "Proceed"}
                {!isLoading && <span>→</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SocialMedia;
