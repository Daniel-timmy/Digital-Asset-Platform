import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

const Webdev = () => {
  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    industry: "",
    contact_email: "",
    website_type: "",
    features: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("uiux"); // Track active tab: 'uiux' or 'website'

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
    }

    if (!formData.website_type) {
      newErrors.website_type =
        activeTab === "uiux"
          ? "Company type is required"
          : "Website type is required";
    }

    if (!formData.features) {
      newErrors.features =
        activeTab === "uiux"
          ? "Brand slogan is required"
          : "At least one feature is required";
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
      const endpoint = "/website";
      const response = await api.post(endpoint, {
        ...formData,
        service: activeTab, // Set service based on active tab
      });
      setSubmitStatus("success");
      setTimeout(() => {
        setSubmitStatus(null);
        setFormData({
          company_name: "",
          description: "",
          industry: "",
          contact_email: "",
          website_type: "",
          features: "",
        });
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      console.error(
        `${activeTab === "uiux" ? "UI/UX" : "Website"} request error:`,
        error
      );
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
        <div className="bg-[#f4e8d8] rounded-2xl shadow-xl p-10 w-full max-w-4xl">
          {/* Success/Error Alert */}
          {submitStatus === "success" && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              {activeTab === "uiux" ? "UI/UX" : "Website"} request submitted
              successfully!
            </div>
          )}
          {submitStatus === "error" && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              Error submitting {activeTab === "uiux" ? "UI/UX" : "Website"}{" "}
              request. Please try again.
            </div>
          )}

          {/* Tabs */}
          <div className="flex justify-center gap-10 mb-8 border-b border-black">
            <button
              className={`text-lg font-semibold pb-2 border-b-2 ${
                activeTab === "uiux"
                  ? "text-black border-black"
                  : "text-gray-400 border-gray-200"
              }`}
              onClick={() => setActiveTab("uiux")}
            >
              UI/UX Design
            </button>
            <button
              className={`text-lg font-medium pb-2 border-b-2 ${
                activeTab === "website"
                  ? "text-black border-black"
                  : "text-gray-400 border-grey-200"
              }`}
              onClick={() => setActiveTab("website")}
            >
              Website Development
            </button>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold mb-8">
            Request A{" "}
            {activeTab === "uiux" ? "UI/UX Design" : "Website Development"}{" "}
            Service
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
                  errors.company_name ? "border-red-500" : "border-black"
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
                  errors.contact_email ? "border-red-500" : "border-black"
                }`}
              />
              {errors.contact_email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contact_email}
                </p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                placeholder="Enter Industry (e.g., Tech, Retail)"
                className={`w-full bg-white text-black p-3 border rounded-md ${
                  errors.industry ? "border-red-500" : "border-black"
                }`}
              />
              {errors.industry && (
                <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">
                {activeTab === "uiux" ? "Company Type" : "Website Type"}
              </label>
              {activeTab === "uiux" ? (
                <input
                  type="text"
                  name="website_type"
                  value={formData.website_type}
                  onChange={handleInputChange}
                  placeholder="Enter Company Type (e.g., Tech, Retail)"
                  className={`w-full bg-white text-black p-3 border rounded-md ${
                    errors.website_type ? "border-red-500" : "border-black"
                  }`}
                />
              ) : (
                <select
                  name="website_type"
                  value={formData.website_type}
                  onChange={handleInputChange}
                  className={`w-full bg-white text-black p-3 border rounded-md ${
                    errors.website_type ? "border-red-500" : "border-black"
                  }`}
                >
                  <option value="">Select Website Type</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="blog">Blog</option>
                  <option value="corporate">Corporate</option>
                  <option value="other">Other</option>
                </select>
              )}
              {errors.website_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.website_type}
                </p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">
                {activeTab === "uiux" ? "Brand Slogan" : "Features Needed"}
              </label>
              {activeTab === "uiux" ? (
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="Enter your Brand Slogan"
                  className={`w-full bg-white text-black p-3 border rounded-md h-28 ${
                    errors.features ? "border-red-500" : "border-black"
                  }`}
                />
              ) : (
                <select
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  className={`w-full bg-white text-black p-3 border rounded-md ${
                    errors.features ? "border-red-500" : "border-black"
                  }`}
                >
                  <option value="">Select Features Needed</option>
                  <option value="contact-form">Contact Form</option>
                  <option value="ecommerce">E-commerce Functionality</option>
                  <option value="blog">Blog</option>
                  <option value="portfolio-gallery">Portfolio Gallery</option>
                  <option value="other">Other</option>
                </select>
              )}
              {errors.features && (
                <p className="text-red-500 text-sm mt-1">{errors.features}</p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2 text-[var(--text-color)]">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add description"
                className="w-full bg-white text-black p-3 border border-black rounded-md h-28"
              />
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

export default Webdev;
