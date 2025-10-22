// src/components/Header.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { refreshToken } from "./ProtectedRoutes";
import { ACCESS_TOKEN } from "../../src/utils/constants";
import { jwtDecode } from "jwt-decode";
import logo from "../assets/OIP.png";
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";

const navigation = [
  { name: "DESIGNS", href: "/stock" },
  { name: "CATEGORIES", href: "/categories" },
  { name: "ABOUT", href: "/#about" },
  { name: "CONTACT", href: "/#contact" },
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
  const { getCount } = useCart();
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
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 overflow-visible">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 overflow-visible">
        <div className="relative flex h-20 items-center justify-between overflow-visible">
          {/* Mobile menu button (left) */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="inline-flex items-center justify-center rounded-lg p-2.5 text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Logo + Desktop nav */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:opacity-80 transition-opacity"
              >
                <img alt="BASELINKS" src={logo} className="h-10 w-auto" />
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      isActive
                        ? "text-black bg-gray-100"
                        : "text-gray-700 hover:text-black hover:bg-gray-50",
                      "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side: cart, notifications, user */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 overflow-visible">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative rounded-xl bg-gray-100 p-2.5 text-gray-700 hover:text-black hover:bg-gray-200 focus:ring-2 focus:ring-black transition-all duration-200 hover:scale-105"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <button
              type="button"
              className="ml-3 relative rounded-xl bg-gray-100 p-2.5 text-gray-700 hover:text-black hover:bg-gray-200 focus:ring-2 focus:ring-black transition-all duration-200 hover:scale-105"
              aria-label="Notifications"
            >
              <BellIcon className="h-6 w-6" />
            </button>

            {/* User dropdown (desktop only) */}
            <div
              className="hidden sm:block relative ml-4 overflow-visible"
              ref={dropdownRef}
            >
              <button
                onClick={toggleUser}
                aria-expanded={userOpen}
                className="flex items-center rounded-xl bg-gray-100 p-2.5 text-gray-700 hover:text-black hover:bg-gray-200 focus:ring-2 focus:ring-black transition-all duration-200 hover:scale-105"
              >
                <UserIcon className="h-6 w-6" />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 animate-fade-in">
                  {!isAuthorized ? (
                    <Link
                      to="/login"
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg mx-2 transition-colors"
                      onClick={() => setUserOpen(false)}
                    >
                      Login / Signup
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg mx-2 transition-colors"
                        onClick={() => setUserOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/logout"
                        className="block px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mx-2 transition-colors"
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
        className={`fixed inset-y-0 left-0 w-72 h-screen bg-white shadow-2xl z-50 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out sm:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src={logo} alt="BASELINKS" className="h-10 w-auto" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        {/* Mobile nav links */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={classNames(
                  isActive
                    ? "text-black bg-gray-100 font-semibold"
                    : "text-gray-700 hover:text-black hover:bg-gray-50",
                  "block rounded-xl px-4 py-3 text-base font-medium transition-all duration-200"
                )}
              >
                {item.name}
              </Link>
            );
          })}
          {/* Login/Signup (mobile) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {!isAuthorized ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-black text-white px-4 py-3 rounded-xl hover:bg-gray-800 font-semibold transition-colors shadow-md"
              >
                Login / Signup
              </Link>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl font-medium transition-colors mb-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/logout"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
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
