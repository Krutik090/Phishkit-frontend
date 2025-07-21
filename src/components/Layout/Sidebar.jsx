import React, { useEffect, useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
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
  FaChevronDown,
  FaChevronUp,
  FaDatabase,
  FaKey,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import QuizIcon from "@mui/icons-material/Quiz";
import { axios } from "axios";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { darkMode, setDarkMode } = useTheme();
  const { user } = useAuth(); // Use AuthContext instead of separate API call
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize states from localStorage or default to false
  const [generalOpen, setGeneralOpen] = useState(() => {
    const saved = localStorage.getItem('generalOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [extraOpen, setExtraOpen] = useState(() => {
    const saved = localStorage.getItem('extraOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [adminOpen, setAdminOpen] = useState(() => {
    const saved = localStorage.getItem('adminOpen');
    return saved ? JSON.parse(saved) : false;
  });

  // Save states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('generalOpen', JSON.stringify(generalOpen));
  }, [generalOpen]);

  useEffect(() => {
    localStorage.setItem('extraOpen', JSON.stringify(extraOpen));
  }, [extraOpen]);

  useEffect(() => {
    localStorage.setItem('adminOpen', JSON.stringify(adminOpen));
  }, [adminOpen]);

  // Get user role from AuthContext
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  const bgColor = darkMode ? "#1e1e2f" : "#ffffff";
  const textColor = darkMode ? "#ffffffcc" : "#333333";
  const primaryColor = localStorage.getItem("primaryColor");
  const activeBg = darkMode ? primaryColor : primaryColor + "33";
  const activeText = darkMode ? "#ffffff" : primaryColor;

  const renderMenuItem = (item) => {
    const isActive = item.exact === false
      ? location.pathname.startsWith(item.path)
      : location.pathname === item.path;

    useEffect(() => {
      const fetchThemeColors = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/theme-color`, {
            withCredentials: true,
          });
          const { primaryColor, secondaryColor } = response.data;

          if (primaryColor) localStorage.setItem("primaryColor", primaryColor);
          if (secondaryColor) localStorage.setItem("secondaryColor", secondaryColor);
        } catch (error) {
          console.error("Error fetching theme colors:", error);
        }
      };

      fetchThemeColors();
    }, []);

    return (
      <Tooltip title={collapsed ? item.label : ""} placement="right" arrow key={item.label}>
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
          {!collapsed && <Box sx={{ fontSize: '14px' }}>{item.label}</Box>}
        </Box>
      </Tooltip>
    );
  };

  const renderDropdown = (label, icon, open, setOpen, children) => (
    <Box>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          my: 1,
          cursor: "pointer",
          borderRadius: "10px",
          color: textColor,
          justifyContent: collapsed ? "center" : "space-between",
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: darkMode ? "#292940" : "#f5f5f5",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ fontSize: 20 }}>{icon}</Box>
          {!collapsed && <span style={{ fontSize: '14px' }}>{label}</span>}
        </Box>
        {!collapsed && (open ? <FaChevronUp /> : <FaChevronDown />)}
      </Box>
      {!collapsed && open && <Box sx={{ pl: 2 }}>{children}</Box>}
    </Box>
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login"); // Navigate anyway
    }
  };

  return (
    <Box
      sx={{
        width: collapsed ? 80 : { xs: 70, sm: 250 },
        minWidth: collapsed ? 80 : { xs: 70, sm: 250 },
        height: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        p: 2,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        // borderRight: `1px solid ${darkMode ? "#ec008c" : "#ec008c66"}`,
        boxShadow: darkMode
          ? "0 0 10px rgba(236, 0, 140, 0.3)"
          : "0 0 10px rgba(236, 0, 140, 0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <Box sx={{ fontSize: "22px", marginLeft: "25px", fontWeight: "bold", pl: 1 }}>
            Tribastion
          </Box>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small" sx={{ color: textColor }}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </IconButton>
      </Box>

      {/* Menu */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: 'calc(100vh - 200px)',
          margin: '0 8px',
          // Hide scrollbar completely
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          // Firefox - hide scrollbar
          scrollbarWidth: 'none',
          msOverflowStyle: 'none', // IE and Edge
        }}
      >
        {renderMenuItem({ label: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard", exact: false })}

        {(isAdmin || isSuperAdmin) &&
          renderDropdown(
            "Admin",
            <FaUsers />,
            adminOpen,
            setAdminOpen,
            <>
              {renderMenuItem({ label: "Projects", icon: <FaUsers />, path: "/projects" })}
              {renderMenuItem({ label: "User Management", icon: <FaUsers />, path: "/user-management" })}
              {renderMenuItem({ label: "Database", icon: <FaDatabase />, path: "/database" })}
              {renderMenuItem({ label: "Access Logs", icon: <FaKey />, path: "/access-logs" })}
              {isSuperAdmin && renderMenuItem({ label: "Super Admin", icon: <FaUsers />, path: "/super-admin" })}
            </>
          )}

        {renderDropdown(
          "General",
          <FaCog />,
          generalOpen,
          setGeneralOpen,
          <>
            {renderMenuItem({ label: "Campaigns", icon: <FaTable />, path: "/campaigns" })}
            {renderMenuItem({ label: "Templates", icon: <FaFileAlt />, path: "/templates" })}
            {renderMenuItem({ label: "Landing Pages", icon: <FaGlobe />, path: "/landing-pages" })}
            {renderMenuItem({ label: "Sending Profiles", icon: <FaEnvelope />, path: "/sending-profiles" })}
            {renderMenuItem({ label: "Users & Groups", icon: <FaUsers />, path: "/users-groups" })}
          </>
        )}

        {renderDropdown(
          "Extra",
          <FaFileAlt />,
          extraOpen,
          setExtraOpen,
          <>
            {renderMenuItem({ label: "Quiz", icon: <QuizIcon fontSize="small" />, path: "/quizz" })}
            {renderMenuItem({ label: "Training", icon: <FaFileAlt />, path: "/training", newTab: true })}
          </>
        )}

        {renderMenuItem({ label: "Settings", icon: <FaCog />, path: "/settings" })}
      </Box>

      {/* Theme Toggle */}
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
