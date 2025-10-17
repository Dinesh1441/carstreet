// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    
    if (token) {
      fetch('http://localhost:5000/api/users/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())  
      .then(data => {
        if (data.status === "success") {
          setUser(data.data);
        } else {
          setUser(null);
          localStorage.removeItem('token');
        }
        setAuthChecked(true);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setUser(null);
        localStorage.removeItem('token');
        setAuthChecked(true);
        setLoading(false);
      });
    } else {
      setAuthChecked(true);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const userData = data.data.user;
        setUser(userData);
        localStorage.setItem('token', data.data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    authChecked
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};