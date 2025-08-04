import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/authSlice';

// Configuration that works with Vite proxy for local development and for environment variables
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '';
  }

  // Check for environment-specific API URL first
  if (import.meta.env.VITE_API_URL) {
    console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback based on current hostname
  const hostname = window.location.hostname;
  console.log('Current hostname:', hostname);
  
  if (hostname.includes('staging')) {
    console.log('Detected staging environment, using staging backend');
    return 'https://bookhub-staging-backend-9r7f.azurewebsites.net';
  }
  
  console.log('Using production backend as fallback');
  return 'https://bookhub-backend-9r7f.azurewebsites.net';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details for debugging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      environment: import.meta.env.VITE_ENVIRONMENT || (import.meta.env.DEV ? 'development' : 'production'),
      viteApiUrl: import.meta.env.VITE_API_URL,
      hostname: window.location.hostname
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      store.dispatch(logout());
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;