import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-gray-50 to-white border-t border-gray-200 mt-20 px-8 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-gray-900 mb-4 relative inline-block">
              About Brush
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-black rounded-full"></span>
            </h4>
            <p className="text-gray-600 leading-relaxed text-sm">
              Brush is a digital solutions company empowering businesses through
              innovation, design, and strategy. We help you brand, build, and
              grow.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-gray-900 mb-4 relative inline-block">
              Contact
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-black rounded-full"></span>
            </h4>
            <div className="space-y-3 text-sm">
              <p className="text-gray-600 hover:text-black transition-colors cursor-pointer flex items-center gap-2">
                <span className="text-black">✉</span> info@brush.com
              </p>
              <p className="text-gray-600 hover:text-black transition-colors cursor-pointer flex items-center gap-2">
                <span className="text-black">📞</span> +234 8125754326
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-gray-900 mb-4 relative inline-block">
              Address
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-black rounded-full"></span>
            </h4>
            <p className="text-gray-600 leading-relaxed text-sm"></p>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-gray-900 mb-4 relative inline-block">
              Follow Us
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-black rounded-full"></span>
            </h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-xl"
                aria-label="Facebook"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white hover:scale-110 transition-all duration-300 shadow-md hover:shadow-xl"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-xl"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2025 Brush. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-gray-600 hover:text-black transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-black transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
