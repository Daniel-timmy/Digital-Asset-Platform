import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Search from "../components/Search";
import Card from "../components/Card";
import LoadingIndicator from "../components/LoadingIndicator";
import api from "../utils/api";
import { CartContext } from "../context/CartContext";
import "../App.css";

export default function StockPage() {
  const { addToCart, cart } = useContext(CartContext);

  const [isVisible, setIsVisible] = useState(false);
  const [assets, setAssets] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTag, setActiveTag] = useState("All");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(1);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleProductClick = (product) => {
    if (!selectedProduct) setSelectedProduct(product);
    setHoveredProduct(null);
  };

  useEffect(() => {
    const fecthAssets = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/assets?page=${offset}&limit=${limit}`);
        setAssets(res.data.results);
        setOffset(res.data.page + 1);
        const uniqueTags = res.data.results
          .flatMap((asset) => asset.tags)
          .filter(
            (tag, index, self) =>
              index === self.findIndex((t) => t.id === tag.id)
          );
        setTags(uniqueTags);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fecthAssets();
  }, []);

  const getByTags = async (id) => {
    setLoading(true);
    setActiveTag(id);

    try {
      const res = await api.get(`/assets?tagIds=${id}`);
      setAssets(res.data.results);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTab = () => setSelectedProduct(null);

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden font-sans">
      <Header showCart={true} cartCount={cart.length} />

      <div className="relative w-full text-center px-4 z-10 min-h-screen flex flex-col items-center pt-24">
        <div className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold mb-6 shadow-md">
          SHOP OUR PRODUCTS
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-4 animate-fade-in-up">
          Discover Creative Tools
        </h1>

        <p className="text-xl sm:text-2xl text-gray-600 font-semibold mb-8 animate-fade-in-up delay-200">
          All in one place
        </p>
        <Search />

        {/* Tabs */}
        <div className="flex space-x-4 mb-10 animate-fade-in-up delay-400">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => getByTags(tag.id)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition shadow-md ${
                activeTag === tag.id
                  ? "bg-black text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 px-6 w-full max-w-7xl mx-auto mb-20">
          {loading ? (
            <div className="col-span-4 flex justify-center items-center h-64">
              <LoadingIndicator />
            </div>
          ) : (
            assets.map((asset) => (
              <Card
                key={asset.id}
                product={asset}
                onAddToCart={() => addToCart(asset)}
                handleProductClick={handleProductClick}
              />
            ))
          )}
        </div>

        {/* Product Preview */}
        {(hoveredProduct || selectedProduct) && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl bg-white bg-opacity-95 rounded-xl p-6 shadow-2xl z-20 animate-slide-up">
            <p className="text-lg text-gray-800 mb-4">
              {(selectedProduct || hoveredProduct)?.desc}
            </p>
            <div className="flex justify-between items-center">
              <button
                onClick={() => addToCart(selectedProduct || hoveredProduct)}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                Proceed
              </button>
              {selectedProduct && (
                <button
                  onClick={handleCloseTab}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
