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
      className="relative w-full min-h-screen overflow-hidden font-sans"
      style={{
        backgroundImage: `url(${bg_img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <Header />
      
      <div className="relative w-full text-center px-4 z-10 min-h-screen flex flex-col items-center justify-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-2xl border border-white/20 animate-fade-in">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          UNLEASH YOUR CREATIVITY
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight animate-fade-in">
          Transform Ideas Into
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Digital Masterpieces
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-medium mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
          Discover premium digital assets, AI-powered tools, and creative resources all in one place
        </p>

        {/* Search */}
        <div className="w-full max-w-4xl mb-16 animate-fade-in">
          <Search />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 w-full max-w-7xl mx-auto mb-16">
          {filteredPlaceholders.slice(0, 6).map((card, idx) => (
            <div
              key={card.id}
              className="group relative rounded-3xl overflow-hidden h-72 transform hover:scale-105 transition-all duration-500 shadow-2xl"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Image */}
              <img
                src={card.img}
                alt={card.desc}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center px-6">
                  <p className="text-white text-lg font-bold mb-3">{card.desc}</p>
                  <div className="w-12 h-1 bg-white mx-auto rounded-full"></div>
                </div>
              </div>
              
              {/* Bottom Label */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-bold text-lg">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-fade-in">
          <Link to="/stock">
            <button className="group relative px-10 py-5 bg-white text-black font-black text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black">
                Explore Collection →
              </span>
            </button>
          </Link>
          
          <Link to="/categories">
            <button className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-bold text-lg rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-xl">
              Browse Categories
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 mt-20 animate-fade-in">
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-2">10K+</div>
            <div className="text-white/80 font-medium">Digital Assets</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-2">5K+</div>
            <div className="text-white/80 font-medium">Happy Creators</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-2">100%</div>
            <div className="text-white/80 font-medium">Quality Guaranteed</div>
          </div>
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
