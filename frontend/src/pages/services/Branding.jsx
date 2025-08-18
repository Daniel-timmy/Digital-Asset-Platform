import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

export default function Branding() {
  const [formData, setFormData] = useState({
    brandName: "",
    brandingType: "",
    contact_email: "",
    colors: "",
    preferred_contact_method: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brandName.trim()) {
      newErrors.brandName = "Brand name is required";
    }

    if (!formData.brandingType) {
      newErrors.brandingType = "Please select a branding type";
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    if (!formData.colors) {
      newErrors.colors = "Please select a brand color";
    }

    if (!formData.preferred_contact_method) {
      newErrors.preferred_contact_method =
        "Please select a preferred communication method";
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
      const response = await api.post("/branding", formData);
      setSubmitStatus("success");
      setTimeout(() => {
        setSubmitStatus(null);
        setFormData({
          brandName: "",
          brandingType: "",
          contact_email: "",
          colors: "",
          preferred_contact_method: "",
          description: "",
        });
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      console.error("Branding request error:", error);
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
    <div className="bg-[#ffffff] flex flex-col min-h-screen font-[Inter]">
      <Header />
      <main className="flex justify-center p-4">
        <div className="bg-[#f4e8d8] w-full max-w-3xl rounded-3xl p-8 shadow-lg">
          {/* Success/Error Alert */}
          {submitStatus === "success" && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              Branding request submitted successfully!
            </div>
          )}
          {submitStatus === "error" && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              Error submitting branding request. Please try again.
            </div>
          )}

          {/* Tabs */}
          <div className="flex justify-between border-b-2 border-[#b4a99b] mb-8">
            <div className="text-black font-semibold text-lg pb-2 border-b-4 border-black w-1/2 text-center">
              Branding
            </div>
          </div>

          <h2 className="text-black text-2xl font-semibold mb-6">
            Request A Branding Service
          </h2>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleFormSubmit}
          >
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Brand Name
              </label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                className={`w-full border rounded-md p-3 text-sm bg-white ${
                  errors.brandName ? "border-red-500" : ""
                }`}
                placeholder="Enter Brand Name"
              />
              {errors.brandName && (
                <p className="text-red-500 text-sm mt-1">{errors.brandName}</p>
              )}
            </div>

            {/* Branding Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Branding Type
              </label>
              <select
                name="brandingType"
                value={formData.brandingType}
                onChange={handleInputChange}
                className={`w-full border rounded-md p-3 text-sm bg-white ${
                  errors.brandingType ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Branding Type</option>
                <option value="logo-design">Logo Design</option>
                <option value="product-branding">Product Branding</option>
                <option value="full-brand-identity">Full Brand Identity</option>
                <option value="other">Other</option>
              </select>
              {errors.brandingType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.brandingType}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                className={`w-full border rounded-md p-3 text-sm bg-white ${
                  errors.contact_email ? "border-red-500" : ""
                }`}
                placeholder="Enter Email Address"
              />
              {errors.contact_email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contact_email}
                </p>
              )}
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-semibold mb-2">Colors</label>
              <select
                name="colors"
                value={formData.colors}
                onChange={handleInputChange}
                className={`w-full border rounded-md p-3 text-sm bg-white ${
                  errors.colors ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Brand Color</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="custom">Custom</option>
              </select>
              {errors.colors && (
                <p className="text-red-500 text-sm mt-1">{errors.colors}</p>
              )}
              <div className="flex space-x-2 mt-2">
                <div className="w-6 h-2 bg-red-600"></div>
                <div className="w-6 h-2 bg-blue-600"></div>
              </div>
            </div>

            {/* Preferred means of communication */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Preferred Means of Communication
              </label>
              <select
                name="preferred_contact_method"
                value={formData.preferred_contact_method}
                onChange={handleInputChange}
                className={`w-full border rounded-md p-3 text-sm bg-white ${
                  errors.preferred_contact_method ? "border-red-500" : ""
                }`}
              >
                <option value="">Select</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="video-call">Video Call</option>
              </select>
              {errors.preferred_contact_method && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.preferred_contact_method}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border rounded-md p-3 text-sm bg-white"
                placeholder="Add description"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-12 py-3 rounded-md text-sm flex items-center justify-center ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {isLoading ? <LoadingIndicator /> : "Submit →"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
