import React from 'react';
import { FaBoxOpen, FaUsers, FaClipboardList, FaMoneyBillWave } from 'react-icons/fa';

const Dashboard = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Welcome, Admin</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { title: 'Total Products', value: 120, icon: <FaBoxOpen className="text-2xl" /> },
        { title: 'Active Users', value: 457, icon: <FaUsers className="text-2xl" /> },
        { title: 'Custom Requests', value: 18, icon: <FaClipboardList className="text-2xl" /> },
        { title: 'Today’s Sales', value: '₦87,500', icon: <FaMoneyBillWave className="text-2xl" /> }
      ].map((item, idx) => (
        <div key={idx} className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-full">{item.icon}</div>
          <div>
            <p className="text-sm text-gray-500">{item.title}</p>
            <h3 className="text-xl font-bold">{item.value}</h3>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Dashboard;
