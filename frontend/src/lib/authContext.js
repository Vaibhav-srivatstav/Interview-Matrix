'use client';

import { createContext, useContext, useEffect, useState } from 'react';
// Import only what you need from your central api file
import api, { getMe, logoutUser } from '@/lib/api';
import { useRouter } from 'next/navigation';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /**
   * Check session on app load
   */
  const checkAuth = async () => {
     if (localStorage.getItem('isLoggedIn') !== 'true') {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return;
    }
    try {
      const res = await getMe();
      const userData = res.data.user;

      setUser(userData);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (err) {
      // Don't log error for 401 as it's expected when not logged in
      if (err.response?.status !== 401) {
        console.error('Auth check failed:', err);
      }
      setUser(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.clear();
      return null;
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * LOGIN (Manual Email/Password)
   */
  const login = async (email, password) => {
    try {
      // 1. One single call to login
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");

      const res = await api.post('/auth/login', { email, password });
      const userData = res.data.user;

      // 2. Set state immediately from the login response
      setUser(userData);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (err) {
      console.error('Login error response:', err.response?.data);
      const message = err.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  /**
   * GOOGLE LOGIN (Updates state after component callback)
   */
  const setGoogleUser = (userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  /**
   * LOGOUT
   */
   const router = useRouter();
  const logout = async () => {
  
    try {
      await logoutUser(); // Use the helper from api.js
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.clear();
      // window.location.replace('/login');
      router.replace('/login');
    }
  };

  const value = {
    user,
    setUser,
    loading,
    initialized,
    login,
    logout,
    setGoogleUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};