import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        // Verify token is still valid
        if (parsedUserInfo.token) {
          setUserInfo(parsedUserInfo);
        } else {
          localStorage.removeItem('userInfo');
        }
      } catch (error) {
        console.error('Error parsing stored user info:', error);
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await api.post('/users/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const { data } = await api.post('/users', { name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    setError(null);
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const { data } = await api.put('/users/profile', userData);
      const updatedUserInfo = { ...userInfo, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        userInfo, 
        loading, 
        error,
        login, 
        logout, 
        register,
        updateProfile,
        isAuthenticated: !!userInfo?.token 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};