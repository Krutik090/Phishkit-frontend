import React, { useEffect, useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
// import { primaryColorGlobal,secondaryColorGlobal } from "../Settings/Settings";
import { useThemeColors } from "../Settings/Settings";
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
  FaTachometerAlt,
  FaSignOutAlt
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import QuizIcon from "@mui/icons-material/Quiz";
import axios from "axios";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/protected`, {
          withCredentials: true,
        });
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

  const bgColor = darkMode ? "#1e1e2f" : "#ffffff";
  const textColor = darkMode ? "#ffffffcc" : "#333333";
  const primaryColor = localStorage.getItem('primaryColor'); //kathan
  const activeBg = darkMode ? primaryColor : primaryColor + "33";
  const activeText = darkMode ? "#ffffff" : primaryColor;

  const baseMenuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
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

  const menuItems =
    isAdmin === true
      ? [
        ...baseMenuItems,
        { label: "Clients", icon: <FaUsers />, path: "/clients-user" },
      ]
      : baseMenuItems;

  if (isAdmin === null) return null;

  return (
    <Box
      sx={{
        width: collapsed ? 70 : { xs: 70, sm: 250 },
        minWidth: collapsed ? 70 : { xs: 70, sm: 250 },
        height: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        p: 2,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: `1px solid ${darkMode ? localStorage.getItem('primaryColor') : localStorage.getItem('primaryColor')}`, //kathan 
        boxShadow: darkMode
          ? `0 0 10px ${localStorage.getItem('primaryColor')}` //kathan
          : `0 0 10px ${localStorage.getItem('primaryColor')}`, //kathan
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <Box sx={{ fontSize: "22px", marginLeft: "25px", fontWeight: "bold", pl: 1 }}>
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
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.2s ease-in-out",
                  justifyContent: collapsed ? "center" : "flex-start",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    backgroundColor: primaryColor,
                    transform: isActive ? "scaleY(1)" : "scaleY(0)",
                    transition: "transform 0.3s ease-in-out",
                    transformOrigin: "top",
                    borderRadius: "4px",
                  },
                  "&:hover::before": {
                    transform: "scaleY(1)",
                  },
                }}
              >
                <Box sx={{ fontSize: 18 }}>{item.icon}</Box>
                {!collapsed && <Box>{item.label}</Box>}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Box
        onClick={async () => {
          try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
            navigate("/login");
          } catch (err) {
            console.error("Logout failed:", err);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 1.5,
          px: 2,
          py: 1.5,
          mb: 1,
          borderRadius: "10px",
          cursor: "pointer",
          background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
          color: "#fff",
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "all 0.3s ease-in-out",
          boxShadow: "0 2px 8px rgba(255, 65, 108, 0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, #ff5e7e, #ff6a45)",
            boxShadow: "0 4px 12px rgba(255, 65, 108, 0.6)",
          },
        }}
      >
        <Box sx={{ fontSize: 18 }}>
          <FaSignOutAlt />
        </Box>
        {!collapsed && <Box>Logout</Box>}
      </Box>

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
