import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import logo from "../assets/OIP.webp";
import userIcon from "../assets/user-line.png";

export default function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const servicesRef = useRef(null);
  const loginRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesOpen(false);
      }
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setLoginOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Disclosure as="nav" className="bg-gray-800 z-50 relative">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Logo and Nav */}
              <div className="flex items-center">
                <img src={logo} alt="Logo" className="h-8 w-auto mr-4" />
                <div className="hidden md:flex space-x-4">
                  <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">HOME</Link>
                  <Link to="/stock" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">PRODUCTS</Link>
                  <Link to="/cart" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">CART</Link>

                  {/* Services Dropdown */}
                  <div className="relative" ref={servicesRef}>
                    <button
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      SERVICES
                    </button>
                    {servicesOpen && (
                      <div className="absolute mt-2 w-64 bg-gray-800 rounded-md shadow-lg z-50">
                        <Link to="/photography" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Photography and Video Editing</Link>
                        <Link to="/branding" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Design and Branding</Link>
                        <Link to="/webdev" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Website Development</Link>
                        <Link to="/socialmedia" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Social Media</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Icon and Dropdown */}
              <div className="hidden md:flex items-center relative" ref={loginRef}>
                <button
                  onClick={() => setLoginOpen(!loginOpen)}
                  className="rounded-full bg-white h-10 w-10 flex items-center justify-center"
                >
                  <img src={userIcon} alt="User" className="h-6 w-6" />
                </button>
                {loginOpen && (
                  <div className="absolute right-0 top-12 bg-gray-800 w-40 rounded-md shadow-lg z-50">
                    <Link to="/login" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Login / Signup</Link>
                    
                  </div>
                )}
              </div>

              {/* Mobile Toggle Button */}
              <div className="md:hidden">
                <Disclosure.Button className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
                  {open ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          <Disclosure.Panel className="md:hidden px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">HOME</Link>
            <Link to="/stock" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">PRODUCTS</Link>
            <Link to="/cart" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">CART</Link>

            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">SERVICES</Disclosure.Button>
                  {open && (
                    <div className="pl-6 space-y-1">
                      <Link to="/photography" className="block text-sm text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-1">Photography</Link>
                      <Link to="/branding" className="block text-sm text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-1">Branding</Link>
                      <Link to="/webdev" className="block text-sm text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-1">Web Dev</Link>
                      <Link to="/socialmedia" className="block text-sm text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-1">Social Media</Link>
                    </div>
                  )}
                </>
              )}
            </Disclosure>

            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">LOGIN</Disclosure.Button>
                  {open && (
                    <div className="pl-6 space-y-1">
                      <Link to="/login" className="block text-sm text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-1">Login / Signup</Link>
                      
                    </div>
                  )}
                </>
              )}
            </Disclosure>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
