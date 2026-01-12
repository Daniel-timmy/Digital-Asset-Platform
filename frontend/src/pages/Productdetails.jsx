import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";
import api from "../utils/api";
import { ACCESS_TOKEN } from "../utils/constants";
import { jwtDecode } from "jwt-decode";
import LoadingIndicator from "../components/LoadingIndicator";
import { initialize_payment } from "../utils/payment";
import Toast from "../components/Toast";
import { useCart } from "../context/CartContext";
import Card from "../components/Card";
import MasonryGrid from "../components/MasonryGrid";

function Productdetails() {
  const [product, setProduct] = useState({});
  const [relatedProduct, setRelatedProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const { addToCart } = useCart();

  const handleAddToCart = (asset) => {
    addToCart(asset);
  };

  // const handleProductClick = (product) => {
  //   if (!selectedProduct) setSelectedProduct(product);
  // };

  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/assets/${id}`);
        setProduct(res.data);
        console.log(res.data);
        return await res.data;
      } catch (error) {
        console.error(error);
        setErrors({
          asset:
            error.data.message || "Failed to load related assets. Try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  useEffect(() => {
    const getRelatedAssets = async (id) => {
      setRelatedLoading(true);
      try {
        const res = await api.get(
          `/assets?tagIds=${product.tags[0].id}&page=1&limit=5`
        );
        console.log(res.data.results);
        setRelatedProduct(res.data.results);
      } catch (error) {
        setErrors({
          asset: "Failed to load related assets. Try again.",
        });
      } finally {
        setRelatedLoading(false);
      }
    };
    getRelatedAssets(id);
  }, [product]);

  const handleBuyNow = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setErrors({ user: "You can't download unless you Sign up or log in" });
      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      setErrors({ user: "You can't download unless you Sign up or log in" });
      return;
    }
    setBuyLoading(true);
    try {
      setErrors({});
      initialize_payment([id]);
      alert("Buy order succesful. Initializing payment...");
    } catch (error) {
      setErrors({ name: "Failed to submit. Please try again." });
      setBuyLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-sans">
      <Header />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      <div className="w-full px-4 py-16">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/stock" className="hover:text-black transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">{product.name}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingIndicator />
            <p className="text-gray-600 mt-6 font-medium">
              Loading product details...
            </p>
          </div>
        ) : (
          product && (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100">
                {/* Product Preview */}
                <div className="space-y-6">
                  <div className="relative group">
                    <img
                      src={product.thumbnail_url}
                      alt={product.name}
                      className="w-full rounded-2xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl"></div>
                  </div>

                  {/* Creator Info */}
                  <Link to={`/creator-profile/${product.user?.id}`} className="block">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {product.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created by</p>
                        <p className="font-bold text-gray-900">
                          {product.user?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                  <div className="mb-6">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">
                      {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl font-black text-black">
                        ${product.price}
                      </span>
                      {product.license === "free" && (
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {product.description || "No description available"}
                    </p>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-black transition-colors"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    {product.license === "free" ? (
                      <a
                        href={`${product.file_url}`}
                        download={product.name}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download Free
                      </a>
                    ) : buyLoading ? (
                      <div className="flex-1 flex justify-center py-4">
                        <LoadingIndicator />
                      </div>
                    ) : (
                      <button
                        disabled={buyLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleBuyNow()}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Buy Now
                      </button>
                    )}

                    <button
                      onClick={() => {
                        addToCart(product);
                        setToast({
                          show: true,
                          message: "Added to cart successfully!",
                          type: "success",
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-900 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-black transition-all duration-300 transform hover:scale-105"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Related Assets */}
        <div className="max-w-7xl mx-auto mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900">
              You May Also Like
            </h2>
            <Link
              to="/stock"
              className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              View All →
            </Link>
          </div>

          {relatedLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingIndicator />
              <p className="text-gray-600 mt-6 font-medium">
                Loading related products...
              </p>
            </div>
          ) : relatedProduct.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-600">No related products found</p>
            </div>
          ) : (
            <MasonryGrid>
              {relatedProduct.map((asset) => (
                <Card
                  key={asset.id}
                  product={asset}
                  onAddToCart={handleAddToCart}
                // handleProductClick={handleProductClick}
                />
              ))}
            </MasonryGrid>
          )}
        </div>

        {/* Back Button */}
        <div className="max-w-7xl mx-auto mt-12 text-center">
          <Link to="/stock">
            <button className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-black transition-all duration-300 transform hover:scale-105 shadow-md">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Products
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Productdetails;
