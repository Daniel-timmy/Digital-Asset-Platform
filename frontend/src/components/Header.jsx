// src/components/Header.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { refreshToken } from "./ProtectedRoutes";
import { ACCESS_TOKEN } from "../../src/utils/constants";
import { jwtDecode } from "jwt-decode";
import logo from "../assets/OIP.webp";
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";

const navigation = [
  { name: "HOME", href: "/" },
  { name: "PRODUCTS", href: "/stock" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const [userOpen, setUserOpen] = useState(false); // user dropdown
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // sidebar/mobile menu
  const dropdownRef = useRef(null);
  const servicesRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthorized, setIsAuthorized] = useState(null);

  // Cart from context (this makes the badge update globally)
  const { cart, getCount } = useCart();
  const cartCount = getCount();

  // toggle helpers
  const toggleUser = () => setUserOpen((s) => !s);
  const toggleDesktopServices = () => setDesktopServicesOpen((s) => !s);
  const toggleMobileServices = () => setMobileServicesOpen((s) => !s);

  // Close dropdowns/menus when clicking outside
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setUserOpen(false);
    }
    if (servicesRef.current && !servicesRef.current.contains(e.target)) {
      setDesktopServicesOpen(false);
    }
    if (
      mobileMenuRef.current &&
      mobileMenuOpen &&
      !mobileMenuRef.current.contains(e.target)
    ) {
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // ✅ Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth check
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return setIsAuthorized(false);
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        await refreshToken();
      } else {
        setIsAuthorized(true);
      }
    } catch {
      setIsAuthorized(false);
    }
  };

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button (left) */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Logo + Desktop nav */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <img alt="BASELINKS" src={logo} className="h-8 w-auto" />
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      isActive
                        ? "text-black border-b-2 border-black"
                        : "text-gray-600 hover:text-black hover:border-b-2 hover:border-black",
                      "px-3 py-2 text-sm font-medium transition-all duration-200"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* SERVICES dropdown (desktop) */}
              <div className="relative" ref={servicesRef}>
                <button
                  onClick={toggleDesktopServices}
                  aria-expanded={desktopServicesOpen}
                  className="text-gray-600 hover:text-black px-3 py-2 text-sm font-medium transition"
                >
                  SERVICES
                </button>

                {desktopServicesOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                    <Link
                      to="/photography"
                      onClick={() => setDesktopServicesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Photography and video editing
                    </Link>
                    <Link
                      to="/branding"
                      onClick={() => setDesktopServicesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Design and branding
                    </Link>
                    <Link
                      to="/webdev"
                      onClick={() => setDesktopServicesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Website and development
                    </Link>
                    <Link
                      to="/socialmedia"
                      onClick={() => setDesktopServicesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Social media
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side: cart, notifications, user */}
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
            ref={dropdownRef}
          >
            {/* Cart */}
            <Link
              to="/cart"
              className="relative rounded-full bg-gray-100 p-2 text-gray-600 hover:text-black hover:bg-gray-200 focus:ring-2 focus:ring-black"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-600 text-white text-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <button
              type="button"
              className="ml-3 relative rounded-full bg-gray-100 p-2 text-gray-600 hover:text-black hover:bg-gray-200 focus:ring-2 focus:ring-black"
              aria-label="Notifications"
            >
              <BellIcon className="h-6 w-6" />
            </button>

            {/* User dropdown (desktop only) */}
            <div className="hidden sm:block relative ml-4">
              <button
                onClick={toggleUser}
                aria-expanded={userOpen}
                className="flex items-center rounded-full bg-gray-100 p-2 text-gray-600 hover:text-black hover:bg-gray-200 focus:ring-2 focus:ring-black"
              >
                <UserIcon className="h-6 w-6" />
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50 py-2">
                  {!isAuthorized ? (
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserOpen(false)}
                    >
                      Login / Signup
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/logout"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserOpen(false)}
                      >
                        Logout
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src={logo} alt="BASELINKS" className="h-8 w-auto" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile nav links */}
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={classNames(
                  isActive
                    ? "text-black bg-gray-100"
                    : "text-gray-600 hover:text-black hover:bg-gray-50",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Mobile services accordion */}
          <div>
            <button
              onClick={toggleMobileServices}
              className="w-full text-left block rounded-md px-3 py-2 text-base text-gray-600 hover:text-black hover:bg-gray-50"
            >
              Services
            </button>

            {mobileServicesOpen && (
              <div className="mt-1 space-y-1 pl-4">
                <Link
                  to="/photography"
                  className="block px-3 py-1 text-sm text-gray-600 hover:text-black hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Photography and video editing
                </Link>
                <Link
                  to="/branding"
                  className="block px-3 py-1 text-sm text-gray-600 hover:text-black hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Design and branding
                </Link>
                <Link
                  to="/webdev"
                  className="block px-3 py-1 text-sm text-gray-600 hover:text-black hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Website and development
                </Link>
                <Link
                  to="/socialmedia"
                  className="block px-3 py-1 text-sm text-gray-600 hover:text-black hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Social media
                </Link>
              </div>
            )}
          </div>

          {/* Login/Signup (mobile) */}
          <div className="mt-6 border-t pt-4">
            {!isAuthorized ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Login / Signup
              </Link>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  to="/logout"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-md"
                >
                  Logout
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
