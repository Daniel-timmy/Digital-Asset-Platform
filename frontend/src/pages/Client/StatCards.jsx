import React from 'react';

const cards = [
  { title: 'Pending Orders', value: 0, sub: 'Unpaid orders' },
  { title: 'Processed Order', value: 0, sub: 'Orders under processing' },
  { title: 'Completed Order', value: 1, sub: 'Orders shipped or delivered' },
  { title: 'Wallet Balance', value: '₦0.00', sub: 'Total wallet balance', highlight: true }
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in-up delay-200">
      {cards.map((item, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
        >
          <p className="text-gray-500 text-sm">{item.title}</p>
          <h3 className={`text-2xl font-bold mt-2 ${item.highlight ? 'text-green-600' : ''}`}>
            {item.value}
          </h3>
          <p className="text-gray-400 text-xs mt-1">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
