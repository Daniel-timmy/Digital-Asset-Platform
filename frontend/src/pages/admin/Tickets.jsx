// src/pages/Tickets.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaComments } from "react-icons/fa";
import api from "../../utils/api";
import Toast from "../../components/Toast";

// Define Chat component outside of Tickets
const Chat = ({ selectedTicketId, tickets, chatInput, setChatInput }) => {
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info"
  });

  const selectedTicket = tickets.find(
    (ticket) => ticket.id === selectedTicketId
  );

  useEffect(() => {
    if (!selectedTicketId) return;

    const getMessages = async () => {
      try {
        const res = await api.get(`/messages/ticket/${selectedTicketId}`);
        setMessages(res.data.data || []);
      } catch (error) {
        setToast({
          show: true,
          message: "Failed to load messages. Please try again.",
          type: "error"
        });
      }
    };
    getMessages();
  }, [selectedTicketId]);

  const inputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!selectedTicketId || !chatInput.trim()) return;
    try {
      const res = await api.post(`/messages/`, {
        ticketId: selectedTicketId,
        message: chatInput,
      });
      setMessages((prevMessages) => [...prevMessages, res.data.data]);
      setChatInput("");
      inputRef.current.focus(); // Restore focus after sending
      setToast({
        show: true,
        message: "Message sent successfully",
        type: "success"
      });
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to send message. Please try again.",
        type: "error"
      });
    }
  };

  if (!selectedTicketId) {
    return (
      <p className="text-gray-600 italic mt-4">
        Select a ticket to view the conversation.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col h-full">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {selectedTicket?.name} ({selectedTicket?.status})
      </h3>
      <div className="flex-1 h-96 overflow-y-auto bg-white p-4 rounded-md shadow-inner space-y-3 border border-gray-200">
        {messages.map((chat) => (
          <div
            key={chat.id}
            className={`flex max-w-xs p-3 rounded-lg text-sm ${
              chat?.user?.role === "admin"
                ? "bg-black text-white ml-auto"
                : "bg-gray-200 text-gray-800 mr-auto"
            }`}
          >
            <div>
              <strong>{chat?.user?.name}</strong>: {chat.message}
              <p className="text-xs mt-1 opacity-75">
                {new Date(chat.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex mt-4 gap-2">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your response..."
          onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const Tickets = () => {
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [tickets, setTickets] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info"
  });

  useEffect(() => {
    const getTickets = async () => {
      try {
        const res = await api.get("/ticket/");
        setTickets(res.data.data || []);
      } catch (error) {
        setToast({
          show: true,
          message: "Failed to load tickets. Please try again.",
          type: "error"
        });
      }
    };
    getTickets();
  }, []);

  return (
    <div className="p-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <FaComments /> Support Tickets
      </h2>
      <div className="flex gap-8 h-[calc(100vh-10rem)]">
        <div className="w-1/3 space-y-3 overflow-y-auto">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`p-4 rounded-md shadow-sm cursor-pointer transition border border-gray-200 ${
                selectedTicketId === ticket.id
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              <h3 className="font-semibold">{ticket.name}</h3>
              <p className="text-sm opacity-75">
                {ticket.status}
                {"   "}
                {new Date(ticket.created_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          ))}
        </div>
        <div className="w-2/3 flex flex-col">
          <Chat
            selectedTicketId={selectedTicketId}
            tickets={tickets}
            chatInput={chatInput}
            setChatInput={setChatInput}
          />
        </div>
      </div>
    </div>
  );
};

export default Tickets;
