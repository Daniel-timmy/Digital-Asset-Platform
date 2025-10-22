import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import { IMAGE_URL } from "../utils/constants";

export default function Card({ product, onAddToCart, handleProductClick }) {
  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer break-inside-avoid mb-6"
      onClick={() => handleProductClick(product)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={product.thumbnail_url}
          alt={product.name}
          className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        {/* Dark Gradient Overlay on Hover (Desktop Only) */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Premium Star Badge (Top Left) */}
        {product.license === "premium" && (
          <div className="absolute top-4 left-4 z-10">
            <div className="p-2.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
              <FaStar className="text-white text-sm" />
            </div>
          </div>
        )}

        {/* Add to Cart Button (Top Right) */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 z-10">
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

        {/* Product Details Overlay (Desktop Only - Visible on Hover) */}
        <div className="hidden md:block absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 z-10">
          {/* Product Name */}
          <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight drop-shadow-lg">
            {product.name}
          </h2>

          {/* Description */}
          <p className="text-sm text-white/90 mb-4 line-clamp-2 leading-relaxed drop-shadow-md">
            {product.description}
          </p>

          {/* Price and View Section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-white/70 font-medium mb-1">
                Price
              </span>
              <span className="text-2xl font-black text-white drop-shadow-lg">
                ${product.price}
              </span>
            </div>

            <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all duration-300">
              <span className="text-sm font-semibold drop-shadow-md">
                View Details
              </span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300 drop-shadow-md"
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
      </div>

      {/* Content Section (Mobile Only - Always Visible) */}
      <Link to={`/product-details/${product.id}`} key={product.id}>
        <div className="md:hidden p-6">
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
