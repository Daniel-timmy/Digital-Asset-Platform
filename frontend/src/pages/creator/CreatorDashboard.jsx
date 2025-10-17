import React, { useEffect, useState, useRef } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const tagNames = asset.tags.map((tag) => tag.name).join(", ");

  const handleDeleteClick = async () => {
    setIsLoading(true);
    try {
      await onDelete(asset.id, setIsLoading);
    } catch (error) {
      setIsLoading(false); // Ensure loading stops on error
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4 relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <LoadingIndicator />
        </div>
      ) : (
        <>
          {asset.file_type === "image" && asset.thumbnail_url && (
            <img
              src={asset.thumbnail_url}
              alt={asset.name}
              className="w-full h-40 object-cover rounded-md"
            />
          )}
          <div>
            <h3 className="text-lg font-bold">{asset.name}</h3>
            <p className="text-sm text-gray-500">{asset.description}</p>
            <p className="text-sm">Type: {asset.file_type}</p>
            <p className="text-sm">Category: {asset.category.name}</p>
            <p className="text-sm">
              Price: ₦{asset.price.toLocaleString("en-NG")}
            </p>
            <p className="text-sm">Tags: {tagNames || "None"}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteClick}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              disabled={isLoading}
            >
              <FaTrash />
            </button>
            <button
              onClick={() => onUpdate(asset)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isLoading}
            >
              <FaEdit />
            </button>
          </div>
        </>
      )}
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
    category: asset.category?.id || "", // Use category ID
    price: asset.price || "",
    file: null,
    tags: asset.tags.map((tag) => tag.id) || [], // Use tag IDs
    thumbnail: null, // <-- new: selected thumbnail file
    thumbnail_url: asset.thumbnail_url || "", // <-- new: existing thumbnail url
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

  // New handler for thumbnail input (validation similar to UploadProduct)
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
      setFormData((prev) => ({ ...prev, thumbnail: null }));
      setErrors((prev) => ({ ...prev, thumbnail: "" }));
    }
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

    setIsLoading(true);
    try {
      // Build form data to send to backend
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("file_type", formData.file_type);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("tagsId", JSON.stringify(formData.tags));
      // Only append file if changed
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }
      // Only append thumbnail if changed
      if (formData.thumbnail) {
        formDataToSend.append("thumbnail", formData.thumbnail);
      }

      const res = await api.patch(`/assets/${asset.id}`, formDataToSend, {
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
        {isLoading && <LoadingIndicator />}
        <form onSubmit={handleSubmit} className="space-y-6">
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
          {/* File Upload (main file) */}
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

          {/* Thumbnail Upload (new) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail (Image ≤2MB or Video ≤5MB)
            </label>
            <input
              type="file"
              name="thumbnail"
              onChange={handleThumbnailChange}
              className={`w-full ${errors.thumbnail ? "border-red-500" : ""}`}
              accept="image/*,video/*"
              aria-invalid={errors.thumbnail ? "true" : "false"}
              aria-describedby={
                errors.thumbnail ? "thumbnail-error" : undefined
              }
            />
            {formData.thumbnail && (
              <div className="text-sm text-gray-600 mt-1">
                <p>Selected: {formData.thumbnail.name}</p>
                <div className="mt-2">
                  {formData.thumbnail.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail Preview"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  ) : formData.thumbnail.type.startsWith("video/") ? (
                    <video
                      src={URL.createObjectURL(formData.thumbnail)}
                      controls
                      className="w-32 h-32 object-cover rounded-md"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : null}
                </div>
              </div>
            )}
            {!formData.thumbnail && formData.thumbnail_url && (
              <div className="text-sm text-gray-600 mt-1">
                <p>Current thumbnail:</p>
                {formData.thumbnail_url.endsWith(".mp4") ? (
                  <video
                    src={formData.thumbnail_url}
                    controls
                    className="w-32 h-32 object-cover rounded-md"
                  />
                ) : (
                  <img
                    src={formData.thumbnail_url}
                    alt="Current thumbnail"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                )}
              </div>
            )}
            {errors.thumbnail && (
              <p id="thumbnail-error" className="text-red-500 text-sm mt-1">
                {errors.thumbnail}
              </p>
            )}
          </div>
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
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition disabled:bg-gray-400"
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

const CreatorDashboard = () => {
  const [counts, setCounts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Default limit, adjust as needed
  const [totalPages, setTotalPages] = useState(1);
  const observer = useRef(null); // Ref for Intersection Observer
  const loadMoreRef = useRef(null); // Ref for the sentinel element
  const [countLoading, setCountLoading] = useState(false);
  const creator = JSON.parse(localStorage.getItem(USER) || "{}");
  const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour

  const fileTypeOptions = [
    { value: "image", label: "Image" },
    { value: "vector", label: "Vector" },
    { value: "template", label: "Template" },
    { value: "video", label: "Video" },
  ];

  // Fetch counts for assets, users, custom requests, and sales
  const fetchCounts = async () => {
    try {
      setCountLoading(true);
      const cachedCounts = localStorage.getItem("dashboardCounts");
      const cachedCountsTimestamp = localStorage.getItem("countsTimestamp");
      if (
        cachedCounts &&
        cachedCountsTimestamp &&
        Date.now() - parseInt(cachedCountsTimestamp) < CACHE_DURATION
      ) {
        setCounts(JSON.parse(cachedCounts));
        return;
      }

      const [resAset, resTran] = await Promise.all([
        api.get("/assets/s/count/"),

        api.get("/downloads/s/count/"),
      ]);

      const totalAssests =
        typeof resAset.data.count === "number" ? resAset.data.count : 0;

      const sales = typeof resTran.data === "number" ? resTran.data : 0;

      const newCounts = [totalAssests, sales];
      setCounts(newCounts);
      localStorage.setItem("dashboardCounts", JSON.stringify(newCounts));
      localStorage.setItem("countsTimestamp", Date.now().toString());
    } catch (error) {
      console.error("Error fetching counts:", error);
      setApiError("Failed to load dashboard counts. Please try again.");
    } finally {
      setCountLoading(false);
    }
  };

  // Fetch tags and categories
  const fetchTagsAndCategories = async () => {
    try {
      const cachedTags = localStorage.getItem("tags");
      const cachedCategories = localStorage.getItem("categories");
      if (cachedTags && cachedCategories) {
        setTagOptions(JSON.parse(cachedTags));
        setCategoryOptions(JSON.parse(cachedCategories));
        return;
      }

      const [tagRes, catRes] = await Promise.all([
        api.get("/tags"),
        api.get("/category"),
      ]);

      const tags = (tagRes.data.data || tagRes.data || []).map((tag) => ({
        value: tag.id,
        label: tag.name,
      }));
      setTagOptions(tags);
      localStorage.setItem("tags", JSON.stringify(tags));

      const categories = (catRes.data.data || catRes.data || []).map(
        (category) => ({
          value: category.id,
          label: category.name,
        })
      );
      setCategoryOptions(categories);
      localStorage.setItem("categories", JSON.stringify(categories));
    } catch (error) {
      console.error("Error fetching tags or categories:", error);
      setApiError("Failed to load tags or categories. Please try again.");
    }
  };

  // Fetch assets with pagination
  const fetchAssets = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return; // Prevent fetching beyond total pages
    try {
      if (pageNum === 1 && !append) {
        const cachedAssets = localStorage.getItem("assets");
        const cachedAssetsTimestamp = localStorage.getItem("assetsTimestamp");
        if (
          cachedAssets &&
          cachedAssetsTimestamp &&
          Date.now() - parseInt(cachedAssetsTimestamp) < CACHE_DURATION
        ) {
          setAssets(JSON.parse(cachedAssets));
          return;
        }
      }

      const resAssets = await api.get(
        `/assets?userId=${creator.id}page=${pageNum}&limit=${limit}`
      );
      const fetchedAssets = resAssets.data.results || [];
      const newTotalPages = resAssets.data.totalPages || 1;

      setAssets((prev) =>
        append ? [...prev, ...fetchedAssets] : fetchedAssets
      );
      setTotalPages(newTotalPages);

      if (pageNum === 1) {
        localStorage.setItem("assets", JSON.stringify(fetchedAssets));
        localStorage.setItem("assetsTimestamp", Date.now().toString());
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setApiError("Failed to load assets. Please try again.");
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCounts(),
          fetchTagsAndCategories(),
          fetchAssets(1, false),
        ]);
        setApiError("");
      } catch (error) {
        setApiError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Fetch assets when page changes
  useEffect(() => {
    if (page > 1) {
      fetchAssets(page, true);
    }
  }, [page]);

  // Set up Intersection Observer for infinite scrolling
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current && observer.current) {
        observer.current.unobserve(loadMoreRef.current);
      }
    };
  }, [isLoading, page, totalPages]);

  const clearCache = () => {
    localStorage.removeItem("dashboardCounts");
    localStorage.removeItem("countsTimestamp");
    localStorage.removeItem("assets");
    localStorage.removeItem("assetsTimestamp");
    localStorage.removeItem("tags");
    localStorage.removeItem("categories");
    setPage(1);
    setAssets([]);
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCounts(),
          fetchTagsAndCategories(),
          fetchAssets(1, false),
        ]);
        setApiError("");
      } catch (error) {
        setApiError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  };

  const handleDelete = async (id, setCardLoading) => {
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
      throw error; // Re-throw to let AssetCard handle loading state
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

      <>
        {apiError && (
          <div className="mb-4">
            <p className="text-red-500 text-sm">{apiError}</p>
            <button
              onClick={clearCache}
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
        {countLoading ? (
          <LoadingIndicator />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Products",
                value: counts[0] ?? "0",
                icon: <FaBoxOpen className="text-2xl" />,
              },

              {
                title: `Today’s Sales (${new Date().toLocaleDateString(
                  "en-US",
                  {
                    timeZone: "Africa/Lagos",
                  }
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
        )}
        <h3 className="text-xl font-bold mb-4">All Assets</h3>
        {isLoading && assets.length === 0 ? (
          <LoadingIndicator />
        ) : (
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
        )}

        {/* Sentinel for Infinite Scrolling */}
        {page < totalPages && (
          <div ref={loadMoreRef} className="h-10 flex justify-center py-4">
            {isLoading && <LoadingIndicator />}
          </div>
        )}
      </>
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

export default CreatorDashboard;
