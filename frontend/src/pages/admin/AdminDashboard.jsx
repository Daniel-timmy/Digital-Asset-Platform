import React, { useEffect, useState } from "react";
import {
  FaBoxOpen,
  FaUsers,
  FaClipboardList,
  FaMoneyBillWave,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import Select from "react-select";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

const AssetCard = ({ asset, onDelete, onUpdate }) => {
  const tagNames = asset.tags.map((tag) => tag.name).join(", ");
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
      {asset.file_type === "image" && asset.thumbnail_url && (
        <img
          // src={asset.file_url}
          alt={asset.name}
          className="w-full h-40 object-cover rounded-md"
        />
      )}
      <div>
        <h3 className="text-lg font-bold">{asset.name}</h3>
        <p className="text-sm text-gray-500">{asset.description}</p>
        <p className="text-sm">Type: {asset.file_type}</p>
        <p className="text-sm">Category: {asset.category.name}</p>
        <p className="text-sm">Price: ₦{asset.price.toLocaleString("en-NG")}</p>
        <p className="text-sm">Tags: {tagNames || "None"}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onDelete(asset.id)}
          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          <FaTrash />
        </button>
        <button
          onClick={() => onUpdate(asset)}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaEdit />
        </button>
      </div>
    </div>
  );
};

const UpdateAssetModal = ({
  asset,
  onClose,
  onUpdate,
  tagOptions,
  categoryOptions,
  fileTypeOptions,
}) => {
  const [formData, setFormData] = useState({
    name: asset.name || "",
    description: asset.description || "",
    file_url: asset.file_url || "",
    file_type: asset.file_type || "",
    category: asset.category || "",
    price: asset.price || "",
    file: null,
    tags: asset.tags || [],
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, file }));
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
    if (formData.file) formDataToSend.append("file", formData.file);
    formDataToSend.append("tagsId", JSON.stringify(formData.tags));

    setIsLoading(true);
    try {
      const res = await api.put(`/assets/${asset.id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdate(res.data);
      setSuccessMessage("Product updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating product:", error);
      setApiError(
        error.response?.data?.message ||
          "Failed to update product. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl w-full">
        <h2 className="text-2xl font-bold mb-4">Update Product</h2>
        {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
        {successMessage && (
          <p className="text-green-500 text-sm mb-4">{successMessage}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              aria-describedby={
                errors.file_type ? "file_type-error" : undefined
              }
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

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [counts, setCounts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  const fileTypeOptions = [
    { value: "image", label: "Image" },
    { value: "vector", label: "Vector" },
    { value: "template", label: "Template" },
    { value: "video", label: "Video" },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Check localStorage for cached counts
      const cachedCounts = localStorage.getItem("dashboardCounts");
      const cachedCountsTimestamp = localStorage.getItem("countsTimestamp");
      if (
        cachedCounts &&
        cachedCountsTimestamp &&
        Date.now() - parseInt(cachedCountsTimestamp) < CACHE_DURATION
      ) {
        setCounts(JSON.parse(cachedCounts));
      } else {
        const resAset = await api.get("/assets/s/count/");
        const totalAssests =
          typeof resAset.data.count === "number" ? resAset.data.count : 0;
        const resUsers = await api.get("/users/s/count/");
        const activeUsers =
          typeof resUsers.data.count === "number" ? resUsers.data.count : 0;
        const resCustom = await api.get("/custom/s/count/");
        const requests =
          typeof resCustom.data.count === "number" ? resCustom.data.count : 0;
        const resTran = await api.get("/transactions/s/count/");
        const sales = typeof resTran.data === "number" ? resTran.data : 0;

        const newCounts = [totalAssests, activeUsers, requests, sales];
        setCounts(newCounts);
        localStorage.setItem("dashboardCounts", JSON.stringify(newCounts));
        localStorage.setItem("countsTimestamp", Date.now().toString());
      }

      // Check localStorage for cached assets
      const cachedAssets = localStorage.getItem("assets");
      const cachedAssetsTimestamp = localStorage.getItem("assetsTimestamp");
      if (
        cachedAssets &&
        cachedAssetsTimestamp &&
        Date.now() - parseInt(cachedAssetsTimestamp) < CACHE_DURATION
      ) {
        setAssets(JSON.parse(cachedAssets));
      } else {
        const resAssets = await api.get("/assets");
        const fetchedAssets = resAssets.data.results || [];
        setAssets(fetchedAssets);
        localStorage.setItem("assets", JSON.stringify(fetchedAssets));
        localStorage.setItem("assetsTimestamp", Date.now().toString());
      }

      // Check localStorage for tags and categories (for update modal)
      const cachedTags = localStorage.getItem("tags");
      const cachedCategories = localStorage.getItem("categories");
      if (cachedTags && cachedCategories) {
        setTagOptions(JSON.parse(cachedTags));
        setCategoryOptions(JSON.parse(cachedCategories));
      } else {
        const tagRes = await api.get("/tags");
        const tags = (tagRes.data.data || tagRes.data || []).map((tag) => ({
          value: tag.id,
          label: tag.name,
        }));
        setTagOptions(tags);
        localStorage.setItem("tags", JSON.stringify(tags));

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

      setApiError("");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setApiError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearCache = () => {
    localStorage.removeItem("dashboardCounts");
    localStorage.removeItem("countsTimestamp");
    localStorage.removeItem("assets");
    localStorage.removeItem("assetsTimestamp");
    fetchData();
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await api.delete(`/assets/${id}`);
      const updatedAssets = assets.filter((asset) => asset.id !== id);
      setAssets(updatedAssets);
      localStorage.setItem("assets", JSON.stringify(updatedAssets));

      // Update counts
      const updatedCounts = [...counts];
      updatedCounts[0] = (updatedCounts[0] || 0) - 1; // Decrease totalAssests
      setCounts(updatedCounts);
      localStorage.setItem("dashboardCounts", JSON.stringify(updatedCounts));
      localStorage.setItem("countsTimestamp", Date.now().toString());

      setApiError("");
    } catch (error) {
      console.error("Error deleting asset:", error);
      setApiError("Failed to delete asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (updatedAsset) => {
    const updatedAssets = assets.map((asset) =>
      asset.id === updatedAsset.id ? updatedAsset : asset
    );
    setAssets(updatedAssets);
    localStorage.setItem("assets", JSON.stringify(updatedAssets));
    localStorage.setItem("assetsTimestamp", Date.now().toString());
    setEditingAsset(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome, Admin</h2>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {apiError && (
            <div className="mb-4">
              <p className="text-red-500 text-sm">{apiError}</p>
              <button
                onClick={fetchData}
                className="mt-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Retry Loading Data
              </button>
            </div>
          )}
          <button
            onClick={clearCache}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 mb-4"
          >
            Refresh Dashboard
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Products",
                value: counts[0] ?? "0",
                icon: <FaBoxOpen className="text-2xl" />,
              },
              {
                title: "Active Users",
                value: counts[1] ?? "0",
                icon: <FaUsers className="text-2xl" />,
              },
              {
                title: "Custom Requests",
                value: counts[2] ?? "0",
                icon: <FaClipboardList className="text-2xl" />,
              },
              {
                title: `Today’s Sales (${new Date().toLocaleDateString(
                  "en-US",
                  { timeZone: "Africa/Lagos" }
                )})`,
                value:
                  counts[3] != null
                    ? `₦${counts[3].toLocaleString("en-NG")}`
                    : "₦0",
                icon: <FaMoneyBillWave className="text-2xl" />,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4"
              >
                <div className="p-3 bg-gray-100 rounded-full">{item.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <h3 className="text-xl font-bold">{item.value}</h3>
                </div>
              </div>
            ))}
          </div>
          <h3 className="text-xl font-bold mb-4">All Assets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onDelete={handleDelete}
                onUpdate={() => setEditingAsset(asset)}
              />
            ))}
          </div>
        </>
      )}
      {editingAsset && (
        <UpdateAssetModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onUpdate={handleUpdate}
          tagOptions={tagOptions}
          categoryOptions={categoryOptions}
          fileTypeOptions={fileTypeOptions}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
