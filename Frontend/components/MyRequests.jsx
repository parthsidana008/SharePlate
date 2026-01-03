import { useState, useEffect, useRef } from 'react';
import { MessageSquare, CheckCircle2, Clock, Package, MapPin, X, Send, ChevronRight, Phone } from 'lucide-react';

const MyRequests = ({ requests }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
      {sender: 'them', text: 'Hi! Thanks for requesting. When can you pick it up?', time: '10:30 AM'}
  ]);
  const chatScrollRef = useRef(null);

  useEffect(() => {
      if(isChatOpen && chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
  }, [chatHistory, isChatOpen]);

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
        default: return 'text-slate-500';
      }
  };

  const handleSendMessage = () => {
      if (!chatMessage.trim()) return;
      setChatHistory([...chatHistory, {sender: 'me', text: chatMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]);
      setChatMessage('');
      
      // Simulating reply
      setTimeout(() => {
          setChatHistory(prev => [...prev, {sender: 'them', text: "That works for me. See you then!", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]);
      }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col flex-1 w-full">
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
            <h2 className="text-3xl font-bold text-slate-900">My Requests</h2>
            <p className="text-slate-500 mt-1">Track the status of your donation requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Request List */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {requests.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No requests yet.</p>
              </div>
          ) : (
            requests.map((req) => (
                <div 
                key={req.id}
                onClick={() => {setSelectedRequest(req); setIsChatOpen(false);}}
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
        <div className="lg:col-span-2 h-full">
            {selectedRequest ? (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden h-full flex flex-col relative">
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
                                 <p className="text-slate-500">The donor has received your request. You will be notified once they confirm the availability.</p>
                             </div>
                        )}

                        {(selectedRequest.status === 'Confirmed' || selectedRequest.status === 'Ready for Pickup') && (
                            <div className="w-full max-w-md space-y-4">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                                    <h4 className="font-bold text-green-800 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" /> Request Accepted!
                                    </h4>
                                    <p className="text-green-700 text-sm mt-1">Please coordinate the pickup time with the donor.</p>
                                </div>
                                
                                <button 
                                    onClick={() => setIsChatOpen(true)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    Chat with {selectedRequest.donorName}
                                </button>
                                <button className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <Phone className="w-5 h-5" />
                                    Call Donor
                                </button>
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

                        {/* Fallback when status doesn't match known values */}
                        {![ 'Pending', 'Confirmed', 'Ready for Pickup', 'Completed' ].includes(selectedRequest.status) && (
                            <div className="max-w-md">
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Request Status</h4>
                                <p className="text-slate-500">Status: {selectedRequest.status || 'Unknown'}</p>
                            </div>
                        )}
                    </div>

                    {/* Chat Overlay */}
                    {isChatOpen && (
                        <div className="absolute inset-0 bg-white z-20 flex flex-col animate-[slideUp_0.3s_ease-out]">
                             <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md flex-shrink-0">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                                         {selectedRequest.donorName.charAt(0)}
                                     </div>
                                     <div>
                                         <h4 className="font-bold">{selectedRequest.donorName}</h4>
                                         <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online</span>
                                     </div>
                                 </div>
                                 <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                                     <X className="w-5 h-5" />
                                 </button>
                             </div>
                             
                             <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4" ref={chatScrollRef}>
                                 {chatHistory.map((msg, idx) => (
                                     <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                         <div className={`max-w-[80%] rounded-2xl p-3 px-4 ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'}`}>
                                             <p className="text-sm">{msg.text}</p>
                                             <span className={`text-[10px] block text-right mt-1 ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.time}</span>
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

