import React, { useEffect, useState, useRef } from "react";
import {
  CubeIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";
import { USER } from "../../utils/constants";

const AssetCard = ({ asset, onDelete, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const tagNames = asset.tags.map((tag) => tag.name).join(", ");

  const handleDeleteClick = async () => {
    setIsLoading(true);
    try {
      await onDelete(asset.id, setIsLoading);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10">
          <LoadingIndicator />
        </div>
      ) : (
        <>
          {asset.file_type === "image" && asset.thumbnail_url && (
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={asset.thumbnail_url}
                alt={asset.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {asset.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {asset.description}
            </p>
            
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {asset.file_type}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-semibold text-gray-900">
                  {asset.category.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-sm font-semibold text-emerald-600">
                  ₦{asset.price.toLocaleString("en-NG")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tags</p>
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {tagNames || "None"}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={handleDeleteClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => onUpdate(asset)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                <PencilSquareIcon className="w-4 h-4" />
                Edit
              </button>
            </div>
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
    category: asset.category?.id || "",
    price: asset.price || "",
    file: null,
    tags: asset.tags.map((tag) => tag.id) || [],
    thumbnail: null,
    thumbnail_url: asset.thumbnail_url || "",
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
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("file_type", formData.file_type);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("tagsId", JSON.stringify(formData.tags));
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">Update Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-800 text-sm">{apiError}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
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

            <div>
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
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <div>
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                File Upload (Optional)
              </label>
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                accept="image/*,video/*,.svg,.pdf"
              />
              {formData.file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {formData.file.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thumbnail (Optional)
              </label>
              <input
                type="file"
                name="thumbnail"
                onChange={handleThumbnailChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                accept="image/*,video/*"
              />
              {formData.thumbnail && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Selected: {formData.thumbnail.name}
                  </p>
                  {formData.thumbnail.type.startsWith("image/") && (
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}
              {errors.thumbnail && (
                <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>
              )}
            </div>

            <div>
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

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Product"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient, delay }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
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
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const observer = useRef(null);
  const loadMoreRef = useRef(null);
  const [countLoading, setCountLoading] = useState(false);
  const creator = JSON.parse(localStorage.getItem(USER) || "{}");
  const CACHE_DURATION = 1 * 60 * 60 * 1000;

  const fileTypeOptions = [
    { value: "image", label: "Image" },
    { value: "vector", label: "Vector" },
    { value: "template", label: "Template" },
    { value: "video", label: "Video" },
  ];

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
      const sales =
        typeof resTran.data.total === "number" ? resTran.data.total : 0;

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

  const fetchAssets = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return;
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
        `/assets?userId=${creator.id}&page=${pageNum}&limit=${limit}`
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

  useEffect(() => {
    if (page > 1) {
      fetchAssets(page, true);
    }
  }, [page]);

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

      const updatedCounts = [...counts];
      updatedCounts[0] = (updatedCounts[0] || 0) - 1;
      setCounts(updatedCounts);
      localStorage.setItem("dashboardCounts", JSON.stringify(updatedCounts));
      localStorage.setItem("countsTimestamp", Date.now().toString());

      setApiError("");
    } catch (error) {
      console.error("Error deleting asset:", error);
      setApiError("Failed to delete asset. Please try again.");
      throw error;
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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 shadow-2xl animate-fade-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {creator.name}! 👋
            </h1>
            <p className="text-gray-300 text-lg">
              Manage your products and track your sales
            </p>
          </div>
          <button
            onClick={clearCache}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
          <p className="text-red-800 text-sm">{apiError}</p>
          <button
            onClick={clearCache}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Retry Loading Data
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {countLoading ? (
        <LoadingIndicator />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Total Products"
            value={counts[0] ?? "0"}
            icon={<CubeIcon className="w-6 h-6 text-white" />}
            gradient="from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title={`Today's Sales (${new Date().toLocaleDateString("en-US", {
              timeZone: "Africa/Lagos",
            })})`}
            value={
              counts[1] != null
                ? `₦${counts[1].toLocaleString("en-NG")}`
                : "₦0"
            }
            icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
            gradient="from-emerald-500 to-green-600"
            delay={100}
          />
        </div>
      )}

      {/* Assets Section */}
      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Your Products
        </h3>
        {isLoading && assets.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <LoadingIndicator />
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CubeIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Products Yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Start uploading your products to showcase them to customers
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset, index) => (
              <div
                key={asset.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AssetCard
                  asset={asset}
                  onDelete={handleDelete}
                  onUpdate={() => setEditingAsset(asset)}
                />
              </div>
            ))}
          </div>
        )}

        {page < totalPages && (
          <div ref={loadMoreRef} className="h-16 flex justify-center items-center mt-8">
            {isLoading && <LoadingIndicator />}
          </div>
        )}
      </div>

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