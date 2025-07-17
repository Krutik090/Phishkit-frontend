import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Check authentication status on app initialization
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Make a request to verify current user session
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/protected`, {
          withCredentials: true
        });
        
        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log("User not authenticated:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, credentials, {
        withCredentials: true
      });
      
      if (response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.response?.data?.message || "Login failed" };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);