import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Search from "../components/Search";
import Card from "../components/Card";
import MasonryGrid from "../components/MasonryGrid";
import LoadingIndicator from "../components/LoadingIndicator";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import "../App.css";

export default function StockPage() {
  const [cart, setCart] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "All");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const observer = useRef(null);
  const loadMoreRef = useRef(null);
  const category = searchParams.get("categoryId");

  const { addToCart } = useCart();

  const handleAddToCart = (asset) => {
    addToCart(asset);
  };

  const handleProductClick = (product) => {
    if (!selectedProduct) setSelectedProduct(product);
  };

  // Fetch assets with pagination, category, and tag
  const fecthAssets = async (pageNum = 1, append = false, tagId = null) => {
    if (pageNum > totalPages && append) return;
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.set("page", pageNum);
      params.set("limit", limit);
      if (tagId && tagId !== "All") params.set("tagIds", tagId);
      if (category) params.set("categoryId", category);

      const url = `/assets?${params.toString()}`;
      const res = await api.get(url);
      const newAssets = res.data.results || [];
      const newTotalPages = res.data.totalPages || 1;

      setAssets((prev) => (append ? [...prev, ...newAssets] : newAssets));
      setTotalPages(newTotalPages);

      // Update tags only for initial fetch and when not filtering by specific tag
      if (pageNum === 1 && !tagId) {
        const uniqueTags = res.data.results
          .flatMap((asset) => asset.tags)
          .filter(
            (tag, index, self) =>
              index === self.findIndex((t) => t.id === tag.id)
          );
        setTags([{ id: "All", name: "All" }, ...uniqueTags]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assets when page or activeTag changes
  useEffect(() => {
    fecthAssets(page, page > 1, activeTag === "All" ? null : activeTag);
  }, [page, activeTag, category]);

  // Set up Intersection Observer for infinite scrolling
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
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
  }, [loading, page, totalPages]);

  // Fetch assets by tag, reset pagination, and update URL
  const getByTags = (id) => {
    setActiveTag(id);
    setPage(1);
    setAssets([]);

    // Update URL with tag and retain category
    const newParams = new URLSearchParams(searchParams);
    if (id === "All") {
      newParams.delete("tag");
    } else {
      newParams.set("tag", id);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden font-sans">
      <Header showCart={true} cartCount={cart.length} />

      {/* Hero Section */}
      <div className="relative w-full text-center px-4 pt-32 pb-16">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            PREMIUM COLLECTION
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Explore Our
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Creative Assets
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover thousands of high-quality designs, templates, and digital
            products crafted for creators like you
          </p>

          {/* Search Component */}
          <Search />

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900">
                {assets.length}+
              </div>
              <div className="text-sm text-gray-600 font-medium mt-1">
                Products
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900">
                {tags.length - 1}
              </div>
              <div className="text-sm text-gray-600 font-medium mt-1">
                Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900">100%</div>
              <div className="text-sm text-gray-600 font-medium mt-1">
                Quality
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="sticky top-20 z-1 bg-white/80 backdrop-blur-lg border-y border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Filter by tags</h2>
            <span className="text-sm text-gray-600 font-medium">
              {assets.length} {assets.length === 1 ? "item" : "items"} found
            </span>
          </div>

          {/* Tags/Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => getByTags(tag.id)}
                className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTag === tag.id
                    ? "bg-gradient-to-r from-black to-gray-800 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:scale-105"
                }`}
              >
                {tag.name}
                {activeTag === tag.id && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="relative px-6 py-16 max-w-7xl mx-auto">
        {loading && assets.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96">
            <LoadingIndicator />
            <p className="text-gray-600 mt-6 font-medium">
              Loading amazing products...
            </p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="w-24 h-24 text-gray-300 mb-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => getByTags("All")}
              className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              View All Products
            </button>
          </div>
        ) : (
          <MasonryGrid>
            {assets.map((asset) => (
              <Card
                key={asset.id}
                product={asset}
                onAddToCart={handleAddToCart}
                handleProductClick={handleProductClick}
              />
            ))}
          </MasonryGrid>
        )}

        {/* Sentinel for Infinite Scrolling */}
        {page < totalPages && (
          <div
            ref={loadMoreRef}
            className="flex justify-center items-center py-12"
          >
            {loading && (
              <div className="flex flex-col items-center gap-4">
                <LoadingIndicator />
                <p className="text-gray-600 font-medium">
                  Loading more products...
                </p>
              </div>
            )}
          </div>
        )}

        {/* End of Results Message */}
        {assets.length > 0 && page >= totalPages && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                You've reached the end
              </span>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
