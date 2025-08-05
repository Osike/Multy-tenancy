import axios, { AxiosInstance, AxiosError } from 'axios';

// Create API instance with fallback for undefined process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      throw new Error('Network error. Please check your connection and try again.');
    }

    // Handle other HTTP errors
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    throw new Error(errorMessage);
  }
);

// API methods
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    fullName: string;
    phoneNumber?: string;
    companyId?: string;
    companyName?: string;
    contactEmail?: string;
    licenseNumber?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const companiesAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await api.get('/companies', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  create: async (companyData: any) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  update: async (id: string, companyData: any) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};

export default api;