import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/Hero';
import LandingNavbar from '../components/LandingNavbar';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/register');
    }
  };

  const handleFindFoodClick = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <LandingNavbar />
      
      {/* Main content wrapper - grows to push footer down */}
      <main className="flex-1">
        <Hero onCtaClick={handleCtaClick} onFindFoodClick={handleFindFoodClick} />
        
        {/* Additional landing page content can go here */}
        <div className="bg-white py-12 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link
                  to="/home"
                  className="px-8 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">SharePlate</h3>
            <p className="text-sm leading-relaxed">
              Connecting communities through food. Join us in our mission to
              zero hunger and zero waste.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">Browse Food</li>
              <li className="hover:text-white cursor-pointer">Donate</li>
              <li className="hover:text-white cursor-pointer">NGO Partners</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">Food Safety Guidelines</li>
              <li className="hover:text-white cursor-pointer">My Requests</li>
              <li className="hover:text-white cursor-pointer">Community Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer">Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          &copy; {new Date().getFullYear()} SharePlate Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

