import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { remove_from_cart } from "../utils/cart";
import "../App.css";
import LoadingIndicator from "../components/LoadingIndicator";
import bg_img from "../assets/wallhaven-6d7ow6.png";

export default function CartPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [cart, setCart] = useState([]);
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [customizations, setCustomizations] = useState({});

  const removeFromCart = (asset) => {
    const updatedCart = cart.filter((item) => item.id !== asset.id);
    remove_from_cart(asset);

    setCart(updatedCart);
  };

  const handleCustomize = (product) => {
    setCustomizingProduct(product);
    setCustomizations((prev) => ({
      ...prev,
      [product.id]: prev[product.id] || "",
    }));
  };

  const handleCustomizationChange = (e) => {
    const { value } = e.target;
    setCustomizations((prev) => ({ ...prev, [customizingProduct.id]: value }));
  };

  const saveCustomization = () => {
    setCustomizingProduct(null);
    console.log(
      "Customized:",
      customizingProduct.name,
      customizations[customizingProduct.id]
    );
  };

  const cancelCustomization = () => {
    setCustomizingProduct(null);
    setCustomizations((prev) => {
      const { [customizingProduct.id]: _, ...rest } = prev;
      return rest;
    });
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
      } catch (error) {
        console.error("Error parsing cart:", error);
      }
    }
  }, []);

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
        <p
          className={`text-xl sm:text-2xl text-white font-semibold mb-8 ${
            isVisible ? "animate-fade-in-up" : ""
          } delay-200`}
        >
          Review and Customize Your Items
        </p>
        {cart.length === 0 ? (
          <p
            className={`text-lg text-white ${
              isVisible ? "animate-fade-in-up" : ""
            } delay-300`}
          >
            Your cart is empty.
          </p>
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            {cart.map((item, key) => (
              <Link to={`/product-details/${item.id}`} key={key}>
                <div
                  key={item.id}
                  className={`bg-white p-6 mb-4 rounded-lg shadow-md flex justify-between items-center ${
                    isVisible ? "animate-fade-in-up" : ""
                  } ${`delay-${item.id * 100}`}`}
                >
                  <span className="text-lg text-gray-900">
                    {item.name || `Product ${item.id}`} - ${item.price}
                  </span>
                  <div>
                    <button
                      onClick={() => removeFromCart(item)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors duration-300 mr-2"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleCustomize(item)}
                      className="bg-teal-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-teal-600 transition-colors duration-300"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {customizingProduct && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-orange-100 bg-opacity-95 rounded-xl p-6 shadow-2xl z-20 animate-slide-up">
            <h2 className="text-xl text-orange-800 mb-4">
              Customize{" "}
              {customizingProduct.name || `Product ${customizingProduct.id}`}
            </h2>
            <textarea
              value={customizations[customizingProduct.id] || ""}
              onChange={handleCustomizationChange}
              placeholder="Enter customization details..."
              className="w-full p-3 mb-4 rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={saveCustomization}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-300"
              >
                Save
              </button>
              <button
                onClick={cancelCustomization}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
