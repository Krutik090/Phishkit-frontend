import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import SupportChatBot from "../chatbot/SupportChatBot"; // ✅ Import chatbot here

const Layout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { darkMode } = useTheme();
  const sidebarWidth = collapsed ? 70 : 250;

  return (
    <Box
      className={`min-h-screen ${darkMode ? "text-white" : "text-black"}`}
      sx={{
        backgroundColor: darkMode ? "#1e1e2f" : "#ffffff",
        display: "flex",
      }}
    >
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          ml: `${sidebarWidth}px`,
          transition: "margin-left 0.3s ease",
          p: { xs: 1, sm: 2, md: 3 },
          pb: 10,
          backgroundColor: darkMode ? "#2e2e42" : "#fdfbff",
          color: darkMode ? "#ffffff" : "#1e1e2f",
          borderLeft: `1px solid ${darkMode ? "#ec008c" : "#ec008c33"}`,
          boxShadow: darkMode
            ? "inset 0 0 6px rgba(236, 0, 140, 0.2)"
            : "inset 0 0 6px rgba(236, 0, 140, 0.1)"
        }}
      >
        <Outlet />

        {/* ✅ Add chatbot at the root of main content */}
        <SupportChatBot />
      </Box>
    </Box>
  );
};

export default Layout;
