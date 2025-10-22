import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaTrash, FaTools } from "react-icons/fa";
import api from "../utils/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { ACCESS_TOKEN } from "../utils/constants";
import { jwtDecode } from "jwt-decode";
import LoadingIndicator from "../components/LoadingIndicator";
import { initialize_payment } from "../utils/payment";
import Toast from "../components/Toast";

export default function CartPage() {
  const [previewItem, setPreviewItem] = useState(null);
  const { cart, removeFromCart } = useCart();
  const [scart, setCart] = useState([]);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const handleCheckout = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      setToast({
        show: true,
        message: "Please sign in or create an account to checkout",
        type: "error",
      });
      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      setToast({
        show: true,
        message: "Your session has expired. Please sign in again to checkout",
        type: "error",
      });
      return;
    }
    setCheckoutLoading(true);
    const storedCart = JSON.parse(localStorage.getItem("cart"));

    if (storedCart) {
      try {
        // const response = await api.post("/custom", {
        //   name: "Uncustomized bulk assets download",
        //   description: "Uncustomized bulk assets download",
        //   type: "bulk",
        //   asset: Object.keys(storedCart)[0],
        //   asset_ids: Object.keys(storedCart),
        // });
        // if (response.status !== 201) {
        //   throw new Error("Failed to submit order");
        // }

        setToast({
          show: true,
          message: "Initializing payment...",
          type: "success",
        });
        initialize_payment(Object.keys(storedCart));
      } catch (error) {
        setToast({
          show: true,
          message: "Failed to submit order. Please try again.",
          type: "error",
        });
      }
    }
  };

  const subtotal = scart.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0
  );
  const total = subtotal;
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        const arr = [];
        for (const key in parsedCart) {
          arr.push(parsedCart[key]);
        }
        setCart(arr);
        // setPreviewAsset(arr[0]);
      } catch (error) {
        setToast({
          show: true,
          message: "Error loading cart items",
          type: "error",
        });
      }
    }
  }, []);
  const deleteFromCart = (asset) => {
    const updatedCart = scart.filter((item) => item.id !== asset.id);
    removeFromCart(asset);

    setCart(updatedCart);
  };
  const addAssetToPreview = (asset) => {
    setPreviewAsset(asset);
  };

  const removeAssetFromPreview = () => {
    setPreviewAsset(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
      
      <div className="flex-1 container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <svg className="w-24 h-24 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
                  <Link
                    to="/stock"
                    className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 font-bold text-sm text-gray-700">
                      <span className="col-span-6">PRODUCT</span>
                      <span className="col-span-2 text-center">PRICE</span>
                      <span className="col-span-2 text-center">PREVIEW</span>
                      <span className="col-span-2 text-center">REMOVE</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {scart.map((item) => (
                      <div
                        key={item.id}
                        className="px-6 py-5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Product Info */}
                          <div className="col-span-6 flex items-center gap-4">
                            <img
                              src={item.thumbnail_url}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setPreviewItem(item)}
                            />
                            <div>
                              <h3 className="text-gray-900 font-semibold line-clamp-2">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">Digital Asset</p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-2 text-center">
                            <span className="text-lg font-bold text-gray-900">
                              ₦{Number(item.price).toLocaleString()}
                            </span>
                          </div>

                          {/* Preview */}
                          <div className="col-span-2 flex justify-center">
                            <button
                              onClick={() =>
                                previewAsset && previewAsset.id === item.id
                                  ? removeAssetFromPreview()
                                  : addAssetToPreview(item)
                              }
                              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              {previewAsset && previewAsset.id === item.id ? (
                                <FaEyeSlash className="w-5 h-5 text-gray-700" />
                              ) : (
                                <FaEye className="w-5 h-5 text-gray-700" />
                              )}
                            </button>
                          </div>

                          {/* Remove */}
                          <div className="col-span-2 flex justify-center">
                            <button
                              onClick={() => deleteFromCart(item)}
                              className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-24">
              <h2 className="text-2xl font-black mb-6 text-gray-900">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-900">₦0</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-gray-50 rounded-xl px-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-black">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {checkoutLoading ? (
                <div className="py-4">
                  <LoadingIndicator />
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout()}
                  disabled={cart.length === 0}
                  className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Proceed to Checkout
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {previewAsset && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
                <img
                  src={previewAsset.thumbnail_url}
                  alt={previewAsset.name}
                  className="w-full h-auto rounded-xl mb-4"
                />
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  {previewAsset.name}
                </h4>
                <p className="text-lg font-bold text-black">
                  ₦{Number(previewAsset.price)?.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* ✅ Preview Modal */}
    </div>
  );
}
