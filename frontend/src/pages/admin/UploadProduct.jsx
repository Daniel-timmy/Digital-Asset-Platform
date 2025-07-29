import React from 'react';

const UploadProduct = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Upload New Product</h2>
    <form className="space-y-4 bg-white p-6 rounded-lg shadow-md max-w-xl">
      <input type="text" placeholder="Product Name" className="w-full px-4 py-2 border rounded-md" />
      <input type="number" placeholder="Price (₦)" className="w-full px-4 py-2 border rounded-md" />
      <textarea placeholder="Description" className="w-full px-4 py-2 border rounded-md" rows="4" />
      <select className="w-full px-4 py-2 border rounded-md">
        <option value="">Select Category</option>
        <option value="hoodie">Hoodies</option>
        <option value="tees">T-Shirts</option>
        <option value="joggers">Joggers</option>
      </select>
      <input type="file" className="w-full" />
      <button type="submit" className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800">
        Upload
      </button>
    </form>
  </div>
);

export default UploadProduct;
