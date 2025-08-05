import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Search from "../components/Search";
import Card from "../components/Card";
import LoadingIndicator from "../components/LoadingIndicator";
import api from "../utils/api";
import { add_to_cart } from "../utils/cart";
import "../App.css";

export default function StockPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [cart, setCart] = useState([]);
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

  const handleProceed = (product) => {
    setCart([...cart, product]);
  };

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

        {/* Product Grid using Card.jsx */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 px-6 w-full max-w-7xl mx-auto mb-20">
          {loading ? (
            <div className="col-span-4 flex justify-center items-center h-64">
              <LoadingIndicator />
            </div>
          ) : (
            assets.map((asset) => (
              <Link to={`/product-details/${asset.id}`} key={asset.id}>
                <div
                  onMouseEnter={() => setHoveredProduct(asset)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  onClick={() => handleProductClick(asset)}
                  className={`relative overflow-hidden rounded-2xl shadow-xl transition-transform transform hover:scale-105 h-[380px] ${
                    asset.id <= 3 ? "bg-gray-900" : "bg-teal-100"
                  } flex flex-col justify-end`}
                >
                  <img
                    src={"http://localhost:5500" + asset.thumbnail_url}
                    alt={asset.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                  <div className="relative z-10 bg-black bg-opacity-40 text-white text-center p-4">
                    <h2 className="text-2xl font-bold mb-1">{asset.name}</h2>
                    <p className="text-sm mb-3">{asset.description}</p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        add_to_cart(asset);
                      }}
                      className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition"
                    >
                      Add to Cart – ${asset.price}
                    </button>
                  </div>
                </div>
              </Link>
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
                onClick={(e) => {
                  e.preventDefault();
                  handleProceed(selectedProduct || hoveredProduct);
                }}
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
