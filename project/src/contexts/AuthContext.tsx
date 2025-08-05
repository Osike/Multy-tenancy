import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Create API instance with fallback for undefined process.env
const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) 
  ? process.env.REACT_APP_API_URL 
  : 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Making API request:', { url: config.url, hasToken: !!token }); // Debug log
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API response:', { url: response.config.url, status: response.status }); // Debug log
    return response;
  },
  (error) => {
    console.error('API error:', error.response?.status, error.response?.data);
    // Comment out auto-redirect for now to avoid login issues
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('token');
    //   localStorage.removeItem('user');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

interface User {
   id: string;
  _id: string;
  name: string;
  fullName?: string; // Add this
  email: string;
  role: 'super_admin' | 'company_admin' | 'dispatcher' | 'driver';
  companyId?: {
    _id: string;
    companyName: string;
    status: string;
  } | string; // Can be either object or string
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // MOCK USER - Comment this section out when you want real authentication
  const mockToken = 'mock-jwt-token-super-admin';
  localStorage.setItem('token', mockToken);
  
  const mockUser = {
    id: 'super-user-123',
    _id: 'super-user-123',
    name: 'Super Admin User',
    fullName: 'Super Admin User', // Add fullName for Layout.tsx
    email: 'superadmin@system.com',
    role: 'super_admin' as const,
    companyId: {
      _id: 'system-company',
      companyName: 'System Administration',
      status: 'Active'
    }
  };
  
  localStorage.setItem('user', JSON.stringify(mockUser));
  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState(false); // Set to false to skip loading
  
  // REAL USER STATE - Uncomment when you want real authentication
  // const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SKIP AUTH CHECK - Comment this out when using mock user
    setLoading(false);
    
    // REAL AUTH CHECK - Uncomment when you want real authentication
    // const token = localStorage.getItem('token');
    // const savedUser = localStorage.getItem('user');
    
    // if (token && savedUser) {
    //   try {
    //     setUser(JSON.parse(savedUser));
    //   } catch (error) {
    //     console.error('Error parsing saved user:', error);
    //     localStorage.removeItem('token');
    //     localStorage.removeItem('user');
    //   }
    // }
    // setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // MOCK LOGIN - Comment this out when you want real authentication
      console.log('Mock login for:', email);
      
      // Generate a mock token and store it
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      
      const mockUser = {
        id: 'mock-user-123',
        _id: 'mock-user-123',
        name: 'Mock Admin User',
        email: email,
        role: 'super_admin' as const, // Change to super_admin for company management
        companyId: 'mock-company-123',
        companyName: 'Mock Company'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
      return;
      
      // REAL LOGIN - Uncomment when you want real authentication
      // const response = await api.post('/auth/login', { email, password });
      
      // if (response.data.success) {
      //   const { token, user: userData } = response.data.data;
        
      //   localStorage.setItem('token', token);
      //   localStorage.setItem('user', JSON.stringify(userData));
      //   setUser(userData);
      // } else {
      //   throw new Error(response.data.message || 'Login failed');
      // }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      setLoading(true);
      
      // MOCK REGISTER - Comment this out when you want real authentication
      console.log('Mock register for:', userData.email);
      setUser({
        id: 'mock-user-123',
        _id: 'mock-user-123',
        name: userData.name || 'Mock User',
        email: userData.email,
        role: userData.role || 'company_admin',
        companyId: 'mock-company-123',
        companyName: 'Mock Company'
      });
      setLoading(false);
      return;
      
      // REAL REGISTER - Uncomment when you want real authentication
      // const response = await api.post('/auth/register', userData);
      
      // if (response.data.success) {
      //   const { token, user: newUser } = response.data.data;
        
      //   localStorage.setItem('token', token);
      //   localStorage.setItem('user', JSON.stringify(newUser));
      //   setUser(newUser);
      // } else {
      //   throw new Error(response.data.message || 'Registration failed');
      // }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the api instance so other components can use it
export default api;
