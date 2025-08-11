import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";
import React from "react";

export default function RoleProtectedRoute({ children, allowRoles = [], fallbackPath = "/login" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect if user is not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If allowRoles is specified, check role-based permissions (for admin/superadmin routes)
  if (allowRoles.length > 0) {
    if (!allowRoles.includes(user.role)) {
      return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }
    // For role-specific routes, allow access regardless of read-only status
    return children;
  }

  // For routes without specific role requirements:
  // If user is NOT read-only, allow access to all routes
  if (!user.isReadOnly) {
    return children;
  }

  // If user IS read-only, check if current route is allowed
  const readOnlyAllowedRoutes = [
    "/dashboard",
    "/campaigns", 
    "/campaign-results",
    "/settings"
  ];

  // Check if current path is allowed for read-only users
  const isReadOnlyAllowedRoute = readOnlyAllowedRoutes.some(route => 
    location.pathname === route || 
    location.pathname.startsWith(route + "/")
  );

  // If read-only user tries to access restricted route, redirect to dashboard
  if (!isReadOnlyAllowedRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}