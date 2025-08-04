import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { refreshToken } from "./ProtectedRoutes";
import { ACCESS_TOKEN } from "../../src/utils/constants";
import { jwtDecode } from "jwt-decode";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

const navigation = [
  { name: "HOME", href: "/", current: true },
  { name: "PRODUCTS", href: "/stock", current: false },
  { name: "CART", href: "/cart", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef(null);
  const servicesRef = useRef(null);
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);

  const toggleDropdown = () => setOpen(!open);
  const toggleServices = () => setServicesOpen(!servicesOpen);

  const handleClickOutside = (e) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      servicesRef.current &&
      !servicesRef.current.contains(e.target)
    ) {
      setOpen(false);
      setServicesOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return setIsAuthorized(false);

    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      await refreshToken();
    } else {
      setIsAuthorized(true);
    }
  };

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
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
              <img
                alt="BASELINKS"
                src="/src/assets/OIP.webp"
                className="h-8 w-auto"
              />
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={classNames(
                    item.current
                      ? "bg-gray-50 text-black"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "rounded-md px-3 py-2 text-sm font-medium"
                  )}
                >
                  {item.name}
                </a>
              ))}

              {/* SERVICES dropdown */}
              <div className="relative" ref={servicesRef}>
                <button
                  onClick={toggleServices}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition"
                >
                  Services
                </button>
                {servicesOpen && (
                  <div className="absolute mt-2 w-40 bg-gray-800 rounded-md shadow-lg z-50">
                    <Link
                      to="/ai-images"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition"
                    >
                      AI Images
                    </Link>
                    <Link
                      to="/banners"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition"
                    >
                      Banners
                    </Link>
                    <Link
                      to="/fliers"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition"
                    >
                      Fliers
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Notifications & User */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0" ref={dropdownRef}>
            <button
              type="button"
              className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-hidden focus:ring-offset-gray-800"
            >
              <BellIcon className="size-6" />
              <span className="sr-only">View notifications</span>
            </button>

            <div className="ml-4 relative">
              <button onClick={toggleDropdown} className="focus:outline-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:scale-105 transition-transform duration-200">
                  <img
                    alt="user"
                    src="/src/assets/user-line.png"
                    className="h-6 w-auto"
                  />
                </div>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg z-50 py-2 animate-fade-in-up">
                  {!isAuthorized && (
                    <Link to="/login">
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white">
                        Login / Signup
                      </button>
                    </Link>
                  )}
                  {isAuthorized && (
                    <>
                      <Link to="/dashboard">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white">
                          Dashboard
                        </button>
                      </Link>
                      <Link to="/logout">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white">
                          Logout
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={classNames(
                item.current
                  ? "bg-gray-50 text-black"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}

        <DisclosureButton
  as="div"
  onClick={toggleServices}
  className="block rounded-md px-3 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
>
  Services
  {servicesOpen && (
    <div className="mt-1 space-y-1 pl-4">
      <Link
        to="/ai-images"
        className="block px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        AI Images
      </Link>
      <Link
        to="/banners"
        className="block px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        Banners
      </Link>
      <Link
        to="/fliers"
        className="block px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        Fliers
      </Link>
    </div>
  )}
</DisclosureButton>

        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
