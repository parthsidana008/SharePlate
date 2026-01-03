import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Heart, MessageCircle, Clock, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ currentView, setView, requestCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'home', label: 'Browse Food', icon: <Utensils className="w-4 h-4" /> },
    // Donors and admins can post donations and manage their donations
    ...(user?.role === 'donor' || user?.role === 'admin'
      ? [
          { id: 'donate', label: 'Donate Now', icon: <Heart className="w-4 h-4" /> },
          { id: 'my-donations', label: 'My Donations', icon: <Heart className="w-4 h-4" /> },
          // Donor-only: view donation requests from recipients
          { id: 'donation-requests', label: 'Donation Requests', icon: <MessageCircle className="w-4 h-4" /> }
        ]
      : []),
    // Recipients see My Requests
    ...(user?.role !== 'donor' && user?.role !== 'admin' ? [{ id: 'requests', label: 'My Requests', icon: <Clock className="w-4 h-4" /> }] : []),
    { id: 'chat', label: 'Support Bot', icon: <MessageCircle className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
            <div className="bg-green-600 p-2 rounded-lg mr-2">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">SharePlate</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                  currentView === item.id
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {(item.id === 'requests' || item.id === 'donation-requests') && requestCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        {requestCount}
                    </span>
                )}
              </button>
            ))}
            {user ? (
              <div className="ml-4 flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="ml-4 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-700 focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-3 py-3 rounded-md text-base font-medium ${
                  currentView === item.id
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

