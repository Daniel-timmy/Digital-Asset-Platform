import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "react-use";
import api from "../utils/api";
import LoadingIndicator from "./LoadingIndicator";

const SearchItem = ({ asset }) => {
  return (
    <Link to={`/product-details/${asset.id}`}>
      <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border-b border-gray-100 last:border-b-0 group">
        {asset.thumbnail_url && (
          <img
            src={asset.thumbnail_url}
            alt={asset.name}
            className="w-16 h-16 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
          />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900 truncate group-hover:text-black">
            {asset.name}
          </h1>
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
            {asset.description}
          </p>
        </div>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute left-0 right-0 bg-white rounded-2xl shadow-2xl z-400 w-full max-w-3xl mx-auto border border-gray-200 mt-2 overflow-hidden animate-fade-in"
      style={{ top: "100%" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
        <button
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          onClick={onClose}
          aria-label="Close search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">{children}</div>
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
    try {
      if (query === "") {
        setSearchedAsset([]);
        return;
      }
      const res = await api.get(`/assets?search=${query}`);
      setSearchedAsset(res.data.results);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    fecthAssets(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <div className="w-full max-w-3xl mx-auto mb-12 relative">
      <div className="flex items-center shadow-lg rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
        <input
          placeholder="Search everything..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-5 text-lg focus:outline-none bg-transparent text-gray-900 placeholder-gray-500"
          onClick={() => setIsOpen(true)}
        />
        <button
          className="bg-black text-white px-6 py-5 hover:bg-gray-800 transition-colors duration-300 flex items-center gap-2"
          onClick={() => setIsOpen(true)}
          aria-label="Search"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-6 w-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.8748 14.8748L11.6973 11.6916M13.4582 7.43734C13.4582 9.03416 12.8238 10.5656 11.6947 11.6947C10.5656 12.8238 9.03416 13.4582 7.43734 13.4582C5.84051 13.4582 4.30909 12.8238 3.17997 11.6947C2.05084 10.5656 1.4165 9.03416 1.4165 7.43734C1.4165 5.84051 2.05084 4.30909 3.17997 3.17997C4.30909 2.05084 5.84051 1.4165 7.43734 1.4165C9.03416 1.4165 10.5656 2.05084 11.6947 3.17997C12.8238 4.30909 13.4582 5.84051 13.4582 7.43734Z"
              stroke="currentColor"
              strokeWidth="1.41667"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingIndicator />
          </div>
        ) : debouncedSearchTerm ? (
          searchedAsset.length > 0 ? (
            <div>
              {searchedAsset.map((product) => (
                <SearchItem key={product.id} asset={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg font-medium">
                No results found
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try searching with different keywords
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-600 text-lg font-medium">
              Start typing to search
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Search for products, designs, and more
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Search;
