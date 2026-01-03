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
    </div>
  );
};

export default LandingPage;

