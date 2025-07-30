import React from "react";

export default function Card({ asset, onAddToCart, onHover, onLeave, onClick }) {
  return (
    <div
      onMouseEnter={() => onHover(asset)}
      onMouseLeave={onLeave}
      onClick={() => onClick(asset)}
      className={`relative overflow-hidden rounded-2xl shadow-xl transition-transform transform hover:scale-105 h-[380px] ${
        asset.id <= 3 ? "bg-gray-900" : "bg-teal-100"
      } flex flex-col justify-end`}
    >
      <img
        src="http://localhost:5500/uploads/thumbnail/d569b175-1b18-4c3a-a566-770cd9498daa.webp"
        alt={asset.name}
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div className="relative z-10 bg-black bg-opacity-40 text-white text-center p-4">
        <h2 className="text-2xl font-bold mb-1">{asset.name}</h2>
        <p className="text-sm mb-3">{asset.description}</p>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(asset);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition"
        >
          Add to Cart – ${asset.price}
        </button>
      </div>
    </div>
  );
}
