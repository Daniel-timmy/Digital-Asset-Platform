import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'orders', label: 'Orders' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'logout', label: 'Logout' },
  ];

  return (
    <aside className="w-full sm:w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 p-4 sm:p-6 shadow-md sm:min-h-screen">
      <ul className="flex sm:flex-col flex-wrap justify-between sm:space-y-2 space-x-2 sm:space-x-0 text-gray-800 text-sm font-medium">
        {tabs.map((tab) => (
          <li
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md cursor-pointer transition text-center sm:text-left ${
              activeTab === tab.key
                ? 'bg-black text-white shadow-sm'
                : 'hover:bg-gray-200'
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
