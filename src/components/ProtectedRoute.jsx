import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation(); // ✅ detects path change

  useEffect(() => {
    const token = localStorage.getItem("token");

    const checkAuth = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/protected`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setIsAuthenticated(res.status === 200);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // ✅ re-run on route change

  if (isAuthenticated === null) return null;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
