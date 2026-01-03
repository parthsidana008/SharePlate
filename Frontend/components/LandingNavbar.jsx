import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingNavbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center cursor-pointer">
            <div className="bg-green-600 p-2 rounded-lg mr-2">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">SharePlate</span>
          </Link>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 bg-white text-slate-700 border border-slate-300 rounded-full font-medium hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                to="/home"
                className="px-6 py-2 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;

