import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "react-use";
import api from "../utils/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";
import Search from "../components/Search";
import bg_img from "../assets/wallhaven-6d7ow6.png";
import tab1 from "../assets/tab1.webp";
import tab2 from "../assets/tab2.webp";
import tab3 from "../assets/tab3.webp";
import tab4 from "../assets/tab4.webp";
import tab5 from "../assets/tab5.webp";
import tab6 from "../assets/tab6.webp";
import tab7 from "../assets/tab7.webp";
// import tab from "../assets/tab.png";

function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const placeholders = [
    {
      id: 1,
      text: "",
      bg: "bg-teal-200",
      img: tab1,
      desc: "Creative design solutions",
    },
    {
      id: 2,
      text: "",
      bg: "bg-purple-200",
      img: tab2,
      desc: "Beautiful artwork collections",
    },
    {
      id: 3,
      text: "",
      bg: "bg-yellow-200",
      img: tab3,
      desc: "Cutting-edge innovations",
    },
    {
      id: 4,
      text: "",
      bg: "bg-black",
      img: tab4,
      desc: "Advanced tech insights",
    },
    {
      id: 5,
      text: "",
      bg: "bg-blue-200",
      img: tab5,
      desc: "Inspiring creative ideas",
    },
    {
      id: 6,
      text: "",
      bg: "bg-green-200",
      img: tab6,
      desc: "AI-powered tools",
    },
    {
      id: 7,
      text: "",
      bg: "bg-red-200",
      img: tab7,
      desc: "Digital art masterpieces",
    },
  ];

  const filteredPlaceholders = placeholders.filter((placeholder) =>
    placeholder.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          className={`inline-block text-white px-4 py-2 rounded-lg text-sm font-bold mb-6 ${
            isVisible ? "animate-pulse-slow" : ""
          }`}
        >
          CREATE UNLIMITED IMAGES
        </div>
        <h1
          className={`text-4xl sm:text-6xl font-extrabold text-white mb-4 ${
            isVisible ? "animate-fade-in-up" : ""
          }`}
        >
          Creative work, reimagined with AI
        </h1>
        <p
          className={`text-xl sm:text-2xl text-white font-semibold mb-8 ${
            isVisible ? "animate-fade-in-up" : ""
          } delay-200`}
        >
          All in one place
        </p>

        {/* Search */}

        <Search />

        {/* First row - Top 6 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-4 w-full max-w-6xl mx-auto">
          {filteredPlaceholders.slice(0, 6).map((card, idx) => {
            const heightClass = "h-64"; // larger top row

            return (
              <div
                key={card.id}
                className={`rounded-lg p-6 relative overflow-hidden ${card.bg} text-white text-2xl font-bold text-center backdrop-blur-sm bg-opacity-90 border border-gray-200 ${heightClass} flex items-center justify-center transition-all duration-500 transform hover:scale-105 fade-in-element`}
                style={{ animationDelay: `${card.id * 100}ms` }}
              >
                <img
                  src={card.img}
                  alt={card.text}
                  className="absolute inset-0 w-full h-full object-cover opacity-100"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center text-white text-sm font-medium opacity-0 group-hover:opacity-100">
                  {card.desc}
                </div>
                <span className="relative z-10">{card.text}</span>
              </div>
            );
          })}
        </div>

        {/* Get Started Button */}
        <div className="mt-12 w-full flex justify-center">
          <Link to="/stock">
            <button
              className={`bg-black text-white px-6 py-3 rounded-lg cursor-pointer font-semibold hover:bg-black hover:shadow-lg transition-all duration-300 ${
                isVisible ? "animate-bounce" : ""
              }`}
            >
              GET STARTED
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

{
  /* <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <div className="mt-4">
    {loading ? (
      <p>Loading...</p>
    ) : searchedAsset.length > 0 ? (
      searchedAsset.map((product) => (
        <SearchItem key={product.id} product={product} />
      ))
    ) : (
      <p>No results found.</p>
    )}
  </div>
</Modal> */
}

export default LandingPage;
