import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { remove_from_cart } from "../utils/cart";
import { FaEye, FaEyeSlash, FaTrash, FaTools } from "react-icons/fa";
import "../App.css";
import LoadingIndicator from "../components/LoadingIndicator";
import bg_img from "../assets/wallhaven-6d7ow6.png";

export default function CartPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [cart, setCart] = useState([]);
  const [previewAsset, setPreviewAsset] = useState(null);

  const removeFromCart = (asset) => {
    const updatedCart = cart.filter((item) => item.id !== asset.id);
    remove_from_cart(asset);

    setCart(updatedCart);
  };

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
        setPreviewAsset(arr[0]);
      } catch (error) {
        console.error("Error parsing cart:", error);
      }
    }
  }, []);

  const addAssetToPreview = (asset) => {
    console.log("In preview mode");
    console.log(asset.name);
    setPreviewAsset(asset);
  };

  const removeAssetFromPreview = () => {
    console.log("Removed from preview mode");
    // console.log(asset.name);
    setPreviewAsset(null);
  };

  return (
    <div
      className="relative w-full min-h-screen bg-white overflow-hidden font-sans"
      style={{
        backgroundImage: `url(${bg_img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />

      <div className="relative w-full text-center px-4 z-10 min-h-screen flex flex-col items-center justify-center">
        <div
          className={`inline-block bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold mb-6 ${
            isVisible ? "animate-pulse-slow" : ""
          }`}
        >
          YOUR CART
        </div>
        <h1
          className={`text-4xl sm:text-6xl font-extrabold text-white mb-4 ${
            isVisible ? "animate-fade-in-up" : ""
          }`}
        >
          Shopping Cart
        </h1>
        {/* <p
          className={`text-xl sm:text-2xl text-white font-semibold mb-8 ${
            isVisible ? "animate-fade-in-up" : ""
          } delay-200`}
        >
          Review and Customize Your Items
        </p> */}
        {cart.length === 0 ? (
          <p
            className={`text-lg text-white ${
              isVisible ? "animate-fade-in-up" : ""
            } delay-300`}
          >
            Your cart is empty.
          </p>
        ) : (
          <div className="w-8/10 space-x-10 h-[100vh] flex items-center justify-content mx-auto">
            <div className="w-2/3">
              {cart.map((item, key) => (
                <div
                  key={item.id}
                  className={`bg-white p-6 mb-4 rounded-lg shadow-md flex justify-between items-center ${
                    isVisible ? "animate-fade-in-up" : ""
                  }`}
                >
                  <span className="text-lg text-gray-900">
                    {item.name || `Product ${item.id}`} - ${item.price}
                  </span>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => removeFromCart(item)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors duration-300"
                    >
                      <FaTrash />
                    </button>
                    <Link to={`/product-details/${item.id}`} key={key}>
                      <button
                        to={`/product-details/${item.id}`}
                        className="bg-teal-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-teal-600 transition-colors duration-300"
                      >
                        <FaTools />
                      </button>
                    </Link>
                    {previewAsset && previewAsset.id === item.id ? (
                      <FaEyeSlash
                        className="size-6"
                        onClick={() => removeAssetFromPreview()}
                      />
                    ) : (
                      <FaEye
                        className="size-6"
                        onClick={() => addAssetToPreview(item)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-1/3  bg-white/30 h-1/2 bg-opacity-95 rounded-xl p-6 shadow-2xl z-20 animate-slide-up">
              {previewAsset ? (
                <img src={previewAsset.thumbnail_url} />
              ) : (
                <p className="italic">Select an item to preview</p>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
