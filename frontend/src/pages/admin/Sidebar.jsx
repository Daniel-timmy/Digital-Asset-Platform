// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { memo, useState } from "react";
import {
  FaHome,
  FaUpload,
  FaTools,
  FaUsers,
  FaTicketAlt,
  FaMoneyCheck,
  FaCalendarAlt,
  FaCamera,
  FaCode,
  FaPalette,
  FaShareAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false); // State for bookings submenu

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaHome className="mr-2" />,
    },
    {
      key: "upload",
      label: "Upload Products",
      path: "/admin/upload",
      icon: <FaUpload className="mr-2" />,
    },
    {
      key: "customizations",
      label: "Customization Requests",
      path: "/admin/customizations",
      icon: <FaTools className="mr-2" />,
    },
    {
      key: "users",
      label: "View Users",
      path: "/admin/users",
      icon: <FaUsers className="mr-2" />,
    },
    {
      key: "tickets",
      label: "Tickets",
      path: "/admin/tickets",
      icon: <FaTicketAlt className="mr-2" />,
    },
    {
      key: "transactions",
      label: "Transactions",
      path: "/admin/transactions",
      icon: <FaMoneyCheck className="mr-2" />,
    },
    {
      key: "bookings",
      label: "Bookings",
      icon: <FaCalendarAlt className="mr-2" />,
      subItems: [
        {
          key: "photography",
          label: "Photography",
          path: "/admin/bookings/photography",
          icon: <FaCamera className="mr-2" />,
        },
        {
          key: "webdev",
          label: "Web Dev/UIUX",
          path: "/admin/bookings/webdev",
          icon: <FaCode className="mr-2" />,
        },
        {
          key: "branding",
          label: "Branding",
          path: "/admin/bookings/branding",
          icon: <FaPalette className="mr-2" />,
        },
        {
          key: "socialmedia",
          label: "Social Media Management",
          path: "/admin/bookings/socialmedia",
          icon: <FaShareAlt className="mr-2" />,
        },
      ],
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

export default memo(Sidebar);
