import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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