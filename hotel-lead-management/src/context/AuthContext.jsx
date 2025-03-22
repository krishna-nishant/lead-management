import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

// Use environment variable or fallback for API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add axios interceptor to handle token expiry
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle token expiration or authentication errors
        if (error.response && 
           (error.response.status === 401 || 
            error.response.status === 403 || 
            error.response?.data?.msg === "Token is not valid")) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up interceptor on unmount
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data) {
          setUser(res.data);
          // Set admin status if the user is an admin
          setIsAdmin(res.data.email === "nishantkrishna2005@gmail.com");
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const signup = async (name, email, phone, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name, email, phone, password
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: error.response?.data?.msg || "Registration failed"
      };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { 
        email, password 
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        // Set admin status if returned from backend
        setIsAdmin(res.data.user?.isAdmin || false);
        return { success: true };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.msg || "Authentication failed" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading,
      isAdmin,
      signup, 
      login, 
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
