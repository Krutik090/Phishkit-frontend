import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../context/ThemeContext";
import {
  FaTable,
  FaEnvelope,
  FaFileAlt,
  FaGlobe,
  FaUsers,
  FaCog,
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import QuizIcon from "@mui/icons-material/Quiz";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { darkMode, setDarkMode } = useTheme(); // ✅ use context
  const navigate = useNavigate();
  const location = useLocation();

  const bgColor = darkMode ? "#1e1e2f" : "#ffffff";
  const textColor = darkMode ? "#ffffffcc" : "#333333";
  const activeBg = darkMode ? "#2c2c40" : "#f0f0f0";
  const activeText = darkMode ? "#ffffff" : "#ec008c";

  const menuItems = [
    { label: "Campaigns", icon: <FaTable />, path: "/campaigns" },
    { label: "Templates", icon: <FaFileAlt />, path: "/templates" },
    { label: "Landing Pages", icon: <FaGlobe />, path: "/landing-pages" },
    { label: "Sending Profiles", icon: <FaEnvelope />, path: "/sending-profiles" },
    { label: "Users & Groups", icon: <FaUsers />, path: "/users-groups" },
    { label: "Projects", icon: <FaUsers />, path: "/clients" },
    { label: "Quiz", icon: <QuizIcon fontSize="small" />, path: "/quizz" },
    { label: "Training", icon: <FaFileAlt />, path: "/training", newTab: true },
    { label: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  return (
    <Box
      sx={{
        width: `${collapsed ? 70 : 250}px`,
        minWidth: `${collapsed ? 70 : 250}px`,
        height: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        p: 2,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: `1px solid ${darkMode ? "#333" : "#ddd"}`,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <Box sx={{ fontSize: "22px", fontWeight: "bold", pl: 1 }}>
            Tribastion
          </Box>
        )}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          sx={{ color: textColor }}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </IconButton>
      </Box>

      {/* Menu */}
      <Box sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Tooltip
              title={collapsed ? item.label : ""}
              placement="right"
              arrow
              key={item.label}
            >
              <Box
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
                  gap: collapsed ? 0 : 1.5,
                  px: 2,
                  py: 1.5,
                  my: 1,
                  borderRadius: "10px",
                  cursor: "pointer",
                  backgroundColor: isActive ? activeBg : "transparent",
                  color: isActive ? activeText : textColor,
                  fontWeight: isActive ? "bold" : "normal",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: darkMode ? "#33334d" : "#f5f5f5",
                  },
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
              >
                <Box sx={{ fontSize: 18 }}>{item.icon}</Box>
                {!collapsed && <Box>{item.label}</Box>}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Dark Mode Toggle */}
      <Box
        onClick={() => setDarkMode(!darkMode)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 1.5,
          px: 2,
          py: 1.5,
          borderRadius: "10px",
          cursor: "pointer",
          backgroundColor: darkMode ? "#33334d" : "#f5f5f5",
          color: darkMode ? "#ffffff" : "#333",
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: darkMode ? "#44445c" : "#eaeaea",
          },
        }}
      >
        <Box sx={{ fontSize: 18 }}>{darkMode ? <FaSun /> : <FaMoon />}</Box>
        {!collapsed && <Box>{darkMode ? "Light Mode" : "Dark Mode"}</Box>}
      </Box>
    </Box>
  );
};

export default Sidebar;
