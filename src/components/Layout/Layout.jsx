import React, { useState, useCallback, useEffect } from "react";
import { Box, useMediaQuery, useTheme as useMuiTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";
import SupportChatBot from "../chatbot/SupportChatBot";

// Constants for the new sidebar design, including its margins
const SIDEBAR_WIDTH_EXPANDED = 260 + 32; // 260px width + 16px margin on each side
const SIDEBAR_WIDTH_COLLAPSED = 88 + 32; // 88px width + 16px margin on each side

const Layout = () => {
  const { darkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const sidebarWidth = isSidebarOpen ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        // A subtle gradient background for a more premium feel
        background: darkMode 
          ? 'linear-gradient(180deg, #101021 0%, #18182c 100%)' 
          : '#f7f7f9',
      }}
    >
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={handleToggleSidebar}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          // The marginLeft is now calculated to perfectly align with the floating sidebar
          marginLeft: {
            xs: `${SIDEBAR_WIDTH_COLLAPSED}px`,
            sm: `${sidebarWidth}px`
          },
          transition: muiTheme.transitions.create('margin', {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Navbar />

        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            overflowY: 'auto',
            overflowX: 'hidden',
            // Custom scrollbar styling for a modern look
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: darkMode ? '#444' : '#ccc',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: darkMode ? '#666' : '#aaa',
            }
          }}
        >
          <Outlet />
          <SupportChatBot />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
