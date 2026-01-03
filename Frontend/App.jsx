import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';

const App = () => {
  const { login } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          <Login onLogin={login} />
        } 
      />
      <Route 
        path="/register" 
        element={
          <Register onLogin={login} />
        } 
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
