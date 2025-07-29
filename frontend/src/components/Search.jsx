import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "react-use";
import api from "../utils/api";

const SearchItem = ({ product }) => {
  return (
    <>
      <Link to={"/product-details"}>
        <div className="flex flex-col mx-5 my-3 space-y-1">
          <h1 className="text-sm lg:text-2xl font-medium">{product.name}</h1>
          <h6 className="text-xs lg:text-lg font-normal">
            {product.description}
          </h6>
        </div>
      </Link>
    </>
  );
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute left-0 right-0 bg-white p-6 rounded-b-lg shadow-lg z-40 w-full max-w-3xl mx-auto"
      style={{ top: "100%" }} // Positions modal just below the search bar
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={onClose}
      >
        &times;
      </button>
    </div>
  );
};

const Search = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  let [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchedAsset, setSearchedAsset] = useState([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fecthAssets = async (query = "") => {
    setLoading(true);
    try {
      if (query === "") {
        setSearchedAsset([]);
        return;
      }
      const res = await api.get(`/assets?search=${query}`);
      setSearchedAsset(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fecthAssets(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <div className="w-full max-w-3xl mx-auto mb-12 flex items-center relative">
      <input
        placeholder="Search everything..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-4 text-xl rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black shadow-md bg-white text-black"
        onClick={() => setIsOpen(true)}
      />
      <button className="bg-black text-white p-4 rounded-r-lg hover:bg-black transition-colors duration-300">
        <svg
          viewBox="0 0 16 16"
          className="lg:h-8 md:h-6 h-5 cursor-pointer"
          fill="none"
          onClick={() => setIsOpen(true)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.8748 14.8748L11.6973 11.6916M13.4582 7.43734C13.4582 9.03416 12.8238 10.5656 11.6947 11.6947C10.5656 12.8238 9.03416 13.4582 7.43734 13.4582C5.84051 13.4582 4.30909 12.8238 3.17997 11.6947C2.05084 10.5656 1.4165 9.03416 1.4165 7.43734C1.4165 5.84051 2.05084 4.30909 3.17997 3.17997C4.30909 2.05084 5.84051 1.4165 7.43734 1.4165C9.03416 1.4165 10.5656 2.05084 11.6947 3.17997C12.8238 4.30909 13.4582 5.84051 13.4582 7.43734Z"
            stroke="#A6A5A5"
            stroke-width="1.41667"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
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
      </Modal>
    </div>
  );
};

export default Search;
