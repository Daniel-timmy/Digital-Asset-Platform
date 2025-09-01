import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Search from "../components/Search";
import Card from "../components/Card";
import LoadingIndicator from "../components/LoadingIndicator";
import api from "../utils/api";
import { add_to_cart } from "../utils/cart";
import "../App.css";
import { useCart } from "../context/CartContext";

export default function StockPage() {
  const [cart, setCart] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTag, setActiveTag] = useState("All");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1); // Changed from offset to page
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const observer = useRef(null); // Ref for Intersection Observer
  const loadMoreRef = useRef(null); // Ref for the sentinel element

  const { scart, addToCart, inCart, removeFromCart, clearCart, getCart } =
    useCart();

  const handleAddToCart = (asset) => {
    addToCart(asset);
  };

  const isItemInCart = (asset) => {
    return inCart(asset);
  };

  const handleRemoveFromCart = (asset) => {
    removeFromCart(asset);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const currentCart = getCart();

  const handleProductClick = (product) => {
    if (!selectedProduct) setSelectedProduct(product);
  };

  // Fetch assets with pagination
  const fecthAssets = async (pageNum = 1, append = false, tagId = null) => {
    if (pageNum > totalPages && append) return; // Prevent fetching beyond total pages
    setLoading(true);
    try {
      const url = tagId
        ? `/assets?tagIds=${tagId}&page=${pageNum}&limit=${limit}`
        : `/assets?page=${pageNum}&limit=${limit}`;
      const res = await api.get(url);
      const newAssets = res.data.results || [];
      const newTotalPages = res.data.totalPages || 1;

      setAssets((prev) => (append ? [...prev, ...newAssets] : newAssets));
      setTotalPages(newTotalPages);

      // Only update tags for the initial fetch (page 1) and when not filtering by tag
      if (pageNum === 1 && !tagId) {
        const uniqueTags = res.data.results
          .flatMap((asset) => asset.tags)
          .filter(
            (tag, index, self) =>
              index === self.findIndex((t) => t.id === tag.id)
          );
        setTags([{ id: "All", name: "All" }, ...uniqueTags]); // Include "All" tag
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assets when page changes or on mount
  useEffect(() => {
    fecthAssets(page, page > 1, activeTag === "All" ? null : activeTag);
  }, [page, activeTag]);

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

  // Fetch assets by tag and reset pagination
  const getByTags = async (id) => {
    setActiveTag(id);
    setPage(1); // Reset to first page when filtering by tag
    setAssets([]); // Clear current assets
    await fecthAssets(1, false, id === "All" ? null : id);
  };

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden font-sans">
      <Header showCart={true} cartCount={cart.length} />

      <div className="relative w-full text-center px-4 z-10 min-h-screen flex flex-col items-center pt-24">
        <div className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold mb-6 shadow-md">
          SHOP OUR PRODUCTS
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-4 animate-fade-in-up">
          Discover Creative Tools
        </h1>

        <p className="text-xl sm:text-2xl text-gray-600 font-semibold mb-8 animate-fade-in-up delay-200">
          All in one place
        </p>
        <Search />

        {/* Tabs */}
        <div className="flex space-x-4 mb-10 animate-fade-in-up delay-400 overflow-x-auto">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => getByTags(tag.id)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition shadow-md whitespace-nowrap ${
                activeTag === tag.id
                  ? "bg-black text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* Product Grid using Card.jsx */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 px-6 w-full max-w-7xl mx-auto mb-20">
          {loading && assets.length === 0 ? (
            <div className="col-span-4 flex justify-center items-center h-64">
              <LoadingIndicator />
            </div>
          ) : (
            assets.map((asset) => (
              <Card
                key={asset.id}
                product={asset}
                onAddToCart={handleAddToCart}
                handleProductClick={handleProductClick}
              />
            ))
          )}
        </div>

        {/* Sentinel for Infinite Scrolling */}
        {page < totalPages && (
          <div
            ref={loadMoreRef}
            className="h-10 col-span-4 flex justify-center"
          >
            {loading && <LoadingIndicator />}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
