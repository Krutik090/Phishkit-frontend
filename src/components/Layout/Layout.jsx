// Layout.jsx
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar"; // 👈 import the new navbar
import { Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import SupportChatBot from "../chatbot/SupportChatBot";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode } = useTheme();

  const handleLogout = () => {
    // Replace this with your actual logout logic
    console.log("User logged out");
    // Example: localStorage.clear(); navigate("/login");
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = collapsed ? 80 : 250;

  return (
    <Box
      className={`min-h-screen ${darkMode ? "text-white" : "text-black"}`}
      sx={{
        backgroundColor: darkMode ? "#1e1e2f" : "#ffffff",
        display: "flex",
      }}
    >
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          ml: `${sidebarWidth}px`,
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          backgroundColor: darkMode ? "#2e2e42" : "#fdfbff",
          color: darkMode ? "#ffffff" : "#1e1e2f",
        }}
      >
        <Navbar onLogout={handleLogout} />

        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 2, md: 3 },
            pb: 10,
            borderLeft: `1px solid ${darkMode ? "#ec008c" : "#ec008c33"}`,
            boxShadow: darkMode
              ? "inset 0 0 6px rgba(236, 0, 140, 0.2)"
              : "inset 0 0 6px rgba(236, 0, 140, 0.1)",
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
