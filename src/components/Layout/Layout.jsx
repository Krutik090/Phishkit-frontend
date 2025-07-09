import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const Layout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { darkMode } = useTheme();
  const sidebarWidth = collapsed ? 70 : 250;

  return (
      <Box className={`min-h-screen ${darkMode ? "bg-[#2e2e42] text-white" : "bg-white text-black"}`}>

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
          p: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
