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
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

const UploadProduct = () => {
  const [loading, setLoading] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file_url: "",
    file_type: "",
    category: "",
    price: "",
    file: null,
    tags: [],
    thumbnail: null,
    thumbnail_url: "",
  });
  const [errors, setErrors] = useState({});
  const [tagOptions, setTagOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [newItemForm, setNewItemForm] = useState({
    type: "tag",
    name: "",
  });
  const [newItemErrors, setNewItemErrors] = useState({});
  const [newItemSuccessMessage, setNewItemSuccessMessage] = useState("");

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

  const handleNewItemInputChange = (e) => {
    const { name, value } = e.target;
    setNewItemForm((prev) => ({ ...prev, [name]: value }));
    setNewItemErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNewItemTypeChange = (selected) => {
    setNewItemForm((prev) => ({
      ...prev,
      type: selected ? selected.value : "tag",
    }));
    setNewItemErrors((prev) => ({ ...prev, type: "" }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    let error = "";
    if (file) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        error = "Thumbnail must be an image or a video file";
      } else if (isImage && file.size > 2 * 1024 * 1024) {
        error = "Image thumbnail must be less than 2MB";
      } else if (isVideo && file.size > 5 * 1024 * 1024) {
        error = "Video thumbnail must be less than 5MB";
      }
      setFormData((prev) => ({
        ...prev,
        thumbnail: error ? null : file,
      }));
      setErrors((prev) => ({
        ...prev,
        thumbnail: error,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        thumbnail: null,
      }));
      setErrors((prev) => ({
        ...prev,
        thumbnail: "",
      }));
    }
  };

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
    if (!formData.thumbnail) newErrors.thumbnail = "Thumbnail is required";

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
      formDataToSend.append("thumbnail", formData.thumbnail);

      const res = await api.post("/assets", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Product uploaded:", res.data);

      setFormData({
        name: "",
        description: "",
        file_url: "",
        file_type: "",
        category: "",
        price: "",
        file: null,
        tags: [],
        thumbnail: null,
        thumbnail_url: "",
      });
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

  const handleNewItemSubmit = async (e) => {
    e.preventDefault();
    setTagLoading(true);
    const newErrors = {};

    if (!newItemForm.name.trim()) newErrors.name = "Name is required";
    if (!newItemForm.type) newErrors.type = "Type is required";

    if (Object.keys(newErrors).length > 0) {
      setNewItemErrors(newErrors);
      setApiError("");
      setTagLoading(false);
      return;
    }

    try {
      const endpoint = newItemForm.type === "tag" ? "/tags" : "/category";
      const res = await api.post(endpoint, { name: newItemForm.name });
      const newItem = res.data.data || res.data;

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
    } finally {
      setTagLoading(false);
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
              Add digital products to the marketplace
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
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                errors.description ? "border-red-500" : "border-gray-200"
              }`}
              rows="4"
              placeholder="Describe the product"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

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

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price (₦)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.price ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

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
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
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
                    PNG, JPG, MP4 up to 10MB
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

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thumbnail (Image ≤2MB or Video ≤5MB)
            </label>
            <div className="relative">
              <input
                type="file"
                name="thumbnail"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
              />
              <label
                htmlFor="thumbnail-upload"
                className="flex items-center justify-center gap-3 w-full px-6 py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer"
              >
                <PhotoIcon className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {formData.thumbnail
                      ? formData.thumbnail.name
                      : "Click to upload thumbnail"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Image or Video for preview
                  </p>
                </div>
              </label>
            </div>
            {formData.thumbnail && (
              <div className="mt-4">
                {formData.thumbnail.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(formData.thumbnail)}
                    alt="Thumbnail Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ) : formData.thumbnail.type.startsWith("video/") ? (
                  <video
                    src={URL.createObjectURL(formData.thumbnail)}
                    controls
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ) : null}
              </div>
            )}
            {errors.thumbnail && (
              <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>
            )}
          </div>

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

      {/* Create Tag/Category Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
            <PlusCircleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create New Tag or Category
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Add new tags or categories for products
            </p>
          </div>
        </div>

        {newItemSuccessMessage && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
              <p className="text-green-800 text-sm">{newItemSuccessMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleNewItemSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type
              </label>
              <Select
                options={itemTypeOptions}
                value={itemTypeOptions.find(
                  (option) => option.value === newItemForm.type
                )}
                onChange={handleNewItemTypeChange}
                className={newItemErrors.type ? "border-red-500" : ""}
                placeholder="Select type"
              />
              {newItemErrors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {newItemErrors.type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={newItemForm.name}
                onChange={handleNewItemInputChange}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  newItemErrors.name ? "border-red-500" : "border-gray-200"
                }`}
                placeholder={`Enter ${newItemForm.type} name`}
              />
              {newItemErrors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {newItemErrors.name}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4">
            {tagLoading ? (
              <LoadingIndicator />
            ) : (
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Create {newItemForm.type === "tag" ? "Tag" : "Category"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadProduct;