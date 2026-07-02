import React, { createContext, useState, useEffect, useContext } from 'react';
import API, { handleLogout } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: loggedUser } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setUser(loggedUser);
      return { success: true, user: loggedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      const code = error.response?.data?.code || null;
      return { success: false, message, code };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return { 
        success: true, 
        message: response.data.message,
        data: response.data.data 
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await API.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.error('Logout request failed:', e);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const updateUserProfile = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
