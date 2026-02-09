import { useState, useEffect, useRef } from 'react';
import { MessageSquare, CheckCircle2, Clock, Package, MapPin, X, Send, ChevronRight, Phone, XCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socketService';
import api from '../utils/api';
import { saveMessage, getMessages } from '../services/messageService';

const MyRequests = ({ requests, onUpdate }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const chatScrollRef = useRef(null);
  const detailPanelRef = useRef(null);
  const { sendMessage } = useSocket();
  const { user } = useAuth();

  // Auto-scroll to detail panel on mobile when a request is selected
  useEffect(() => {
    if (selectedRequest && detailPanelRef.current && window.innerWidth < 1024) {
      setTimeout(() => {
        detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedRequest]);

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;
    const requestId = selectedRequest.id || selectedRequest._id;
    
    if (!confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      setCancelLoading(true);
      await api.put(`/requests/${requestId}/status`, { status: 'Cancelled' });
      
      // Update local state
      setSelectedRequest(prev => ({ ...prev, status: 'Cancelled' }));
      
      // Notify parent component
      if (onUpdate) onUpdate(requestId, 'Cancelled');
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert(error.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
      if(chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
  }, [chatHistory]);

  const getStatusStep = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Ready for Pickup': return 3;
      case 'Completed': return 4;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
      switch (status) {
        case 'Pending': return 'text-amber-500 bg-amber-50 border-amber-200';
        case 'Confirmed': return 'text-blue-500 bg-blue-50 border-blue-200';
        case 'Ready for Pickup': return 'text-indigo-500 bg-indigo-50 border-indigo-200';
        case 'Completed': return 'text-green-500 bg-green-50 border-green-200';
        case 'Cancelled': return 'text-red-500 bg-red-50 border-red-200';
        default: return 'text-slate-500';
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
        data.requestId === selectedRequest.id || 
        data.requestId === selectedRequest._id ||
        data.requestId?.toString() === selectedRequest.id?.toString() ||
        data.requestId?.toString() === selectedRequest._id?.toString() ||
        data.donationId === selectedRequest.donationId ||
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
    const donationId = selectedRequest.donationId || selectedRequest.donation?._id || selectedRequest.donation?.id;
    const requestId = selectedRequest.id || selectedRequest._id;
    
    // Get donor ID from the request - try multiple paths
    // The request structure from API has donation populated with donor info
    let donorId = selectedRequest.raw?.donation?.donor?._id || 
                  selectedRequest.raw?.donation?.donor?._id?.toString() ||
                  selectedRequest.raw?.donation?.donor?.toString() ||
                  selectedRequest.raw?.donation?.donor ||
                  selectedRequest.donation?.donor?._id ||
                  selectedRequest.donation?.donor;
    
    // If still no donorId, try to fetch the request details to get donor info
    if (!donorId) {
      try {
        const response = await api.get(`/requests/${requestId}`);
        const fullRequest = response.data.data.request;
        donorId = fullRequest.donation?.donor?._id || 
                  fullRequest.donation?.donor?._id?.toString() ||
                  fullRequest.donation?.donor?.toString() ||
                  fullRequest.donation?.donor;
        
        // Update the selectedRequest with the fetched data
        if (donorId && selectedRequest.raw) {
          selectedRequest.raw.donation = fullRequest.donation;
        }
      } catch (err) {
        console.error('Error fetching request details:', err);
      }
    }
    
    if (!donorId) {
      console.error('Donor ID not found in request:', selectedRequest);
      console.log('Full request structure:', JSON.stringify(selectedRequest, null, 2));
      alert('Unable to send message: Donor information not available. Please refresh the page.');
      return;
    }
    
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
      await saveMessage(requestId, messageText, donorId.toString());
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
      
      console.log('Sending message:', { recipientId: donorId.toString(), message: messageText, requestId, donationId });
      sendMessage(donorId.toString(), messageText, requestId, donationId);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
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
      const requestId = selectedRequest.id || selectedRequest._id;
      loadChatHistory(requestId);
    }
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-900">My Requests</h2>
            <p className="text-slate-500 mt-1">Track the status of your donation requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request List */}
        <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {requests.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No requests yet.</p>
              </div>
          ) : (
            requests.map((req) => (
                <div 
                key={req.id}
                onClick={() => {
                  setSelectedRequest(req);
                  setIsChatOpen(false);
                  // Reset chat history when selecting a new request
                  setChatHistory([]);
                }}
                className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md flex items-center gap-4 ${selectedRequest?.id === req.id ? 'border-green-500 ring-1 ring-green-500 shadow-md' : 'border-slate-200'}`}
                >
                <img src={req.imageUrl} alt={req.donationTitle} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{req.donationTitle}</h4>
                    <p className="text-xs text-slate-500 truncate mb-2">From: {req.donorName}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusColor(req.status)}`}>
                        {req.status.toUpperCase()}
                    </span>
                </div>
                <ChevronRight className={`w-5 h-5 ${selectedRequest?.id === req.id ? 'text-green-500' : 'text-slate-300'}`} />
                </div>
            ))
          )}
        </div>

        {/* Detailed View */}
        <div ref={detailPanelRef} className="lg:col-span-2">
            {selectedRequest ? (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden lg:max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Status Header */}
                    <div className="bg-slate-900 text-white p-6 flex-shrink-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold">{selectedRequest.donationTitle}</h3>
                                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {selectedRequest.location?.area || selectedRequest.location?.city || selectedRequest.location}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Request ID</p>
                                <p className="font-mono text-sm">#{selectedRequest.id.slice(-6)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Stepper */}
                    <div className="p-8 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                        <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
                            {(() => {
                                const currentStep = getStatusStep(selectedRequest.status);
                                const safeWidth = Math.max(0, (currentStep - 1)) * 33;
                                return (
                                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 -z-0`} style={{width: `${safeWidth}%`}}></div>
                                );
                            })()}
                            
                            {['Pending', 'Confirmed', 'Ready for Pickup', 'Completed'].map((step, idx) => {
                                const currentStep = getStatusStep(selectedRequest.status);
                                const isCompleted = idx + 1 <= currentStep;
                                
                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center group">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-slate-300'}`}>
                                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                        </div>
                                        <span className={`text-xs font-medium mt-2 absolute -bottom-6 whitespace-nowrap ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center overflow-y-auto">
                        {selectedRequest.status === 'Pending' && (
                             <div className="max-w-md">
                                 <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                                 <h4 className="text-xl font-bold text-slate-900 mb-2">Waiting for Confirmation</h4>
                                 <p className="text-slate-500 mb-6">The donor has received your request. You will be notified once they confirm the availability.</p>
                                 <button
                                   onClick={handleCancelRequest}
                                   disabled={cancelLoading}
                                   className="px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-60"
                                 >
                                   <XCircle className="w-5 h-5" />
                                   {cancelLoading ? 'Cancelling...' : 'Cancel Request'}
                                 </button>
                             </div>
                        )}

                        {(selectedRequest.status === 'Confirmed' || selectedRequest.status === 'Ready for Pickup') && (
                            <div className="w-full max-w-2xl">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                                    <h4 className="font-bold text-green-800 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" /> Request Accepted!
                                    </h4>
                                    <p className="text-green-700 text-sm mt-1">Click the button below to chat with the donor.</p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
                                  {/* Chat Toggle Button */}
                                  <button
                                    onClick={toggleChat}
                                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
                                  >
                                    <MessageSquare className="w-5 h-5" />
                                    {isChatOpen ? 'Close Chat' : 'Chat with Donor'}
                                  </button>
                                  
                                  {/* Cancel Button */}
                                  <button
                                    onClick={handleCancelRequest}
                                    disabled={cancelLoading}
                                    className="px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                  >
                                    <XCircle className="w-5 h-5" />
                                    {cancelLoading ? 'Cancelling...' : 'Cancel'}
                                  </button>
                                </div>

                                {/* Integrated Chat - Only shown when isChatOpen is true */}
                                {isChatOpen && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px] mt-4">
                                    <div className="bg-slate-900 text-white p-3 flex items-center justify-between flex-shrink-0 rounded-t-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
                                                {selectedRequest.donorName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">Chat with {selectedRequest.donorName}</h4>
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
                                                    <div className={`max-w-[75%] rounded-lg p-2 px-3 ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'}`}>
                                                        <p className="text-xs leading-relaxed">{msg.text}</p>
                                                        <span className={`text-[9px] block text-right mt-0.5 ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.time}</span>
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

                        {selectedRequest.status === 'Completed' && (
                            <div className="max-w-md">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package className="w-10 h-10 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Donation Received</h4>
                                <p className="text-slate-500">Thank you for reducing food waste! Enjoy your meal.</p>
                            </div>
                        )}

                        {selectedRequest.status === 'Cancelled' && (
                            <div className="max-w-md">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <XCircle className="w-10 h-10 text-red-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Request Cancelled</h4>
                                <p className="text-slate-500">This request has been cancelled.</p>
                            </div>
                        )}

                        {/* Fallback when status doesn't match known values */}
                        {![ 'Pending', 'Confirmed', 'Ready for Pickup', 'Completed', 'Cancelled' ].includes(selectedRequest.status) && (
                            <div className="max-w-md">
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Request Status</h4>
                                <p className="text-slate-500">Status: {selectedRequest.status || 'Unknown'}</p>
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                    <Clock className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a request to view details</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MyRequests;
