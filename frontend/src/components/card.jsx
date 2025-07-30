// components/Card.jsx
import React from "react";
import { FaShoppingCart } from "react-icons/fa";

export default function Card({ product, onAddToCart }) {
  return (
    <div className="relative bg-white border border-black rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
      
      {/* Add to Cart Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
        className="absolute top-3 right-3 z-10 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition"
      >
        <FaShoppingCart className="text-sm" />
      </button>

      {/* Product Image */}
      <img
        src={product.img || product.thumbnail_url}
        alt={product.name}
        className="w-full h-52 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
      />

      {/* Description */}
      <div className="p-4 text-center text-black">
        <h2 className="text-lg font-bold mb-1">{product.name}</h2>
        <p className="text-sm text-gray-700 mb-2">{product.description || product.desc}</p>
        <p className="text-base font-semibold">${product.price}</p>
      </div>
    </div>
  );
}
