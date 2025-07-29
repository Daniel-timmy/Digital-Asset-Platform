import React from 'react';

const Customizations = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Customization Requests</h2>
    <ul className="space-y-4">
      {[
        'User A requested a red hoodie with initials.',
        'User B wants a slim-fit jogger in navy.'
      ].map((req, i) => (
        <li key={i} className="bg-white p-4 rounded-lg shadow-md">
          <p>{req}</p>
          <div className="mt-2 flex gap-2">
            <button className="px-4 py-1 text-sm bg-green-600 text-white rounded-md">Approve</button>
            <button className="px-4 py-1 text-sm bg-red-600 text-white rounded-md">Decline</button>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default Customizations;
