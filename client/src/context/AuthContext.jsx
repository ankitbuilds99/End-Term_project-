import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi, loginApi, registerApi, logoutApi, updateProfileApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore authenticated session on initial mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await getMeApi();
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
        }
      } catch {
        // Not authenticated or session expired; user remains null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const login = async (identifier, password) => {
    setError(null);
    try {
      const res = await loginApi({ loginId: identifier, password });
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await registerApi(userData);
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn('Logout API warning:', err.message);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await updateProfileApi(formData);
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: 'Update failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Update failed';
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    loading,
    error,
    isArtist: user?.role === 'artist',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    clearError: () => setError(null),
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
