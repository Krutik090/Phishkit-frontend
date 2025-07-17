import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";

const SuperAdmin_Protect = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/protected`, {
          withCredentials: true,
        });

        if (res.data?.user?.role === "superadmin") {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAllowed) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default SuperAdmin_Protect;
