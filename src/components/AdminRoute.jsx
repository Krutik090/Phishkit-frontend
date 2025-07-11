import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/protected`, {
          withCredentials: true,
        });

        // Check if the user has admin role from response
        if (res.status === 200 && res.data?.user?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [location.pathname]);

  if (isAdmin === null) return null; // or <Spinner />

  return isAdmin ? children : <Navigate to="/campaigns" replace />;
};

export default AdminRoute;
