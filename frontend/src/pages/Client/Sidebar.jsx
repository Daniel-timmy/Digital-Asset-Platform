import { NavLink, useNavigate } from "react-router-dom";
import { memo, useState } from "react";
import {
  FaHome,
  FaTicketAlt,
  FaMoneyCheck,
  FaCartArrowDown,
  FaSignOutAlt,
  FaDownload,
} from "react-icons/fa";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
      icon: <FaHome className="mr-2" />,
    },
    {
      key: "orders",
      label: "Orders",
      path: "/dashboard/orders",
      icon: <FaCartArrowDown className="mr-2" />,
    },
    {
      key: "transactions",
      label: "Transactions",
      path: "/dashboard/transactions",
      icon: <FaMoneyCheck className="mr-2" />,
    },
    {
      key: "tickets",
      label: "Tickets",
      path: "/dashboard/tickets",
      icon: <FaTicketAlt className="mr-2" />,
    },
    {
      key: "downloads",
      label: "Downloads",
      path: "/dashboard/downloads",
      icon: <FaDownload className="mr-2" />,
    },
  ];

  const handleLogout = () => {
    // Clear auth data if you have (localStorage/session)
    localStorage.removeItem("authToken");
    sessionStorage.clear();

    // Redirect to login
    navigate("/login");
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20 p-2" : "w-64 p-6"
      } bg-white/90 backdrop-blur-md border-r border-gray-200 shadow-md min-h-screen transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-lg font-semibold text-gray-800 ${
            isCollapsed ? "hidden" : ""
          }`}
        >
          Dashboard
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
            end={tab.key === "dashboard"}
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
                className="flex items-center px-4 py-2 rounded-md cursor-pointer transition"
                onClick={() =>
                  tab.subItems && setIsBookingsOpen(!isBookingsOpen)
                }
              >
                {tab.icon}
                <span className={isCollapsed ? "hidden" : ""}>{tab.label}</span>
              </div>
            </li>
          </NavLink>
        ))}

        {/* Logout button */}
        <NavLink
          to="/logout"
          className={({ isActive }) =>
            `flex items-center rounded-md w-full ${
              isActive
                ? "bg-red-600 text-white"
                : "hover:bg-red-100 text-red-600"
            }`
          }
        >
          <li>
            <div className="flex items-center px-4 py-2 rounded-md cursor-pointer transition">
              <FaSignOutAlt className="mr-2" />
              <span className={isCollapsed ? "hidden" : ""}>Logout</span>
            </div>
          </li>
        </NavLink>
      </ul>
    </aside>
  );
};

export default memo(Sidebar);
