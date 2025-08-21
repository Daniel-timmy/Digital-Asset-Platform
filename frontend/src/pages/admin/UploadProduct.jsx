import React, { useState, useEffect } from "react";
import Select from "react-select";
import api from "../../utils/api";

const UploadProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file_url: "",
    file_type: "",
    category: "",
    price: "",
    file: null,
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [tagOptions, setTagOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // New form state for creating tag/category
  const [newItemForm, setNewItemForm] = useState({
    type: "tag",
    name: "",
  });
  const [newItemErrors, setNewItemErrors] = useState({});
  const [newItemSuccessMessage, setNewItemSuccessMessage] = useState("");

  // Static file type options
  const fileTypeOptions = [
    { value: "image", label: "Image" },
    { value: "vector", label: "Vector" },
    { value: "template", label: "Template" },
    { value: "video", label: "Video" },
  ];

  // Options for tag/category creation type
  const itemTypeOptions = [
    { value: "tag", label: "Tag" },
    { value: "category", label: "Category" },
  ];

  // Fetch tags and categories or load from localStorage
  useEffect(() => {
    const getTagsandCategories = async () => {
      try {
        // Check localStorage for cached data
        const cachedTags = localStorage.getItem("tags");
        const cachedCategories = localStorage.getItem("categories");

        if (cachedTags && cachedCategories) {
          setTagOptions(JSON.parse(cachedTags));
          setCategoryOptions(JSON.parse(cachedCategories));
          return;
        }

        // Fetch tags if not cached
        if (!cachedTags) {
          const tagRes = await api.get("/tags");
          const tags = (tagRes.data.data || tagRes.data || []).map((tag) => ({
            value: tag.id,
            label: tag.name,
          }));
          setTagOptions(tags);
          localStorage.setItem("tags", JSON.stringify(tags));
        }

        // Fetch categories if not cached
        if (!cachedCategories) {
          const catRes = await api.get("/category");
          const categories = (catRes.data.data || catRes.data || []).map(
            (category) => ({
              value: category.id,
              label: category.name,
            })
          );
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

  // Handle input changes for product form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, file }));
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  // Handle select changes for product form
  const handleSelectChange = (name) => (selected) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selected ? selected.value : "",
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle multi-select for tags
  const handleTagsChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      tags: selected ? selected.map((option) => option.value) : [],
    }));
    setErrors((prev) => ({ ...prev, tags: "" }));
  };

  // Handle input changes for new tag/category form
  const handleNewItemInputChange = (e) => {
    const { name, value } = e.target;
    setNewItemForm((prev) => ({ ...prev, [name]: value }));
    setNewItemErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle select changes for new tag/category form
  const handleNewItemTypeChange = (selected) => {
    setNewItemForm((prev) => ({
      ...prev,
      type: selected ? selected.value : "tag",
    }));
    setNewItemErrors((prev) => ({ ...prev, type: "" }));
  };

  // Validate and submit product form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.file_type) newErrors.file_type = "File Type is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be a positive number";
    if (!formData.file) newErrors.file = "File upload is required";
    if (formData.tags.length === 0)
      newErrors.tags = "At least one tag is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setApiError("");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("file_url", formData.file_url);
    formDataToSend.append("file_type", formData.file_type);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("file", formData.file);
    formDataToSend.append("tagsId", JSON.stringify(formData.tags));

    try {
      const res = await api.post("/assets", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Product uploaded:", res.data);

      // Reset form after successful submission
      setFormData({
        name: "",
        description: "",
        file_url: "",
        file_type: "",
        category: "",
        price: "",
        file: null,
        tags: [],
      });
      setErrors({});
      setApiError("");
      setSuccessMessage("Product uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading product:", error);
      setApiError(
        error.response?.data?.message ||
          "Failed to upload product. Please try again."
      );
      setSuccessMessage("");
    }
  };

  // Validate and submit new tag/category form
  const handleNewItemSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!newItemForm.name.trim()) newErrors.name = "Name is required";
    if (!newItemForm.type) newErrors.type = "Type is required";

    if (Object.keys(newErrors).length > 0) {
      setNewItemErrors(newErrors);
      setApiError("");
      return;
    }

    try {
      const endpoint = newItemForm.type === "tag" ? "/tags" : "/category";
      const res = await api.post(endpoint, { name: newItemForm.name });
      const newItem = res.data.data || res.data;

      // Update state and localStorage
      if (newItemForm.type === "tag") {
        const newTag = { value: newItem.id, label: newItem.name };
        const updatedTags = [...tagOptions, newTag];
        setTagOptions(updatedTags);
        localStorage.setItem("tags", JSON.stringify(updatedTags));
      } else {
        const newCategory = { value: newItem.id, label: newItem.name };
        const updatedCategories = [...categoryOptions, newCategory];
        setCategoryOptions(updatedCategories);
        localStorage.setItem("categories", JSON.stringify(updatedCategories));
      }

      // Reset form after successful submission
      setNewItemForm({ type: "tag", name: "" });
      setNewItemErrors({});
      setApiError("");
      setNewItemSuccessMessage(
        `${
          newItemForm.type === "tag" ? "Tag" : "Category"
        } created successfully!`
      );
      setTimeout(() => setNewItemSuccessMessage(""), 3000);
    } catch (error) {
      console.error(`Error creating ${newItemForm.type}:`, error);
      setApiError(
        error.response?.data?.message ||
          `Failed to create ${newItemForm.type}. Please try again.`
      );
      setNewItemSuccessMessage("");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Upload New Product
      </h2>
      {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
      {successMessage && (
        <p className="text-green-500 text-sm mb-4">{successMessage}</p>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-xl mb-8"
      >
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Product Name"
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-red-500 text-sm mt-1">
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            rows="4"
            placeholder="Description"
            aria-invalid={errors.description ? "true" : "false"}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
          />
          {errors.description && (
            <p id="description-error" className="text-red-500 text-sm mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* File URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File URL
          </label>
          <input
            type="text"
            name="file_url"
            value={formData.file_url}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
              errors.file_url ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter file URL"
            aria-invalid={errors.file_url ? "true" : "false"}
            aria-describedby={errors.file_url ? "file_url-error" : undefined}
          />
          {errors.file_url && (
            <p id="file_url-error" className="text-red-500 text-sm mt-1">
              {errors.file_url}
            </p>
          )}
        </div>

        {/* File Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Type
          </label>
          <Select
            options={fileTypeOptions}
            value={fileTypeOptions.find(
              (option) => option.value === formData.file_type
            )}
            onChange={handleSelectChange("file_type")}
            className={`w-full ${errors.file_type ? "border-red-500" : ""}`}
            placeholder="Select File Type"
            aria-invalid={errors.file_type ? "true" : "false"}
            aria-describedby={errors.file_type ? "file_type-error" : undefined}
          />
          {errors.file_type && (
            <p id="file_type-error" className="text-red-500 text-sm mt-1">
              {errors.file_type}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select
            options={categoryOptions}
            value={categoryOptions.find(
              (option) => option.value === formData.category
            )}
            onChange={handleSelectChange("category")}
            className={`w-full ${errors.category ? "border-red-500" : ""}`}
            placeholder="Select Category"
            aria-invalid={errors.category ? "true" : "false"}
            aria-describedby={errors.category ? "category-error" : undefined}
          />
          {errors.category && (
            <p id="category-error" className="text-red-500 text-sm mt-1">
              {errors.category}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₦)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Price (₦)"
            min="0"
            step="0.01"
            aria-invalid={errors.price ? "true" : "false"}
            aria-describedby={errors.price ? "price-error" : undefined}
          />
          {errors.price && (
            <p id="price-error" className="text-red-500 text-sm mt-1">
              {errors.price}
            </p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Upload
          </label>
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            className={`w-full ${errors.file ? "border-red-500" : ""}`}
            accept="image/*,video/*,.svg,.pdf"
            aria-invalid={errors.file ? "true" : "false"}
            aria-describedby={errors.file ? "file-error" : undefined}
          />
          {formData.file && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {formData.file.name}
              {formData.file_type === "image" && (
                <img
                  src={URL.createObjectURL(formData.file)}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-md"
                />
              )}
            </p>
          )}
          {errors.file && (
            <p id="file-error" className="text-red-500 text-sm mt-1">
              {errors.file}
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <Select
            isMulti
            options={tagOptions}
            value={tagOptions.filter((option) =>
              formData.tags.includes(option.value)
            )}
            onChange={handleTagsChange}
            className={`w-full ${errors.tags ? "border-red-500" : ""}`}
            placeholder="Select Tags"
            aria-invalid={errors.tags ? "true" : "false"}
            aria-describedby={errors.tags ? "tags-error" : undefined}
          />
          {errors.tags && (
            <p id="tags-error" className="text-red-500 text-sm mt-1">
              {errors.tags}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          Upload
        </button>
      </form>

      {/* New Tag/Category Form */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Tag or Category
      </h2>
      {newItemSuccessMessage && (
        <p className="text-green-500 text-sm mb-4">{newItemSuccessMessage}</p>
      )}
      <form
        onSubmit={handleNewItemSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-xl"
      >
        {/* Item Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <Select
            options={itemTypeOptions}
            value={itemTypeOptions.find(
              (option) => option.value === newItemForm.type
            )}
            onChange={handleNewItemTypeChange}
            className={`w-full ${newItemErrors.type ? "border-red-500" : ""}`}
            placeholder="Select Type"
            aria-invalid={newItemErrors.type ? "true" : "false"}
            aria-describedby={newItemErrors.type ? "type-error" : undefined}
          />
          {newItemErrors.type && (
            <p id="type-error" className="text-red-500 text-sm mt-1">
              {newItemErrors.type}
            </p>
          )}
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={newItemForm.name}
            onChange={handleNewItemInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
              newItemErrors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder={`Enter ${newItemForm.type} name`}
            aria-invalid={newItemErrors.name ? "true" : "false"}
            aria-describedby={
              newItemErrors.name ? "item-name-error" : undefined
            }
          />
          {newItemErrors.name && (
            <p id="item-name-error" className="text-red-500 text-sm mt-1">
              {newItemErrors.name}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default UploadProduct;
