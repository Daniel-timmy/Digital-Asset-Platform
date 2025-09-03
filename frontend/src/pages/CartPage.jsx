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

export default function CartPage() {
  const [previewItem, setPreviewItem] = useState(null);
  const { cart, removeFromCart } = useCart();
  const [scart, setCart] = useState([]);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleCheckout = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      setErrors({ user: "You can't checkout unless you Sign up or log in" });
      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      setErrors({ user: "You can't checkout unless you Sign up or log in" });
      return;
    }
    setCheckoutLoading(true);
    const storedCart = JSON.parse(localStorage.getItem("cart"));

    if (storedCart) {
      console.log("CHECKOUT", Object.keys(storedCart)[0]);
      console.log("CHECKOUT", Object.keys(storedCart));
      try {
        const response = await api.post("/custom", {
          name: "Uncustomized bulk assets download",
          description: "Uncustomized bulk assets download",
          type: "bulk",
          asset: Object.keys(storedCart)[0],
          asset_ids: Object.keys(storedCart),
        });
        console.log(response);
        if (response.status !== 201) {
          throw new Error("Failed to submit order");
        }

        setErrors({});
        initialize_payment(response.data.data.id);
        alert("Buy order succesful. Initializing payment...");
      } catch (error) {
        console.log(error);
        setErrors({ name: "Failed to submit. Please try again." });
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
        console.error("Error parsing cart:", error);
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
                <span className="text-right"></span>
              </div>
              {scart.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-4 items-center border-b py-4 gap-4 hover:bg-gray-50 transition"
                >
                  {/* Product Info */}
                  <div className="col-span-2 flex items-center gap-4">
                    <button
                      onClick={() => deleteFromCart(item)}
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
                  <div className=" font-semibold flex items-center justify-center space-x-6">
                    {/* ₦{Number(item.price).toLocaleString()} */}
                    {previewAsset && previewAsset.id === item.id ? (
                      <FaEyeSlash
                        className="size-6 cursor-pointer"
                        onClick={() => removeAssetFromPreview()}
                      />
                    ) : (
                      <FaEye
                        className="size-6 cursor-pointer"
                        onClick={() => addAssetToPreview(item)}
                      />
                    )}
                    <Link to={`/product-details/${item.id}`} key={item.id}>
                      <button
                        to={`/product-details/${item.id}`}
                        className="bg-teal-500 text-white cursor-pointer px-4 py-2 rounded-md font-semibold hover:bg-teal-600 transition-colors duration-300"
                      >
                        <FaTools />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Cart Totals */}
        <div className="lg:w-1/3  border border-gray-200 p-6 h-fit">
          <div className=" bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-fit">
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
            {checkoutLoading ? (
              <LoadingIndicator />
            ) : (
              <button
                onClick={() => handleCheckout()}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
              >
                Proceed to Checkout
              </button>
            )}
          </div>
          {previewAsset && (
            <div
              className=" mt-10 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
              onClick={() => setPreviewItem(null)}
            >
              <div
                className="bg-white rounded-2xl p-4 max-w-lg w-full shadow-xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={previewAsset.thumbnail_url}
                  alt={previewAsset.name}
                  className="w-full h-auto rounded-lg"
                />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {previewAsset.name}
                </h3>
                <p className="text-gray-700 mt-2">
                  ₦{Number(previewAsset.price)?.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* ✅ Preview Modal */}
    </div>
  );
}
