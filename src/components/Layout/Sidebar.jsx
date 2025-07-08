import React from "react";
import { Box, Typography } from "@mui/material";
import {
  FaTable,
  FaEnvelope,
  FaFileAlt,
  FaGlobe,
  FaUsers,
  FaCog,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import QuizIcon from "@mui/icons-material/Quiz";

const Sidebar = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const bgColor = darkMode ? "#1e1e2f" : "#ec008c";
  const textColor = darkMode ? "#ffffffcc" : "white";
  const activeBg = darkMode ? "#ffffff22" : "white";
  const activeText = darkMode ? "#ffffff" : "#ec008c";

  const menuItems = [
    { label: "Campaigns", icon: <FaTable />, path: "/campaigns" },
    { label: "Templates", icon: <FaFileAlt />, path: "/templates" },
    { label: "Landing Pages", icon: <FaGlobe />, path: "/landing-pages" },
    { label: "Sending Profiles", icon: <FaEnvelope />, path: "/sending-profiles" },
    { label: "Users & Groups", icon: <FaUsers />, path: "/users-groups" },
    { label: "Clients", icon: <FaUsers />, path: "/clients" },
    { label: "Quiz", icon: <QuizIcon fontSize="small" />, path: "/quiz" },
    { label: "Training", icon: <FaFileAlt />, path: "/training", newTab: true }, // ✅ New tab
    { label: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  return (
    <Box
      sx={{
        width: { xs: "180px", sm: "220px", md: "250px" },
        minWidth: { xs: "180px", sm: "220px", md: "250px" },
        height: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        p: 2,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "20px",
            color: textColor,
          }}
        >
          Tribastion
        </Typography>
      </Box>

      {/* Menu */}
      <Box sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Box
              key={item.label}
              onClick={() => {
                if (item.newTab) {
                  window.open(item.path, "_blank", "noopener,noreferrer");
                } else {
                  navigate(item.path);
                }
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1.5,
                my: 1,
                borderRadius: "12px",
                cursor: "pointer",
                backgroundColor: isActive ? activeBg : "transparent",
                color: isActive ? activeText : textColor,
                fontWeight: isActive ? "bold" : "normal",
                boxShadow: isActive ? "0px 2px 6px rgba(0,0,0,0.2)" : "none",
                transition: "all 0.3s",
                "&:hover": {
                  backgroundColor: isActive ? activeBg : "#ffffff33",
                },
              }}
            >
              <Box sx={{ fontSize: 18 }}>{item.icon}</Box>
              <Box>{item.label}</Box>
            </Box>
          );
        })}
      </Box>

      {/* Dark Mode Toggle */}
      <Box
        onClick={() => setDarkMode(!darkMode)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderRadius: "12px",
          cursor: "pointer",
          backgroundColor: "#ffffff22",
          color: "white",
          transition: "all 0.3s",
          "&:hover": {
            backgroundColor: "#ffffff33",
          },
        }}
      >
        <Box sx={{ fontSize: 18 }}>{darkMode ? <FaSun /> : <FaMoon />}</Box>
        <Box>{darkMode ? "Light Mode" : "Dark Mode"}</Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
