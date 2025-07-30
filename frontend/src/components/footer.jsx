import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-white shadow-inner mt-12 px-8 py-10 text-black animate-fade-in-up delay-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        
        {/* About */}
        <div>
          <h4 className="text-lg font-semibold mb-2">About BASELINKS</h4>
          <p className="text-gray-800">
            BASELINKS is a digital solutions company empowering businesses through innovation, design, and strategy. We help you brand, build, and grow.
          </p>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Contact</h4>
          <p className="text-gray-800">Email: info@baselinks.com</p>
          <p className="text-gray-800">Phone: +234 907 484 2677</p>
        </div>

        {/* Address */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Address</h4>
          <p className="text-gray-800">
            6A, D-sha Street,
Lekki Palm City Estate,
Addo Road, Ajah. <br />
            
          </p>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
          <div className="flex space-x-4 mt-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:scale-110 transition-transform">
              <FaFacebookF size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:scale-110 transition-transform">
              <FaInstagram size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:scale-110 transition-transform">
              <FaLinkedinIn size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="text-center mt-10 text-gray-600 text-xs">
        © 2025 BASELINKS. All rights reserved.
      </div>
    </footer>
  );
}
