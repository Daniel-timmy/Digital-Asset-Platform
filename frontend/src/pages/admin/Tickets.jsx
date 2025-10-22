import React, { useState, useEffect, useRef } from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import Toast from "../../components/Toast";

const statusConfig = {
  open: {
    color: "text-blue-600 bg-blue-50",
    icon: <ClockIcon className="w-4 h-4" />,
  },
  closed: {
    color: "text-gray-600 bg-gray-50",
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  resolved: {
    color: "text-emerald-600 bg-emerald-50",
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
};

const Chat = ({ selectedTicketId, tickets, chatInput, setChatInput }) => {
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info"
  });
  const messagesEndRef = useRef(null);

  const selectedTicket = tickets.find(
    (ticket) => ticket.id === selectedTicketId
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      inputRef.current.focus();
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
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Ticket Selected
        </h3>
        <p className="text-gray-500 max-w-md">
          Select a ticket from the list to view and respond to the conversation
        </p>
      </div>
    );
  }

  const status = statusConfig[selectedTicket?.status] || statusConfig.open;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
      
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {selectedTicket?.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Ticket #{selectedTicket?.id.slice(0, 8)}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}
          >
            {status.icon}
            {selectedTicket?.status}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((chat) => (
            <div
              key={chat.id}
              className={`flex ${
                chat?.user?.role === "admin" ? "justify-end" : "justify-start"
              } animate-fade-in`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${
                  chat?.user?.role === "admin"
                    ? "bg-gradient-to-br from-black to-gray-800 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {chat?.user?.name}
                  </span>
                  {chat?.user?.role === "admin" && (
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{chat.message}</p>
                <p
                  className={`text-xs mt-2 ${
                    chat?.user?.role === "admin"
                      ? "text-white/60"
                      : "text-gray-400"
                  }`}
                >
                  {new Date(chat.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your response..."
            onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
            onClick={handleSendMessage}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
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
    <div className="h-full">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
      
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Support Tickets</h2>
            <p className="text-gray-500 text-sm mt-1">
              Manage and respond to user support requests
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
          {tickets.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const isSelected = selectedTicketId === ticket.id;
              const status = statusConfig[ticket.status] || statusConfig.open;

              return (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                    isSelected
                      ? "bg-gradient-to-br from-black to-gray-800 text-white border-black shadow-xl scale-105"
                      : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg"
                  }`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold text-sm ${isSelected ? "text-white" : "text-gray-900"}`}>
                      {ticket.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        isSelected ? "bg-white/20 text-white" : status.color
                      }`}
                    >
                      {status.icon}
                      {ticket.status}
                    </span>
                  </div>
                  <p className={`text-xs ${isSelected ? "text-white/70" : "text-gray-500"}`}>
                    {new Date(ticket.created_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
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