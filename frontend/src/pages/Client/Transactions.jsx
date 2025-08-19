import React from 'react';

const mockTransactions = [
  {
    id: 'TXN-31120',
    type: 'Wallet Credit',
    date: 'July 5, 2025',
    amount: '+₦50,000.00',
    status: 'Successful',
  },
  {
    id: 'TXN-31119',
    type: 'Order Payment',
    date: 'July 6, 2025',
    amount: '-₦42,500.00',
    status: 'Successful',
  },
  {
    id: 'TXN-31100',
    type: 'Refund',
    date: 'June 30, 2025',
    amount: '+₦15,000.00',
    status: 'Reversed',
  },
];

const getColor = (status) => {
  switch (status) {
    case 'Successful':
      return 'text-green-600';
    case 'Reversed':
      return 'text-blue-600';
    case 'Failed':
      return 'text-red-600';
    default:
      return 'text-gray-700';
  }
};

const Transactions = () => {
  return (
    <div className="animate-fade-in-up space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-black">Transaction History</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 sm:px-6 py-4 text-left whitespace-nowrap">Transaction ID</th>
              <th className="px-4 sm:px-6 py-4 text-left whitespace-nowrap">Type</th>
              <th className="px-4 sm:px-6 py-4 text-left whitespace-nowrap">Date</th>
              <th className="px-4 sm:px-6 py-4 text-left whitespace-nowrap">Amount</th>
              <th className="px-4 sm:px-6 py-4 text-left whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((txn, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 sm:px-6 py-4 font-medium whitespace-nowrap">{txn.id}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{txn.type}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{txn.date}</td>
                <td
                  className={`px-4 sm:px-6 py-4 font-semibold whitespace-nowrap ${
                    txn.amount.startsWith('+') ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {txn.amount}
                </td>
                <td
                  className={`px-4 sm:px-6 py-4 font-semibold whitespace-nowrap ${getColor(txn.status)}`}
                >
                  {txn.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
