// cartContext.js
import { createContext, useContext, useEffect, useState } from "react";

// Create the Cart Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  // Initialize cart state from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : {};
  });

  // Sync cart with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (asset) => {
    setCart((prevCart) => ({
      ...prevCart,
      [asset.id]: asset,
    }));
  };

  // Check if item is in cart
  const inCart = (asset) => {
    return cart.hasOwnProperty(asset.id);
  };

  // Remove item from cart
  const removeFromCart = (asset) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      delete newCart[asset.id];
      return newCart;
    });
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart({});
  };

  // Get the current cart
  const getCart = () => {
    return cart;
  };

  const getCount = () => {
    return Object.keys(cart).length;
  };

  // Context value
  const value = {
    cart,
    addToCart,
    inCart,
    removeFromCart,
    clearCart,
    getCart,
    getCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
