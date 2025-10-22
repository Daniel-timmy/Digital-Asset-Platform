import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { IMAGE_URL } from "../utils/constants";

export default function Card({ product, onAddToCart, handleProductClick }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer break-inside-avoid mb-6"
      onClick={() => handleProductClick(product)}
    >
      {/* Image Container with Aspect Ratio Preservation */}
      <div className="relative overflow-hidden">
        <img
          src={product.thumbnail_url}
          alt={product.name}
          className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Floating Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-110 ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
            aria-label="Add to wishlist"
          >
            <FaHeart className="text-base" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="p-3 rounded-full bg-black/90 backdrop-blur-md text-white hover:bg-black transition-all duration-300 shadow-lg hover:scale-110"
            aria-label="Add to cart"
          >
            <FaShoppingCart className="text-base" />
          </button>
        </div>

        {/* Quick View Badge */}
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <span className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900 shadow-lg">
            Quick View
          </span>
        </div>
      </div>

      {/* Content Section */}
      <Link to={`/product-details/${product.id}`} key={product.id}>
        <div className="p-6">
          {/* Product Name */}
          <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-black transition-colors">
            {product.name}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {product.description}
          </p>

          {/* Price and CTA Section */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">
                Price
              </span>
              <span className="text-2xl font-black text-gray-900">
                ${product.price}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-900 group-hover:gap-3 transition-all duration-300">
              <span className="text-sm font-semibold">View</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Decorative Corner Element */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-black/5 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
