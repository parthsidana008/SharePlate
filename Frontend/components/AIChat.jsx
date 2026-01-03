import { useState, useEffect, useRef } from 'react';
import { chatWithAssistant } from '../services/geminiService';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const AIChat = ({ donations }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'model',
      text: "Hi! I'm PlateBot. How can I help you today? Ask me about donating safely or finding food nearby.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    // Use 'nearest' block to prevent aggressive window scrolling if the element is already visible in the container
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Create a string representation of available donations for context
    const donationContext = donations.map(d => {
      const loc = d.location?.area || d.location?.city || d.location || 'Unknown location';
      return `- Item: ${d.title} (${d.type}), Location: ${loc}, Quantity: ${d.quantity}, Donor: ${d.donorName}`;
    }).join('\n');

    const responseText = await chatWithAssistant(history, userMsg.text, donationContext);

    const botMsg = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-4 h-full">
      <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
            <Bot className="w-6 h-6" />
        </div>
        <div>
            <h2 className="font-bold">SharePlate Support</h2>
            <p className="text-indigo-200 text-xs">Always here to help.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-indigo-600" />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start w-full">
             <div className="flex max-w-[80%] gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border border-slate-300 rounded-full px-4 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

