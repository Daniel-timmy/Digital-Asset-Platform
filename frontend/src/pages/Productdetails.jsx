import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";
import api from "../utils/api";
import { ACCESS_TOKEN, IMAGE_URL } from "../utils/constants";
import { jwtDecode } from "jwt-decode";
import LoadingIndicator from "../components/LoadingIndicator";
import { initialize_payment } from "../utils/payment";

function Productdetails() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [product, setProduct] = useState({});
  const [relatedProduct, setRelatedProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const [loadAssetError, setLoadAssetError] = useState({});
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/assets/${id}`);
        setProduct(res.data);
        return await res.data;
      } catch (error) {
        console.error(error);
        setLoadAssetError({
          error:
            error.data.message || "Failed to load related assets. Try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, []);

  useEffect(() => {
    const getRelatedAssets = async (id) => {
      setRelatedLoading(true);
      try {
        console.log(product.tags);
        const res = await api.get(
          `/assets?tagIds=${product.tags[0].id}&page=1&limit=5`
        );
        console.log("Related assets response:", res);
        setRelatedProduct(res.data.results);
      } catch (error) {
        console.log("Error fetching related assets:", error);
        setLoadAssetError({
          error: "Failed to load related assets. Try again.",
        });
        console.log(error);
      } finally {
        setRelatedLoading(false);
      }
    };
    getRelatedAssets(id);
  }, [product]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      setErrors({ user: "You can't customize unless you Sign up or log in" });
      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      setErrors({ user: "You can't customize unless you Sign up or log in" });
      return;
    }
    setCustomLoading(true);

    try {
      const response = await api.post("/custom", { ...formData, asset: id });
      console.log(response);
      if (response.status !== 201) {
        throw new Error("Failed to submit customization");
      }

      setFormData({ name: "", description: "" });
      setErrors({});
      initialize_payment(response.data.id);
      alert("Customization order succesfull. Initializing payment...");
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ name: "Failed to submit. Please try again." });
      setCustomLoading(false);
    } finally {
      setCustomLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 font-sans text-gray-800">
      <Header />

      <div className="w-full px-4 py-10 flex flex-col items-center justify-center">
        <div
          className={`text-black text-xl font-bold mb-8 ${
            isVisible ? "animate-fade-in-up" : ""
          }`}
        >
          PRODUCT DETAILS{selectedProduct.name}
        </div>

        {product && (
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl shadow-2xl p-8">
            {/* Product Preview */}
            <div className="flex flex-col items-center">
              <img
                src={IMAGE_URL + product.thumbnail_url}
                alt={product.name}
                className="w-full max-w-md rounded-xl shadow-md mb-4"
              />
              <h2 className="text-3xl font-bold text-black mb-2">
                {product.name}
              </h2>
              <p className="text-lg text-gray-600 mb-3">
                {product.description}
              </p>
              <p className="text-2xl font-semibold text-black">
                Price: ${product.price}
              </p>
            </div>

            {/* Product Customization Form */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner w-full">
              <h3 className="text-2xl font-bold text-black mb-4">
                Customize Your Product
              </h3>
              {errors.user && (
                <p className="text-red-500 text-sm mb-4">{errors.user}</p>
              )}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-black">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter description"
                    rows="4"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
                {customLoading ? (
                  <div className="col-span-4 flex justify-center items-center h-64">
                    <LoadingIndicator />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md font-semibold shadow-md transition duration-300"
                  >
                    Submit Customization
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Related Assets */}
        {selectedProduct && (
          <div className="w-full max-w-6xl mt-12">
            <h3 className="text-xl font-bold text-black mb-4">
              Related Assets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedLoading ? (
                <div className="col-span-4 flex justify-center items-center h-64">
                  <LoadingIndicator />
                </div>
              ) : (
                relatedProduct.map((related) => (
                  <Link to={`/product-details/${related.id}`} key={related.id}>
                    <div
                      key={related.id}
                      onClick={() => setProduct(related)}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition duration-300"
                    >
                      <img
                        src={IMAGE_URL + product.thumbnail_url}
                        alt={related.name}
                        className="w-full h-40 object-cover rounded-md mb-3"
                      />
                      <p className="text-lg font-semibold text-black">
                        {related.name}
                      </p>
                      <p className="text-black">${related.price}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-10">
          <Link to="/stock">
            <button className="bg-black text-white px-6 py-3 rounded-md font-semibold shadow hover:bg-gray-800 transition-all duration-300">
              Back to Products
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Productdetails;
