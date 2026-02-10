import axios from 'axios';

// Get API URL from environment, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Ensure the API URL ends with /api
const baseURL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

console.log('API Base URL:', baseURL);

// Create axios instance - longer timeout for Render free tier cold starts (can take 50+ seconds)
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 90000 // 90 seconds for Render cold starts
});

// Retry configuration for handling cold starts
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000;

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.__retryCount = config.__retryCount || 0;
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors with retry logic for timeouts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry on timeout or network errors (Render cold start issues)
    if (
      (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) &&
      config &&
      config.__retryCount < MAX_RETRIES
    ) {
      config.__retryCount += 1;
      console.log(`Request timeout, retrying (${config.__retryCount}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return api(config);
    }
    
    console.error('API Error:', error.response?.status, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;




