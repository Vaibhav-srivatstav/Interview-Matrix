'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Centralized API instance
 */
const API =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /**
   * Check session on app load
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data.user);
        return res.data.user;
      } catch (err) {
        // Only treat 401 as "not logged in", not an error
        localStorage.removeItem("isLoggedIn");
        if (err.response?.status !== 401) {
          console.error('Auth check failed:', err);
        }
        setUser(null);
        return null;
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  /**
   * LOGIN
   */
  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', {
        email,
        password,
      });

      const user = await checkAuth();

      if(!user) throw new Error("Auth sync failed");

      setUser(res.data.user);
      // return res.data;
      return user;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  /**
   * GOOGLE LOGIN (after OAuth callback)
   */
  const setGoogleUser = (userData) => {
    setUser(userData);
  };

  /**
   * LOGOUT
   */
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      window.location.replace('/login');
    }
  };

  /**
   * SAFE CONTEXT VALUE
   */
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

/**
 * SAFE HOOK (prevents misuse outside provider)
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
};