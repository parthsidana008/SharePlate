import { useState, useEffect, useRef } from 'react';
import { Phone, CheckCircle2, X, MessageSquare, Package, MapPin, Clock, User, Send, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socketService';
import { saveMessage, getMessages } from '../services/messageService';

const DonationRequests = ({ requests = [], onUpdate }) => {
  const [loadingIds, setLoadingIds] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatScrollRef = useRef(null);
  const { sendMessage } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const setLoading = (id, v) => setLoadingIds(prev => v ? [...prev, id] : prev.filter(x => x !== id));

  const updateStatus = async (requestId, status) => {
    try {
      setLoading(requestId, true);
      await api.put(`/requests/${requestId}/status`, { status });
      
      // Update selectedRequest immediately with new status
      if (selectedRequest && (selectedRequest._id === requestId || selectedRequest.id === requestId || selectedRequest.raw?._id === requestId || selectedRequest.raw?.id === requestId)) {
        setSelectedRequest(prev => ({ 
          ...prev, 
          status, 
          raw: prev.raw ? { ...prev.raw, status } : undefined 
        }));
      }
      
      if (onUpdate) onUpdate(requestId, status);
    } catch (err) {
      console.error('Error updating request status', err);
      alert(err.response?.data?.message || 'Failed to update request');
    } finally {
      setLoading(requestId, false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ready for Pickup': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Listen for incoming messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !socket.connected) {
      console.log('Socket not connected');
      return;
    }

    const handleReceiveMessage = (data) => {
      console.log('Received message:', data);
      if (selectedRequest && (
        data.requestId === selectedRequest._id || 
        data.requestId === selectedRequest.id ||
        data.requestId?.toString() === selectedRequest._id?.toString() ||
        data.requestId?.toString() === selectedRequest.id?.toString() ||
        data.donationId === selectedRequest.donation?._id ||
        data.donationId === selectedRequest.donationId ||
        data.donationId?.toString() === selectedRequest.donation?._id?.toString() ||
        data.donationId?.toString() === selectedRequest.donationId?.toString()
      )) {
        console.log('Message matches current request, adding to chat history');
        setChatHistory(prev => [...prev, {
          sender: 'them',
          text: data.message,
          time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        console.log('Message does not match current request', { data, selectedRequest });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedRequest]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedRequest) return;
    
    const messageText = chatMessage;
    const donationId = selectedRequest.donation?._id || selectedRequest.donationId;
    const requestId = selectedRequest._id || selectedRequest.id;
    
    // Get recipient ID from the request
    const recipientId = selectedRequest.recipient?._id || selectedRequest.recipient || selectedRequest.raw?.recipient?._id;
    
    if (recipientId) {
      // Add message to local history immediately
      const newMessage = {
        sender: 'me',
        text: messageText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, newMessage]);
      setChatMessage('');
      
      // Save to backend
      try {
        await saveMessage(requestId, messageText, recipientId.toString());
      } catch (error) {
        console.error('Error saving message to backend:', error);
      }
      
      // Send via WebSocket
      try {
        const socket = getSocket();
        if (!socket || !socket.connected) {
          alert('WebSocket not connected. Please refresh the page.');
          return;
        }
        
        console.log('Sending message:', { recipientId: recipientId.toString(), message: messageText, requestId, donationId });
        sendMessage(recipientId.toString(), messageText, requestId, donationId);
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const handleRequestSelect = (req) => {
    setSelectedRequest(req);
    setIsChatOpen(false);
    // Reset chat history when selecting a new request
    setChatHistory([]);
  };

  const loadChatHistory = async (requestId) => {
    setLoadingMessages(true);
    try {
      const messages = await getMessages(requestId);
      // Convert backend messages to chat history format
      const userId = user._id || user.id;
      const formattedMessages = messages.map(msg => ({
        sender: msg.sender._id.toString() === userId.toString() ? 'me' : 'them',
        text: msg.message,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setChatHistory(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const toggleChat = () => {
    if (!isChatOpen && selectedRequest) {
      const requestId = selectedRequest._id || selectedRequest.id || selectedRequest.raw?._id || selectedRequest.raw?.id;
      loadChatHistory(requestId);
    }
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Donation Requests</h2>
          <p className="text-slate-500 mt-1">Manage requests from recipients for your donations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request List */}
        <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {requests.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No requests yet.</p>
              <p className="text-sm text-slate-400 mt-1">Requests will appear here when recipients request your donations.</p>
            </div>
          ) : (
            requests.map((r) => {
              const id = r._id || r.id || r.raw?._id || r.raw?.id;
              const status = r.status || r.raw?.status;
              const imgSrc = r.donation?.imageUrl || r.imageUrl || r.raw?.donation?.imageUrl || 'https://via.placeholder.com/150?text=No+Image';
              const title = r.donation?.title || r.donationTitle || 'Donation';
              const recipientName = r.recipient?.name || r.recipientName || r.raw?.recipient?.name || 'Recipient';
              const isSelected = selectedRequest && (selectedRequest._id === id || selectedRequest.id === id || selectedRequest.raw?._id === id || selectedRequest.raw?.id === id);

              return (
                <div
                  key={id || Math.random()}
                  onClick={() => handleRequestSelect(r)}
                  className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md flex items-center gap-4 ${
                    isSelected ? 'border-green-500 ring-1 ring-green-500 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <img src={imgSrc} alt={title} className="w-16 h-16 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{title}</h4>
                    <p className="text-xs text-slate-500 truncate mb-2">From: {recipientName}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusColor(status)}`}>
                      {status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-green-500' : 'text-slate-300'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
              <>
                  {/* Header */}
                  <div className="bg-slate-900 text-white p-6 flex-shrink-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold">{selectedRequest.donation?.title || selectedRequest.donationTitle || 'Donation'}</h3>
                        <div className="flex items-center gap-4 text-slate-400 text-sm mt-2">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {selectedRequest.recipient?.name || selectedRequest.recipientName || selectedRequest.raw?.recipient?.name || 'Recipient'}
                          </div>
                          {(selectedRequest.donation?.location || selectedRequest.location) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {selectedRequest.donation?.location?.area || selectedRequest.donation?.location?.city || selectedRequest.location?.area || selectedRequest.location?.city || selectedRequest.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Request ID</p>
                        <p className="font-mono text-sm">#{(selectedRequest._id || selectedRequest.id || selectedRequest.raw?._id || selectedRequest.raw?.id || '').slice(-6)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`px-4 py-2 rounded-full font-bold text-sm border ${getStatusColor(selectedRequest.status || selectedRequest.raw?.status)}`}>
                          {(selectedRequest.status || selectedRequest.raw?.status || 'UNKNOWN').toUpperCase()}
                        </span>
                      </div>
                      {(selectedRequest.status === 'Pending' || selectedRequest.raw?.status === 'Pending') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(selectedRequest._id || selectedRequest.id || selectedRequest.raw?._id || selectedRequest.raw?.id, 'Confirmed')}
                            disabled={loadingIds.includes(selectedRequest._id || selectedRequest.id || selectedRequest.raw?._id || selectedRequest.raw?.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(selectedRequest._id || selectedRequest.id || selectedRequest.raw?._id || selectedRequest.raw?.id, 'Cancelled')}
                            disabled={loadingIds.includes(selectedRequest._id || selectedRequest.id || selectedRequest.raw?._id || selectedRequest.raw?.id)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-6 flex flex-col items-center justify-center text-center overflow-y-auto">
                    {(selectedRequest.status === 'Confirmed' || selectedRequest.status === 'Ready for Pickup' || selectedRequest.raw?.status === 'Confirmed' || selectedRequest.raw?.status === 'Ready for Pickup') && (
                      <div className="w-full max-w-2xl">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                          <h4 className="font-bold text-green-800 flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Request Accepted!
                          </h4>
                          <p className="text-green-700 text-sm mt-1">Click the button below to chat with the recipient.</p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
                          {/* Chat Toggle Button */}
                          <button
                            onClick={toggleChat}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
                          >
                            <MessageSquare className="w-5 h-5" />
                            {isChatOpen ? 'Close Chat' : 'Chat with Recipient'}
                          </button>
                          
                          {/* Cancel Button */}
                          <button
                            onClick={() => updateStatus(selectedRequest._id || selectedRequest.id || selectedRequest.raw?._id || selectedRequest.raw?.id, 'Cancelled')}
                            disabled={loadingIds.includes(selectedRequest._id || selectedRequest.id || selectedRequest.raw?._id || selectedRequest.raw?.id)}
                            className="px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            <X className="w-5 h-5" />
                            Cancel Donation
                          </button>
                        </div>

                        {/* Integrated Chat - Only shown when isChatOpen is true */}
                        {isChatOpen && (
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px] mt-4">
                            <div className="bg-slate-900 text-white p-3 flex items-center justify-between flex-shrink-0 rounded-t-xl">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
                                  {(selectedRequest.recipient?.name || selectedRequest.recipientName || selectedRequest.raw?.recipient?.name || 'R').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm">Chat with {selectedRequest.recipient?.name || selectedRequest.recipientName || selectedRequest.raw?.recipient?.name || 'Recipient'}</h4>
                                  <span className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1 h-1 bg-green-400 rounded-full"></span> Online</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1 bg-slate-50 p-3 overflow-y-auto space-y-2 min-h-0" ref={chatScrollRef}>
                              {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-center text-slate-400">
                                    <p className="text-xs">Loading messages...</p>
                                  </div>
                                </div>
                              ) : chatHistory.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-center text-slate-400">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">No messages yet. Start the conversation!</p>
                                  </div>
                                </div>
                              ) : (
                                chatHistory.map((msg, idx) => (
                                  <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-lg p-2 px-3 ${
                                      msg.sender === 'me' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                                    }`}>
                                      <p className="text-xs leading-relaxed">{msg.text}</p>
                                      <span className={`text-[9px] block text-right mt-0.5 ${
                                        msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'
                                      }`}>
                                        {msg.time}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0 rounded-b-xl">
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={chatMessage}
                                  onChange={(e) => setChatMessage(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                  placeholder="Type a message..."
                                  className="flex-1 bg-slate-100 border-none rounded-full px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                                />
                                <button 
                                  onClick={handleSendMessage}
                                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(selectedRequest.status === 'Pending' || selectedRequest.raw?.status === 'Pending') && (
                      <div className="max-w-md">
                        <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Pending Approval</h4>
                        <p className="text-slate-500">Review the request and accept or decline it.</p>
                        {selectedRequest.message && (
                          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left">
                            <p className="text-sm font-medium text-slate-700 mb-1">Message from recipient:</p>
                            <p className="text-slate-600">{selectedRequest.message || selectedRequest.raw?.message}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(selectedRequest.status === 'Completed' || selectedRequest.raw?.status === 'Completed') && (
                      <div className="max-w-md">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Package className="w-10 h-10 text-green-600" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Donation Completed</h4>
                        <p className="text-slate-500">The recipient has successfully collected the donation. Thank you for making a difference!</p>
                      </div>
                    )}

                    {(selectedRequest.status === 'Cancelled' || selectedRequest.raw?.status === 'Cancelled') && (
                      <div className="max-w-md">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <X className="w-10 h-10 text-red-600" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Donation Cancelled</h4>
                        <p className="text-slate-500">This donation request has been cancelled.</p>
                      </div>
                    )}
                  </div>
                </>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 min-h-[400px]">
              <Package className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationRequests;
