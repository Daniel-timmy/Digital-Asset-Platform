import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "orders", label: "Orders" },
    { key: "transactions", label: "Transactions" },
    { key: "downloads", label: "Downloads" },
    { key: "logout", label: "Logout" },
  ];

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 p-6 shadow-md min-h-screen">
      <ul className="space-y-2 text-gray-800 text-sm font-medium">
        {tabs.map((tab) => (
          <li
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md cursor-pointer transition ${
              activeTab === tab.key
                ? "bg-black text-white shadow-sm"
                : "hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
