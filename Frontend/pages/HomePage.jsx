import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import DonationCard from '../components/DonationCard';
import AddDonation from '../components/AddDonation';
import MyRequests from '../components/MyRequests';
import MyDonations from '../components/MyDonations';
import DonationRequests from '../components/DonationRequests';
import AIChat from '../components/AIChat';
import EditDonation from '../components/EditDonation';
import { Search, SlidersHorizontal, MapPin, X, Bell } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [currentView, setCurrentView] = useState('home');
  const [donations, setDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDonation, setEditingDonation] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const donationsSectionRef = useRef(null);

  // Fetch donations on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data in parallel but don't block UI rendering
        await Promise.all([
          fetchDonations(),
          fetchMyRequests(),
          user?.role === 'donor' ? Promise.all([fetchMyDonations(), fetchDonationRequests()]) : Promise.resolve()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    if (user) {
      loadData();
    }
  }, [user?.role]);

  const fetchDonations = async () => {
    try {
      const response = await api.get('/donations');
      setDonations(response.data.data.donations || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      showNotification('Failed to load donations', 'error');
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/requests/my');
      const requests = response.data.data.requests || [];
      // Normalize backend shape to UI-friendly shape
      const normalized = requests.map((r) => ({
        id: r._id || r.id,
        donationId: r.donation?._id || r.donation?.id,
        donationTitle: r.donation?.title || r.donationTitle || 'Donation',
        donorName: r.donation?.donorName || r.donorName || 'Donor',
        imageUrl: r.donation?.imageUrl || '',
        location: r.donation?.location || r.location || '',
        status: r.status,
        raw: r
      }));
      setMyRequests(normalized);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchMyDonations = async () => {
    try {
      const response = await api.get('/donations/my/list');
      setMyDonations(response.data.data.donations || []);
    } catch (error) {
      console.error('Error fetching my donations:', error);
    }
  };

  const fetchDonationRequests = async () => {
    try {
      const response = await api.get('/requests/donations');
      const requests = response.data.data.requests || [];
      setDonationRequests(requests);
    } catch (error) {
      console.error('Error fetching donation requests:', error);
    }
  };

  // Reset scroll position when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleAddDonation = async (newDonation) => {
    try {
      const response = await api.post('/donations', newDonation);
      setDonations((prev) => [response.data.data.donation, ...prev]);
      // Refresh my donations to show the new one
      if (user?.role === 'donor') {
        await fetchMyDonations();
      }
      setCurrentView('home');
      showNotification(`Donation posted: ${newDonation.title}`, 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to create donation', 'error');
    }
  };

  const handleEditDonation = async (donationId, updatedData) => {
    try {
      const response = await api.put(`/donations/${donationId}`, updatedData);
      // Update in both lists
      setMyDonations(prev => prev.map(d => 
        (d._id || d.id) === donationId ? response.data.data.donation : d
      ));
      setDonations(prev => prev.map(d => 
        (d._id || d.id) === donationId ? response.data.data.donation : d
      ));
      showNotification('Donation updated successfully', 'success');
      return true;
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update donation', 'error');
      return false;
    }
  };

  const handleDeleteDonation = async (donationId) => {
    try {
      await api.delete(`/donations/${donationId}`);
      setMyDonations(prev => prev.filter(d => (d._id || d.id) !== donationId));
      setDonations(prev => prev.filter(d => (d._id || d.id) !== donationId));
      showNotification('Donation deleted successfully', 'success');
      return true;
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete donation', 'error');
      return false;
    }
  };

  const handleRequestDonation = async (donation) => {
    try {
      await api.post('/requests', {
        donationId: donation._id || donation.id,
        message: 'I would like to request this donation'
      });
      
      await fetchMyRequests();
      showNotification(
        `Request sent to ${donation.donorName}! Track it in 'My Requests'.`,
        'success'
      );
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to create request', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser', 'info');
      return;
    }

    showNotification('Detecting location...', 'info');

    try {
      // Use the location service to get coordinates and reverse geocode
      const { getCurrentLocation } = await import('../services/locationService');
      const location = await getCurrentLocation();
      
      setUserLocation(location.locationString);
      showNotification(`Location detected: ${location.locationString}`, 'success');
    } catch (error) {
      console.error('Location detection error:', error);
      showNotification(error.message || 'Unable to retrieve your location', 'info');
    }
  };

  const scrollToDonations = () => {
    if (donationsSectionRef.current) {
      donationsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredDonations = donations.filter((d) => {
    const title = d.title || '';
    const description = d.description || '';
    const location = d.location?.area || d.location?.city || d.location || '';
    
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());

    // Flexible location matching - check if any word from userLocation exists in donation location
    const matchesLocation = userLocation
      ? (() => {
          const userWords = userLocation.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
          const locationWords = location.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
          // Match if any word from user's location appears in donation location
          return userWords.some(userWord => 
            locationWords.some(locWord => 
              locWord.includes(userWord) || userWord.includes(locWord)
            )
          );
        })()
      : true;

    return matchesSearch && matchesLocation;
  });

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero
              onCtaClick={() => {
                if (user?.role === 'donor' || user?.role === 'admin') {
                  setCurrentView('donate');
                } else {
                  showNotification('Only donors can post donations', 'info');
                }
              }}
              onFindFoodClick={scrollToDonations}
            />

            <div
              ref={donationsSectionRef}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1"
            >
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Recent Donations
                  </h2>
                  {userLocation && (
                    <button
                      onClick={() => setUserLocation('')}
                      className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear location filter (
                      {userLocation})
                    </button>
                  )}
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for food items..."
                      className="pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent w-full outline-none placeholder-slate-400"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                      placeholder="Filter by location..."
                      className="pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent w-full outline-none placeholder-slate-400"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <button
                      onClick={handleDetectLocation}
                      className="absolute right-2 top-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 rounded-md transition-colors"
                    >
                      Auto Detect
                    </button>
                  </div>

                  <button className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>
                </div>
              </div>

              {filteredDonations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredDonations.map((d) => {
                    const isMyDonation = user?.role === 'donor' && myDonations.some(md => (md._id || md.id) === (d._id || d.id));
                    return (
                      <DonationCard
                        key={d._id || d.id}
                        donation={d}
                        onRequest={handleRequestDonation}
                        onEdit={(donation) => {
                          setCurrentView('edit-donation');
                          setEditingDonation(donation);
                        }}
                        onDelete={async (donation) => {
                          await handleDeleteDonation(donation._id || donation.id);
                        }}
                        isDonorOwned={isMyDonation}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-500">
                    No donations found nearby matching your criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setUserLocation('');
                    }}
                    className="text-green-600 font-medium mt-2 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </>
        );
      case 'donate':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex-1 flex flex-col">
            <AddDonation
              onCancel={() => setCurrentView('home')}
              onSubmit={handleAddDonation}
            />
          </div>
        );
      case 'my-donations':
        return (
          <div className="flex-1 flex flex-col h-full w-full">
            <MyDonations 
              donations={myDonations}
              onEdit={(donation) => {
                setCurrentView('edit-donation');
                setEditingDonation(donation);
              }}
              onDelete={(donationId) => handleDeleteDonation(donationId)}
              onRefresh={() => fetchMyDonations()}
            />
          </div>
        );
      case 'edit-donation':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex-1 flex flex-col">
            <EditDonation
              donation={editingDonation}
              onCancel={() => {
                setCurrentView('my-donations');
                setEditingDonation(null);
              }}
              onSubmit={handleEditDonation}
            />
          </div>
        );
      case 'donation-requests':
        return (
          <div className="flex-1 flex flex-col h-full w-full">
            <DonationRequests
              requests={donationRequests}
              onUpdate={(id, status) => {
                // Update local state immediately for instant UI update
                setDonationRequests(prev => prev.map(r => {
                  const rid = r._id || r.id;
                  if (rid === id || (r.raw && (r.raw._id === id || r.raw.id === id))) {
                    return { ...r, status };
                  }
                  return r;
                }));
                // Refresh data in background (non-blocking)
                fetchDonationRequests();
                fetchMyDonations();
                fetchDonations();
                fetchMyRequests();
              }}
            />
          </div>
        );
      case 'requests':
        return (
          <div className="flex-1 flex flex-col h-full w-full">
            <MyRequests 
              requests={myRequests}
              onRefresh={() => fetchMyRequests()}
            />
          </div>
        );
      case 'chat':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex-1 flex flex-col">
            <AIChat donations={donations} />
          </div>
        );
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        requestCount={user?.role === 'donor' ? donationRequests.length : myRequests.length}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-4 z-[100] animate-[slideIn_0.3s_ease-out]">
          <div
            className={`shadow-lg rounded-lg p-4 flex items-center gap-3 max-w-sm border-l-4 ${
              notification.type === 'success'
                ? 'bg-white border-green-500'
                : notification.type === 'error'
                ? 'bg-white border-red-500'
                : 'bg-white border-blue-500'
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                notification.type === 'success'
                  ? 'bg-green-100 text-green-600'
                  : notification.type === 'error'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {notification.type === 'success' ? (
                <Bell className="w-4 h-4" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                {notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Info'}
              </h4>
              <p className="text-sm text-slate-600 leading-snug">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="main-content flex-1 flex flex-col w-full">
        {renderContent()}
      </div>

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
              <li className="hover:text-white cursor-pointer">
                Food Safety Guidelines
              </li>
              <li className="hover:text-white cursor-pointer">My Requests</li>
              <li className="hover:text-white cursor-pointer">
                Community Blog
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">
                Privacy Policy
              </li>
              <li className="hover:text-white cursor-pointer">
                Terms of Service
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          &copy; {new Date().getFullYear()} SharePlate Inc. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

