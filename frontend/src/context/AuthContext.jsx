import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../config/config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get token from localStorage
  const getToken = () => localStorage.getItem('kohinoor_token');
  
  // Set token to localStorage
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('kohinoor_token', token);
    } else {
      localStorage.removeItem('kohinoor_token');
    }
  };

  // API helper with proper error handling and retry
  const apiCall = async (endpoint, options = {}, retryCount = 0) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    // Use API URL from environment config
    const apiUrl = API_CONFIG.BASE_URL;
    const fullUrl = `${apiUrl}/customer${endpoint}`;
    
    // Shorter timeouts for a snappy UX
    // OTP/email operations may need a bit longer, but we still keep it tight
    const isEmailOperation = endpoint.includes('otp') || endpoint.includes('send') || endpoint.includes('verify');
    const timeoutMs = isEmailOperation ? 20000 : 12000; // 20s for OTP, 12s for others
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Handle empty responses
      const text = await response.text();
      let data;
      
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Response is not JSON
        if (!response.ok) {
          throw new Error(`Server error (${response.status}). Please try again.`);
        }
        data = {};
      }
      
      if (!response.ok) {
        // Special case: 403 with requiresVerification should return data, not throw
        if (response.status === 403 && data.requiresVerification) {
          return data;
        }
        throw new Error(data.message || `Request failed (${response.status})`);
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // On timeout, just fail fast with a clear message
      if (error.name === 'AbortError') {
        throw new Error('Request took too long. Please check your internet and try again.');
      }

      // Network errors (DNS, SSL, offline, etc.)
      if (error.name === 'TypeError') {
        throw new Error('Connection failed. Please check your internet or try again in a moment.');
      }

      // Other errors bubble up
      throw error;
    }
  };

  // Check if user is logged in on mount
  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiCall('/me');
      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Signup
  const signup = async (userData) => {
    const data = await apiCall('/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    // If token is returned (OTP was verified during signup), set auth state
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    }
    
    return data;
  };

  // Verify email OTP
  const verifyEmail = async (email, otp) => {
    const data = await apiCall('/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
    
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    }
    
    return data;
  };

  // Resend OTP
  const resendOTP = async (email) => {
    const data = await apiCall('/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return data;
  };

  // Login
  const login = async (email, password) => {
    const data = await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    }
    
    return data;
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Forgot password
  const forgotPassword = async (email) => {
    const data = await apiCall('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return data;
  };

  // Reset password
  const resetPassword = async (email, otp, newPassword) => {
    const data = await apiCall('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword })
    });
    return data;
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const data = await apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    
    if (data.success && data.user) {
      setUser(data.user);
    }
    
    return data;
  };

  // Check email availability
  const checkEmail = async (email) => {
    const data = await apiCall('/check-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return data;
  };

  // Send OTP for pre-signup verification
  const sendOTP = async (email) => {
    const data = await apiCall('/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return data;
  };

  // Verify OTP before final signup
  const verifyOTP = async (email, otp) => {
    const data = await apiCall('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
    return data;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signup,
    verifyEmail,
    resendOTP,
    sendOTP,
    verifyOTP,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkEmail,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
