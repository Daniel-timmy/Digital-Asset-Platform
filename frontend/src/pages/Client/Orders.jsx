import React from 'react';

const mockOrders = [
  {
    id: 'ORD-98231',
    items: ['Logo Pack', '3D Mockup'],
    date: 'July 10, 2025',
    status: 'Processing',
    amount: '₦25,000.00',
  },
  {
    id: 'ORD-98210',
    items: ['T-shirt Design', 'Promo Banner'],
    date: 'July 6, 2025',
    status: 'Completed',
    amount: '₦42,500.00',
  },
  {
    id: 'ORD-98122',
    items: ['Branding Kit'],
    date: 'June 30, 2025',
    status: 'Cancelled',
    amount: '₦15,000.00',
  },
];

const statusColors = {
  Processing: 'text-yellow-600',
  Completed: 'text-green-600',
  Cancelled: 'text-red-600',
};

const Orders = () => {
  return (
    <div className="animate-fade-in-up space-y-6">
      <h2 className="text-3xl font-bold text-black">Your Orders</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Order ID</th>
              <th className="px-6 py-4 text-left">Items</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium">{order.id}</td>
                <td className="px-6 py-4">{order.items.join(', ')}</td>
                <td className="px-6 py-4">{order.date}</td>
                <td className={`px-6 py-4 font-semibold ${statusColors[order.status]}`}>
                  {order.status}
                </td>
                <td className="px-6 py-4">{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
