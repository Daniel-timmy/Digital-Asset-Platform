import React from 'react';

const orders = [
  {
    id: '64579',
    items: 'Creative Tools',
    date: 'March 4, 2025',
    status: 'Cancelled',
    color: 'text-red-600',
    total: '₦100,000.00',
  },
  {
    id: '64577',
    items: 'Arts and Design assets',
    date: 'March 4, 2025',
    status: 'Completed',
    color: 'text-green-600',
    total: '₦100,000.00',
  }
];

export default function RecentOrders() {
  return (
    <section className="animate-fade-in-up delay-400 px-4 sm:px-6 md:px-8">
      <h3 className="text-lg font-semibold mb-4">Your Recent Orders</h3>
      <div className="overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="min-w-[600px] w-full text-sm">
          <thead className="text-left bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((row, i) => (
              <tr className="border-t hover:bg-gray-50 transition" key={i}>
                <td className="px-4 py-3">{row.id}</td>
                <td className="px-4 py-3">{row.items}</td>
                <td className="px-4 py-3">{row.date}</td>
                <td className={`px-4 py-3 font-semibold ${row.color}`}>{row.status}</td>
                <td className="px-4 py-3">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
