import { useState, useEffect, useRef } from 'react';
import { Phone, CheckCircle2, X, MessageSquare, Package, MapPin, Clock, User, Send, ChevronRight } from 'lucide-react';
import api from '../utils/api';

const DonationRequests = ({ requests = [], onUpdate }) => {
  const [loadingIds, setLoadingIds] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (isChatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatOpen]);

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

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMessage = {
      sender: 'me',
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory([...chatHistory, newMessage]);
    setChatMessage('');
    
    // Simulating reply
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        sender: 'them',
        text: "Thanks for the update! I'll be there soon.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleRequestSelect = (req) => {
    setSelectedRequest(req);
    setIsChatOpen(false);
    // Initialize chat history for this request
    setChatHistory([
      {
        sender: 'them',
        text: req.message || 'Hi! I would like to request this donation.',
        time: '10:30 AM'
      }
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Donation Requests</h2>
          <p className="text-slate-500 mt-1">Manage requests from recipients for your donations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Request List */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
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
        <div className="lg:col-span-2 h-full">
          {selectedRequest ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden h-full flex flex-col relative">
              {/* Chat Overlay - Positioned relative to entire card */}
              {isChatOpen && (
                <div className="absolute inset-0 bg-white z-30 flex flex-col h-full w-full animate-[slideUp_0.3s_ease-out]">
                    <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                          {(selectedRequest.recipient?.name || selectedRequest.recipientName || selectedRequest.raw?.recipient?.name || 'R').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold">{selectedRequest.recipient?.name || selectedRequest.recipientName || selectedRequest.raw?.recipient?.name || 'Recipient'}</h4>
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4 min-h-0" ref={chatScrollRef}>
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-3 px-4 ${
                            msg.sender === 'me' 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                            <span className={`text-[10px] block text-right mt-1 ${
                              msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'
                            }`}>
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 bg-slate-100 border-none rounded-full px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                        />
                        <button 
                          onClick={handleSendMessage}
                          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                </div>
              )}

              {/* Regular Content - Only show when chat is closed */}
              {!isChatOpen && (
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
                      <div className="w-full max-w-md space-y-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                          <h4 className="font-bold text-green-800 flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Request Accepted!
                          </h4>
                          <p className="text-green-700 text-sm mt-1">You can now chat with the recipient to coordinate pickup.</p>
                        </div>
                        
                        <button 
                          onClick={() => setIsChatOpen(true)}
                          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-5 h-5" />
                          Chat with {selectedRequest.recipient?.name || selectedRequest.recipientName || selectedRequest.raw?.recipient?.name || 'Recipient'}
                        </button>
                        <button className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                          <Phone className="w-5 h-5" />
                          Call Recipient
                        </button>
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
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
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
