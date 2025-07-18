import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.response?.data?.message || 'Failed to fetch user profile');
      setLoading(false);
      // Clear invalid token
      localStorage.removeItem('token');
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await authService.login({ email, password });
      setUser(user);
      setLoading(false);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
      setLoading(false);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    authService.logout();
    localStorage.removeItem('token');
    setUser(null);
  };

  // Register
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await authService.register(userData);
      setUser(user);
      setLoading(false);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed');
      setLoading(false);
      throw error;
    }
  };

  // Update profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      setLoading(false);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      setLoading(false);
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated,
    getToken
  };
};
