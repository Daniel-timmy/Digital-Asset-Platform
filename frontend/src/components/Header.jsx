import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { refreshToken } from "./ProtectedRoutes";
import { ACCESS_TOKEN } from "../../src/utils/constants";
import { jwtDecode } from "jwt-decode";
import logo from "/src/assets/OIP.webp";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

import logo from "../assets/OIP.webp";
import userIcon from "../assets/user-line.png";

export default function Header() {
  const [open, setOpen] = useState(false);
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
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-50 hover:bg-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="block size-6 group-data-open:hidden" />
              <XMarkIcon className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>

          {/* Logo & Navigation */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img alt="BASELINKS" src={logo} className="h-8 w-auto" />
            </div>

              {/* User Icon and Dropdown */}
              <div className="hidden md:flex items-center relative" ref={loginRef}>
                <button
                  onClick={() => setLoginOpen(!loginOpen)}
                  className="rounded-full bg-white h-10 w-10 flex items-center justify-center"
                >
                  SERVICES
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
