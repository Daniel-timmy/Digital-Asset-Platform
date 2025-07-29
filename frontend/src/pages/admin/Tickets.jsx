import React from 'react';
import { FaComments } from 'react-icons/fa';

const Tickets = ({
  ticketChats,
  selectedTicket,
  setSelectedTicket,
  chatInput,
  setChatInput,
  handleSendMessage
}) => {
  const renderChat = () => {
    if (!selectedTicket) {
      return <p className="text-gray-600 italic mt-4">Select a ticket to view conversation.</p>;
    }

    const chats = ticketChats[selectedTicket] || [];

    return (
      <div className="mt-6">
        <div className="h-64 overflow-y-auto bg-white p-4 rounded-md shadow-inner space-y-2 border border-gray-200">
          {chats.map((chat, i) => (
            <div
              key={i}
              className={`max-w-xs p-2 rounded-md text-sm ${
                chat.sender === 'Admin'
                  ? 'bg-black text-white self-end ml-auto'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <strong>{chat.sender}:</strong> {chat.message}
            </div>
          ))}
        </div>
        <div className="flex mt-4 gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-md"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type your response..."
          />
          <button className="px-4 py-2 bg-black text-white rounded-md" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaComments /> Support Tickets
      </h2>
      <div className="flex gap-8">
        <div className="w-1/3 space-y-3">
          {Object.keys(ticketChats).map((ticket, i) => (
            <div
              key={i}
              className={`p-3 rounded-md shadow-sm cursor-pointer transition ${
                selectedTicket === ticket ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
              }`}
              onClick={() => setSelectedTicket(ticket)}
            >
              {ticket}
            </div>
          ))}
        </div>
        <div className="w-2/3">{renderChat()}</div>
      </div>
    </div>
  );
};

export default Tickets;
