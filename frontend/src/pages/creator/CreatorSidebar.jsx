// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { memo, useState } from "react";
import {
  FaHome,
  FaUpload,
  FaTicketAlt,
  FaMoneyCheck,
  FaPic,
} from "react-icons/fa";

const CreatorSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false); // State for bookings submenu

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      path: "/creator/dashboard",
      icon: <FaHome className="mr-2" />,
    },
    {
      key: "upload",
      label: "Upload Products",
      path: "/creator/upload",
      icon: <FaUpload className="mr-2" />,
    },

    {
      key: "tickets",
      label: "Tickets",
      path: "/creator/tickets",
      icon: <FaTicketAlt className="mr-2" />,
    },
    {
      key: "transactions",
      label: "Transactions",
      path: "/creator/transactions",
      icon: <FaMoneyCheck className="mr-2" />,
    },
    {
      key: "profile",
      label: "Profile",
      path: "/creator/profile",
      icon: <FaPic className="mr-2" />,
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? "w-20 p-2" : "w-64 p-6"
      } bg-white/90 backdrop-blur-md border-r border-gray-200  shadow-md min-h-screen transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-lg font-semibold text-gray-800 ${
            isCollapsed ? "hidden" : ""
          }`}
        >
          Admin Panel
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-800 hover:text-black"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>
      <ul className="space-y-2 text-gray-800 text-sm font-medium">
        {navItems.map((tab) => (
          <NavLink
            to={tab.path}
            key={tab.key}
            className={({ isActive }) =>
              `flex items-center rounded-md w-full ${
                isActive && !tab.subItems
                  ? "bg-black text-white"
                  : "hover:bg-gray-200"
              }`
            }
          >
            <li>
              <div
                className="flex items-center px-4 py-2 rounded-md cursor-pointer transition "
                onClick={() =>
                  tab.subItems && setIsBookingsOpen(!isBookingsOpen)
                }
              >
                {tab.icon}
                <span className={isCollapsed ? "hidden" : ""}>{tab.label}</span>
                {tab.subItems && (
                  <svg
                    className={`w-4 h-4 ml-auto transition-transform ${
                      isBookingsOpen && tab.key === "bookings"
                        ? "rotate-180"
                        : ""
                    } ${isCollapsed ? "hidden" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </div>
              {/* Submenu for Bookings */}
              {tab.subItems && isBookingsOpen && tab.key === "bookings" && (
                <ul className="ml-6 space-y-1 mt-1">
                  {tab.subItems.map((subItem) => (
                    <li key={subItem.key}>
                      <NavLink
                        to={subItem.path}
                        className={({ isActive }) =>
                          `flex items-center py-2 text-sm rounded-md transition ${
                            isActive
                              ? "bg-black text-white"
                              : "hover:bg-gray-200"
                          } ${isCollapsed ? "px-2" : " px-4 "}`
                        }
                      >
                        {subItem.icon}
                        <span className={isCollapsed ? "hidden" : ""}>
                          {subItem.label}
                        </span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </NavLink>
        ))}
      </ul>
    </aside>
  );
};

export default memo(CreatorSidebar);
