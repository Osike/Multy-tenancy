import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../utils/api';

interface User {
  _id: string;
  id: string;
  name: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  companyId?: {
    _id: string;
    companyName: string;
    status: string;
    subscriptionPlan?: string;
  };
  phoneNumber?: string;
  licenseNumber?: string;
  isActive: boolean;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
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

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Parse saved user data
          const parsedUser = JSON.parse(savedUser);
          
          // Verify token is still valid by fetching current user
          const response = await authAPI.getMe();
          
          if (response.success) {
            const userData = response.data.user;
            const normalizedUser = normalizeUserData(userData);
            setUser(normalizedUser);
            
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(normalizedUser));
          } else {
            // Token is invalid, clear storage
            clearAuthData();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const normalizeUserData = (userData: any): User => {
    return {
      _id: userData._id,
      id: userData._id, // For backward compatibility
      name: userData.fullName || userData.name,
      fullName: userData.fullName,
      email: userData.email,
      username: userData.username,
      role: userData.role,
      companyId: userData.companyId,
      phoneNumber: userData.phoneNumber,
      licenseNumber: userData.licenseNumber,
      isActive: userData.isActive,
      lastLogin: userData.lastLogin,
    };
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        
        // Normalize and store user data
        const normalizedUser = normalizeUserData(userData);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      clearAuthData();
      
      // Extract error message
      let errorMessage = 'Login failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { token, user: newUserData } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        
        // Normalize and store user data
        const normalizedUser = normalizeUserData(newUserData);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      clearAuthData();
      
      // Extract error message
      let errorMessage = 'Registration failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getMe();
      
      if (response.success) {
        const normalizedUser = normalizeUserData(response.data.user);
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Don't clear auth data on refresh failure, just log the error
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint to invalidate token on server
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      clearAuthData();
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default authAPI;