import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

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

  // Redirect if user is not authenticated or doesn't have required role
  if (!user || !allowRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return children;
}