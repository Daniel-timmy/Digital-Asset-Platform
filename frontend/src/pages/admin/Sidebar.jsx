import { NavLink, useNavigate } from "react-router-dom";
import { memo, useState } from "react";
import {
  HomeIcon,
  CloudArrowUpIcon,
  UsersIcon,
  TicketIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      key: "upload",
      label: "Upload Products",
      path: "/admin/upload",
      icon: <CloudArrowUpIcon className="w-5 h-5" />,
    },
    {
      key: "users",
      label: "View Users",
      path: "/admin/users",
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      key: "tickets",
      label: "Support Tickets",
      path: "/admin/tickets",
      icon: <TicketIcon className="w-5 h-5" />,
    },
    {
      key: "transactions",
      label: "Transactions",
      path: "/admin/transactions",
      icon: <CreditCardIcon className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-72"
      } bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out flex flex-col shadow-lg`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">System Management</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ml-auto"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.key}
            end={item.key === "dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-black to-gray-800 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-900"
                  } transition-colors`}
                >
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
                {!isCollapsed && isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && (
            <span className="font-medium text-sm">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default memo(Sidebar);