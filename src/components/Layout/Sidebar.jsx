import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, IconButton, Tooltip, Collapse, Avatar, Typography } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaTable, FaEnvelope, FaFileAlt, FaGlobe, FaUsers, FaCog,
  FaTachometerAlt, FaChevronDown, FaChevronUp, FaDatabase, FaSignOutAlt,
  FaBars
} from "react-icons/fa";
import QuizIcon from "@mui/icons-material/Quiz";

// --- DATA CONFIGURATION ---
const menuConfig = [
  { label: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard", allowedRoles: [] },
  { label: "Projects", icon: <FaUsers />, path: "/projects", allowedRoles: [] },
  {
    label: "Admin",
    icon: <FaUsers />,
    allowedRoles: ["admin", "superadmin"],
    children: [
      { label: "User Management", icon: <FaUsers />, path: "/user-management", allowedRoles: ["admin", "superadmin"] },
      { label: "Database", icon: <FaDatabase />, path: "/database", allowedRoles: ["admin", "superadmin"] },
      { label: "Super Admin", icon: <FaUsers />, path: "/super-admin", allowedRoles: ["superadmin"] },
    ],
  },
  {
    label: "General",
    icon: <FaCog />,
    allowedRoles: ["admin", "superadmin", "editor"],
    children: [
      { label: "Campaigns", icon: <FaTable />, path: "/campaigns", allowedRoles: [] },
      { label: "Templates", icon: <FaFileAlt />, path: "/templates", allowedRoles: [] },
      { label: "Landing Pages", icon: <FaGlobe />, path: "/landing-pages", allowedRoles: [] },
      { label: "Sending Profiles", icon: <FaEnvelope />, path: "/sending-profiles", allowedRoles: [] },
      { label: "Users & Groups", icon: <FaUsers />, path: "/users-groups", allowedRoles: [] },
    ],
  },
  {
    label: "Extra",
    icon: <FaFileAlt />,
    allowedRoles: ["admin", "superadmin", "editor"],
    children: [
      { label: "Quiz", icon: <QuizIcon fontSize="small" />, path: "/quizz", allowedRoles: [] },
      { label: "Training", icon: <FaFileAlt />, path: "/training", newTab: true, allowedRoles: [] },
    ],
  },
  { label: "Settings", icon: <FaCog />, path: "/settings", allowedRoles: [] },
];

// --- STYLED COMPONENTS ---
const SidebarMenuItem = React.memo(({ item, isSidebarOpen, isActive }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleClick = useCallback(() => {
    if (item.newTab) window.open(item.path, "_blank", "noopener,noreferrer");
    else navigate(item.path);
  }, [navigate, item.path, item.newTab]);

  return (
    <Tooltip title={!isSidebarOpen ? item.label : ""} placement="right" arrow>
      <Box
        onClick={handleClick}
        sx={{
          display: "flex", alignItems: "center", gap: 2,
          p: 1.5, mx: 1, my: 0.5, borderRadius: '12px', cursor: "pointer",
          color: isActive ? '#fff' : (darkMode ? 'grey.400' : 'grey.700'),
          background: isActive 
            ? 'linear-gradient(90deg, rgba(236,0,140,0.7) 0%, rgba(255,105,180,0.5) 100%)' 
            : 'transparent',
          transition: "all 0.2s ease",
          justifyContent: isSidebarOpen ? "flex-start" : "center",
          '&:hover': {
            background: isActive 
              ? 'linear-gradient(90deg, rgba(236,0,140,0.8) 0%, rgba(255,105,180,0.6) 100%)' 
              : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
            color: isActive ? '#fff' : (darkMode ? 'grey.200' : 'grey.900'),
          },
        }}
      >
        <Box sx={{ fontSize: 18, display: 'flex' }}>{item.icon}</Box>
        {isSidebarOpen && <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{item.label}</Typography>}
      </Box>
    </Tooltip>
  );
});

// --- MAIN SIDEBAR COMPONENT ---
const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebarMenuState') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('sidebarMenuState', JSON.stringify(openMenus));
  }, [openMenus]);

  const handleToggleMenu = useCallback((label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const userEffectiveRoles = useMemo(() => {
    const roles = new Set();
    if (user?.isReadOnly) roles.add('readonly');
    else roles.add('editor');
    if (user?.role) roles.add(user.role);
    return roles;
  }, [user]);

  const canView = useCallback((item) => {
    const { allowedRoles } = item;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (userEffectiveRoles.has('readonly')) {
      return ['/dashboard', '/projects', '/campaigns', '/settings'].includes(item.path);
    }
    return allowedRoles.some(role => userEffectiveRoles.has(role));
  }, [userEffectiveRoles]);

  const renderMenuItems = useCallback((items) => {
    return items.filter(canView).map((item) => {
      const isActive = item.path && location.pathname.startsWith(item.path);
      if (item.children) {
        return (
          <Box key={item.label}>
            <Tooltip title={!isSidebarOpen ? item.label : ""} placement="right" arrow>
              <Box onClick={() => handleToggleMenu(item.label)} sx={{
                display: "flex", alignItems: "center", p: 1.5, mx: 1, my: 0.5,
                cursor: "pointer", borderRadius: "12px",
                color: darkMode ? 'grey.400' : 'grey.700',
                justifyContent: isSidebarOpen ? "space-between" : "center",
                '&:hover': { background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: darkMode ? 'grey.200' : 'grey.900' },
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ fontSize: 20, display: 'flex' }}>{item.icon}</Box>
                  {isSidebarOpen && <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{item.label}</Typography>}
                </Box>
                {isSidebarOpen && (openMenus[item.label] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />)}
              </Box>
            </Tooltip>
            <Collapse in={openMenus[item.label] && isSidebarOpen} timeout="auto" unmountOnExit>
              <Box sx={{ borderLeft: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, ml: 3, pl: 1, py: 1 }}>
                {renderMenuItems(item.children)}
              </Box>
            </Collapse>
          </Box>
        );
      }
      return <SidebarMenuItem key={item.path} item={item} isSidebarOpen={isSidebarOpen} isActive={isActive} />;
    });
  }, [isSidebarOpen, darkMode, location.pathname, openMenus, handleToggleMenu, canView]);

  return (
    <Box
      sx={{
        width: isSidebarOpen ? 260 : 88,
        height: 'calc(100vh - 32px)',
        m: 2,
        p: 1,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1201,
        borderRadius: '24px',
        background: darkMode ? 'rgba(30, 30, 47, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 1, display: "flex", alignItems: "center", justifyContent: isSidebarOpen ? "space-between" : "center" }}>
        {isSidebarOpen && (
          <Typography variant="h6" sx={{ fontWeight: "bold", whiteSpace: 'nowrap', ml: 1 }}>
            Tribastion
          </Typography>
        )}
        <IconButton onClick={toggleSidebar} size="small" sx={{ color: darkMode ? 'grey.400' : 'grey.700' }}>
          <FaBars />
        </IconButton>
      </Box>

      {/* Menu */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', mt: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
        {renderMenuItems(menuConfig)}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1 }}>
        <Box sx={{
          p: 1.5,
          borderRadius: '12px',
          background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)',
        }}>
          {isSidebarOpen && (
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Avatar sx={{ mx: 'auto', mb: 1, background: 'linear-gradient(45deg, #ec008c, #fc6767)' }}>{user?.email?.[0].toUpperCase()}</Avatar>
              <Typography variant="subtitle2" sx={{color: darkMode ? 'grey.200' : 'grey.900'}} noWrap>{user?.email}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Tooltip title="Logout" placement="top">
              <IconButton size="small" onClick={handleLogout} sx={{ color: darkMode ? 'grey.400' : 'grey.700', '&:hover': { color: '#ff4d4d' } }}>
                <FaSignOutAlt />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
