import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  _id: string;
  name: string;
  fullName?: string;
  email: string;
  username: string;
  role: 'super_admin' | 'company_admin' | 'dispatcher' | 'driver';
  companyId?: {
    _id: string;
    companyName: string;
    status: string;
  } | string;
  isActive: boolean;
  phoneNumber?: string;
  licenseNumber?: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Parse saved user
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Verify token with backend
          const response = await api.get('/auth/me');
          if (response.data.success) {
            const { user: freshUser } = response.data.data;
            // Update user data with fresh data from server
            localStorage.setItem('user', JSON.stringify(freshUser));
            setUser(freshUser);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Clear invalid token/user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    fullName: string;
    phoneNumber?: string;
    companyId?: string;
    licenseNumber?: string;
    companyName?: string;
    contactEmail?: string;
  }): Promise<void> => {
    try {
      setLoading(true);
      
      // For company_admin registration, we need to create a company first if companyName is provided
      let finalUserData = { ...userData };
      
      if (userData.role === 'company_admin' && userData.companyName && !userData.companyId) {
        // Create company first
        const companyResponse = await api.post('/companies', {
          companyName: userData.companyName,
          contactEmail: userData.contactEmail || userData.email,
          status: 'Active'
        });
        
        if (companyResponse.data.success) {
          finalUserData.companyId = companyResponse.data.data._id;
        }
      }
      
      // Remove company-specific fields that aren't part of user registration
      const { companyName, contactEmail, ...userRegistrationData } = finalUserData;
      
      const response = await api.post('/auth/register', userRegistrationData);
      
      if (response.data.success) {
        const { token, user: newUser } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
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
