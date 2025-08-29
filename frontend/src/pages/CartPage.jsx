import React, { useContext, useState } from "react";
import { FaTrash } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CartContext } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart } = useContext(CartContext);
  const [previewItem, setPreviewItem] = useState(null);

  // ✅ Ensure price is treated as a number
  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0
  );
  const total = subtotal;

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
        {/* Cart Table */}
        <div className="lg:w-2/3 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {cart.length === 0 ? (
            <p className="text-gray-600 text-lg">Your cart is empty.</p>
          ) : (
            <>
              <div className="grid grid-cols-4 font-semibold border-b pb-3 mb-4 text-gray-700">
                <span className="col-span-2">PRODUCT</span>
                <span>PRICE</span>
                <span className="text-right">SUBTOTAL</span>
              </div>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-4 items-center border-b py-4 gap-4 hover:bg-gray-50 transition"
                >
                  {/* Product Info */}
                  <div className="col-span-2 flex items-center gap-4">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <FaTrash />
                    </button>
                    <img
                      src={item.thumbnail_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md shadow cursor-pointer"
                      onClick={() => setPreviewItem(item)}
                    />
                    <span className="text-gray-900 font-medium">
                      {item.name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-gray-700">
                    ₦{Number(item.price).toLocaleString()}
                  </div>

                  {/* Subtotal */}
                  <div className="text-right font-semibold">
                    ₦{Number(item.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Cart Totals */}
        <div className="lg:w-1/3 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6 border-b pb-3">
            Cart Summary
          </h2>
          <div className="flex justify-between mb-4">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span className="text-black">₦{total.toLocaleString()}</span>
          </div>
          <button className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-md">
            Proceed to Checkout
          </button>
        </div>
      </div>

      <Footer />

      {/* ✅ Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-lg w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewItem.thumbnail_url}
              alt={previewItem.name}
              className="w-full h-auto rounded-lg"
            />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {previewItem.name}
            </h3>
            <p className="text-gray-700 mt-2">
              ₦{Number(previewItem.price)?.toLocaleString()}
            </p>
            <button
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-3 py-1 text-sm hover:bg-red-700"
              onClick={() => setPreviewItem(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
