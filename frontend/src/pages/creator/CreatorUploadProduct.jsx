import React, { useState, useEffect } from "react";
import Select from "react-select";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";
import {
  CloudArrowUpIcon,
  PhotoIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const CreatorUploadProduct = () => {
  const [loading, setLoading] = useState(false);
  // const [tagLoading, setTagLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file_url: "",
    file_type: "",
    category: "",
    price: "",
    file: null,
    tags: [],

    license: "",
  });
  const [errors, setErrors] = useState({});
  const [tagOptions, setTagOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  const fileTypeOptions = [
    { value: "image", label: "Image" },
    { value: "vector", label: "Vector" },
    { value: "template", label: "Template" },
    { value: "video", label: "Video" },
  ];

  const itemTypeOptions = [
    { value: "tag", label: "Tag" },
    { value: "category", label: "Category" },
  ];

  const licenseOptions = [
    { value: "free", label: "Free" },
    { value: "premium", label: "Premium" },
  ];

  useEffect(() => {
    const getTagsandCategories = async () => {
      try {
        const cachedTags = localStorage.getItem("tags");
        const cachedCategories = localStorage.getItem("categories");

        if (cachedTags && cachedCategories) {
          setTagOptions(JSON.parse(cachedTags));
          setCategoryOptions(JSON.parse(cachedCategories));
          return;
        }

        if (!cachedTags) {
          const tagRes = await api.get("/tags");
          const tags = (tagRes.data || []).map((tag) => ({
            value: tag.id,
            label: tag.name,
          }));
          setTagOptions(tags);
          localStorage.setItem("tags", JSON.stringify(tags));
        }

        if (!cachedCategories) {
          const catRes = await api.get("/category");
          const categories = (catRes.data || []).map((category) => ({
            value: category.id,
            label: category.name,
          }));
          setCategoryOptions(categories);
          localStorage.setItem("categories", JSON.stringify(categories));
        }
      } catch (error) {
        console.error("Error fetching tags or categories:", error);
        setApiError("Failed to load tags or categories. Please try again.");
      }
    };
    getTagsandCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const determineFileType = (mimeType) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newFileType = determineFileType(file.type);
      setFormData((prev) => ({
        ...prev,
        file,
        file_type: newFileType || prev.file_type,
      }));
    }
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleSelectChange = (name) => (selected) => {
    if (name === "license") {
      const licenseValue = selected ? selected.value : "";
      setFormData((prev) => ({
        ...prev,
        license: licenseValue,
        price: licenseValue === "free" ? "0" : prev.price,
      }));
      setErrors((prev) => ({ ...prev, license: "" }));
      if (licenseValue === "free") {
        setErrors((prev) => ({ ...prev, price: "" }));
      }
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: selected ? selected.value : "",
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTagsChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      tags: selected ? selected.map((option) => option.value) : [],
    }));
    setErrors((prev) => ({ ...prev, tags: "" }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.file_type) newErrors.file_type = "File Type is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || formData.price < 0)
      newErrors.price = "Price must be a positive number";
    if (!formData.file) newErrors.file = "File upload is required";
    if (formData.tags.length === 0)
      newErrors.tags = "At least one tag is required";

    if (!formData.license) newErrors.license = "License is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setApiError("");
      return;
    }

    setLoading(true);
    setApiError("");
    setSuccessMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("file_type", formData.file_type);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("tagsId", JSON.stringify(formData.tags));
      formDataToSend.append("file", formData.file);

      formDataToSend.append("license", formData.license);

      const res = await api.post("/assets", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Product uploaded:", res.data);

      // setFormData({
      //   name: "",
      //   description: "",
      //   file_url: "",
      //   file_type: "",
      //   category: "",
      //   price: "",
      //   file: null,
      //   tags: [],

      //   license: "",
      // });
      setErrors({});
      setSuccessMessage("Product uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading product:", error);
      setApiError(
        error.response?.data?.message ||
        "Failed to upload product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <CloudArrowUpIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Upload New Product
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Add your digital products to the marketplace
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5" />
            <p className="text-red-800 text-sm">{apiError}</p>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6 animate-fade-in"
        style={{ animationDelay: "100ms" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? "border-red-500" : "border-gray-200"
                }`}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${errors.description ? "border-red-500" : "border-gray-200"
                }`}
              rows="4"
              placeholder="Describe your product"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* File Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              File Type
            </label>
            <Select
              options={fileTypeOptions}
              value={fileTypeOptions.find(
                (option) => option.value === formData.file_type
              )}
              onChange={handleSelectChange("file_type")}
              className={errors.file_type ? "border-red-500" : ""}
              placeholder="Select file type"
            />
            {errors.file_type && (
              <p className="text-red-500 text-sm mt-1">{errors.file_type}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <Select
              options={categoryOptions}
              value={categoryOptions.find(
                (option) => option.value === formData.category
              )}
              onChange={handleSelectChange("category")}
              className={errors.category ? "border-red-500" : ""}
              placeholder="Select category"
            />
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* License */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              License
            </label>
            <Select
              options={licenseOptions}
              value={licenseOptions.find(
                (option) => option.value === formData.license
              )}
              onChange={handleSelectChange("license")}
              className={errors.license ? "border-red-500" : ""}
              placeholder="Select license"
            />
            {errors.license && (
              <p className="text-red-500 text-sm mt-1">{errors.license}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price (₦)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.price ? "border-red-500" : "border-gray-200"
                }`}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={formData.license === "free"}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          {/* Main File Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main File Upload
            </label>
            <div className="relative">
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".fig,.psd,.svg,.gif,.png, .mp3, .jpeg,.jpg,.pdf,image/jpeg,image/png,image/webp,image/gif,application/pdf,image/svg+xml"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-3 w-full px-6 py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer"
              >
                <DocumentIcon className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {formData.file
                      ? formData.file.name
                      : "Click to upload file"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF, SVG up to 10MB
                  </p>
                </div>
              </label>
            </div>
            {formData.file && formData.file.type.startsWith("image/") && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(formData.file)}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
            {errors.file && (
              <p className="text-red-500 text-sm mt-1">{errors.file}</p>
            )}
          </div>



          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags
            </label>
            <Select
              isMulti
              options={tagOptions}
              value={tagOptions.filter((option) =>
                formData.tags.includes(option.value)
              )}
              onChange={handleTagsChange}
              className={errors.tags ? "border-red-500" : ""}
              placeholder="Select tags"
            />
            {errors.tags && (
              <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          {loading ? (
            <LoadingIndicator />
          ) : (
            <button
              type="submit"
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              Upload Product
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreatorUploadProduct;
