import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../App.css';

function Productdetails() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const products = [
    { id: 1, name: 'AI Art', price: 49.99, img: 'https://via.placeholder.com/300x200?text=AI+Art', desc: 'Create stunning AI-generated art' },
    { id: 2, name: 'Design Toolkit', price: 29.99, img: 'https://via.placeholder.com/300x200?text=Design+Toolkit', desc: 'Professional design resources' },
    { id: 3, name: 'Tech Gadget', price: 99.99, img: 'https://via.placeholder.com/300x200?text=Tech+Gadget', desc: 'Latest tech innovation' },
    { id: 4, name: 'Creative Suite', price: 79.99, img: 'https://via.placeholder.com/300x200?text=Creative+Suite', desc: 'All-in-one creativity tools' },
    { id: 5, name: 'AI Tools', price: 39.99, img: 'https://via.placeholder.com/300x200?text=AI+Tools', desc: 'Essential AI-powered utilities' },
    { id: 6, name: 'Design Essentials', price: 19.99, img: 'https://via.placeholder.com/300x200?text=Design+Essentials', desc: 'Basic design resources' },
  ];

  useEffect(() => {
    const productId = 1; // Replace with useParams in a real app
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100 font-sans text-gray-800">
      <Header />

      <div className="w-full px-4 py-10 flex flex-col items-center justify-center">
        <div className={`text-black text-xl font-bold mb-8 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          PRODUCT DETAILS
        </div>

        {selectedProduct && (
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl shadow-2xl p-8">
            {/* Product Preview */}
            <div className="flex flex-col items-center">
              <img src={selectedProduct.img} alt={selectedProduct.name} className="w-full max-w-md rounded-xl shadow-md mb-4" />
              <h2 className="text-3xl font-bold text-black mb-2">{selectedProduct.name}</h2>
              <p className="text-lg text-gray-600 mb-3">{selectedProduct.desc}</p>
              <p className="text-2xl font-semibold text-black">Price: ${selectedProduct.price}</p>
            </div>

            {/* Product Customization Form */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner w-full">
              <h3 className="text-2xl font-bold text-black mb-4">Customize Your Product</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black">Color</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 mt-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter color"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Size</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 mt-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter size"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 mt-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter quantity"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md font-semibold shadow-md transition duration-300"
                >
                  Submit Customization
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Related Assets */}
        {selectedProduct && (
          <div className="w-full max-w-6xl mt-12">
            <h3 className="text-xl font-bold text-black mb-4">Related Assets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter(p => p.id !== selectedProduct.id)
                .slice(0, 3)
                .map(related => (
                  <div key={related.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition duration-300">
                    <img src={related.img} alt={related.name} className="w-full h-40 object-cover rounded-md mb-3" />
                    <p className="text-lg font-semibold text-black">{related.name}</p>
                    <p className="text-black">${related.price}</p>
                  </div>
                ))}
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
