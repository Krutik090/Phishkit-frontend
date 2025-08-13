import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, IconButton, Tooltip, Collapse, Avatar, Typography } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaProjectDiagram, FaEnvelope, FaFileAlt, FaGlobe, FaUsers, FaCog,
  FaTachometerAlt, FaChevronDown, FaChevronUp, FaDatabase, FaSignOutAlt,
  FaBars, FaBullhorn, FaUserCog, FaShieldAlt, FaBookOpen, FaGraduationCap, 
  FaQuestionCircle
} from "react-icons/fa";
import { MdAdminPanelSettings, MdSupervisorAccount } from "react-icons/md";

// --- DATA CONFIGURATION ---
const menuConfig = [
  { 
    label: "Dashboard", 
    icon: <FaTachometerAlt />, 
    path: "/dashboard", 
    allowedRoles: [] 
  },
  { 
    label: "Projects", 
    icon: <FaProjectDiagram />, 
    path: "/projects", 
    allowedRoles: [] 
  },
  {
    label: "Administration",
    icon: <MdAdminPanelSettings />,
    allowedRoles: ["admin", "superadmin"],
    children: [
      { 
        label: "User Management", 
        icon: <FaUserCog />, 
        path: "/user-management", 
        allowedRoles: ["admin", "superadmin"] 
      },
      { 
        label: "Database Management", 
        icon: <FaDatabase />, 
        path: "/database", 
        allowedRoles: ["admin", "superadmin"] 
      },
      { 
        label: "Super Admin Panel", 
        icon: <MdSupervisorAccount />, 
        path: "/super-admin", 
        allowedRoles: ["superadmin"] 
      },
    ],
  },
  {
    label: "Phishing Operations",
    icon: <FaShieldAlt />,
    allowedRoles: ["admin", "superadmin", "editor"],
    children: [
      { 
        label: "Campaigns", 
        icon: <FaBullhorn />, 
        path: "/campaigns", 
        allowedRoles: [] 
      },
      { 
        label: "Email Templates", 
        icon: <FaFileAlt />, 
        path: "/templates", 
        allowedRoles: [] 
      },
      { 
        label: "Landing Pages", 
        icon: <FaGlobe />, 
        path: "/landing-pages", 
        allowedRoles: [] 
      },
      { 
        label: "Sending Profiles", 
        icon: <FaEnvelope />, 
        path: "/sending-profiles", 
        allowedRoles: [] 
      },
      { 
        label: "Target Groups", 
        icon: <FaUsers />, 
        path: "/users-groups", 
        allowedRoles: [] 
      },
    ],
  },
  {
    label: "Learning & Development",
    icon: <FaGraduationCap />,
    allowedRoles: ["admin", "superadmin", "editor"],
    children: [
      { 
        label: "Knowledge Quiz", 
        icon: <FaQuestionCircle />, 
        path: "/quizz", 
        allowedRoles: [] 
      },
      { 
        label: "Training Resources", 
        icon: <FaBookOpen />, 
        path: "/training", 
        newTab: true, 
        allowedRoles: [] 
      },
    ],
  },
  { 
    label: "Settings", 
    icon: <FaCog />, 
    path: "/settings", 
    allowedRoles: [] 
  },
];

// --- STYLED COMPONENTS ---
const SidebarMenuItem = React.memo(({ item, isSidebarOpen, isActive }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleClick = useCallback(() => {
    if (item.newTab) {
      window.open(item.path, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.path);
    }
  }, [navigate, item.path, item.newTab]);

  return (
    <Tooltip title={!isSidebarOpen ? item.label : ""} placement="right" arrow>
      <Box
        onClick={handleClick}
        sx={{
          display: "flex", 
          alignItems: "center", 
          gap: 2,
          p: 1.5, 
          mx: 1, 
          my: 0.5, 
          borderRadius: '12px', 
          cursor: "pointer",
          color: isActive ? '#fff' : (darkMode ? 'grey.400' : 'grey.700'),
          background: isActive 
            ? 'linear-gradient(90deg, rgba(236,0,140,0.7) 0%, rgba(255,105,180,0.5) 100%)' 
            : 'transparent',
          transition: "all 0.2s ease-in-out",
          justifyContent: isSidebarOpen ? "flex-start" : "center",
          '&:hover': {
            background: isActive 
              ? 'linear-gradient(90deg, rgba(236,0,140,0.8) 0%, rgba(255,105,180,0.6) 100%)' 
              : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
            color: isActive ? '#fff' : (darkMode ? 'grey.200' : 'grey.900'),
            transform: 'translateX(4px)',
          },
        }}
      >
        <Box sx={{ 
          fontSize: 18, 
          display: 'flex', 
          alignItems: 'center',
          minWidth: 18 
        }}>
          {item.icon}
        </Box>
        {isSidebarOpen && (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500, 
              whiteSpace: 'nowrap',
              fontSize: '0.875rem'
            }}
          >
            {item.label}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
});

SidebarMenuItem.displayName = 'SidebarMenuItem';

// --- MAIN SIDEBAR COMPONENT ---
const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebarMenuState') || '{}');
    } catch (error) {
      console.warn('Failed to parse sidebar menu state:', error);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebarMenuState', JSON.stringify(openMenus));
    } catch (error) {
      console.warn('Failed to save sidebar menu state:', error);
    }
  }, [openMenus]);

  const handleToggleMenu = useCallback((label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const userEffectiveRoles = useMemo(() => {
    const roles = new Set();
    if (user?.isReadOnly) {
      roles.add('readonly');
    } else {
      roles.add('editor');
    }
    if (user?.role) {
      roles.add(user.role);
    }
    return roles;
  }, [user]);

  const canView = useCallback((item) => {
    const { allowedRoles } = item;
    
    // If no roles specified, everyone can see it
    if (!allowedRoles || allowedRoles.length === 0) return true;
    
    // Readonly users have limited access
    if (userEffectiveRoles.has('readonly')) {
      const readonlyPaths = ['/dashboard', '/projects', '/campaigns', '/settings'];
      return readonlyPaths.includes(item.path);
    }
    
    // Check if user has any of the required roles
    return allowedRoles.some(role => userEffectiveRoles.has(role));
  }, [userEffectiveRoles]);

  const renderMenuItems = useCallback((items) => {
    return items
      .filter(canView)
      .map((item) => {
        const isActive = item.path && location.pathname.startsWith(item.path);
        
        if (item.children) {
          const visibleChildren = item.children.filter(canView);
          
          // Don't render parent if no children are visible
          if (visibleChildren.length === 0) return null;
          
          return (
            <Box key={item.label}>
              <Tooltip title={!isSidebarOpen ? item.label : ""} placement="right" arrow>
                <Box 
                  onClick={() => handleToggleMenu(item.label)} 
                  sx={{
                    display: "flex", 
                    alignItems: "center", 
                    p: 1.5, 
                    mx: 1, 
                    my: 0.5,
                    cursor: "pointer", 
                    borderRadius: "12px",
                    color: darkMode ? 'grey.400' : 'grey.700',
                    justifyContent: isSidebarOpen ? "space-between" : "center",
                    transition: "all 0.2s ease-in-out",
                    '&:hover': { 
                      background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', 
                      color: darkMode ? 'grey.200' : 'grey.900',
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ 
                      fontSize: 20, 
                      display: 'flex', 
                      alignItems: 'center',
                      minWidth: 20 
                    }}>
                      {item.icon}
                    </Box>
                    {isSidebarOpen && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500, 
                          whiteSpace: 'nowrap',
                          fontSize: '0.875rem'
                        }}
                      >
                        {item.label}
                      </Typography>
                    )}
                  </Box>
                  {isSidebarOpen && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {openMenus[item.label] ? 
                        <FaChevronUp size={12} /> : 
                        <FaChevronDown size={12} />
                      }
                    </Box>
                  )}
                </Box>
              </Tooltip>
              
              <Collapse in={openMenus[item.label] && isSidebarOpen} timeout="auto" unmountOnExit>
                <Box sx={{ 
                  borderLeft: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
                  ml: 3, 
                  pl: 1, 
                  py: 0.5 
                }}>
                  {renderMenuItems(visibleChildren)}
                </Box>
              </Collapse>
            </Box>
          );
        }
        
        return (
          <SidebarMenuItem 
            key={item.path || item.label} 
            item={item} 
            isSidebarOpen={isSidebarOpen} 
            isActive={isActive} 
          />
        );
      })
      .filter(Boolean); // Remove null items
  }, [isSidebarOpen, darkMode, location.pathname, openMenus, handleToggleMenu, canView]);

  const getUserInitials = (email) => {
    if (!email) return '?';
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (email) => {
    if (!email) return 'Unknown User';
    return email.split('@')[0];
  };

  return (
    <Box
      sx={{
        width: isSidebarOpen ? 280 : 88,
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
        background: darkMode 
          ? 'rgba(30, 30, 47, 0.85)' 
          : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
        boxShadow: darkMode 
          ? '0 12px 40px 0 rgba(0, 0, 0, 0.3)' 
          : '0 12px 40px 0 rgba(0, 0, 0, 0.15)',
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 1.5, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: isSidebarOpen ? "space-between" : "center",
        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
        mb: 1
      }}>
        {isSidebarOpen && (
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: "bold", 
              whiteSpace: 'nowrap', 
              ml: 1,
              background: 'linear-gradient(45deg, #ec008c, #fc6767)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.25rem'
            }}
          >
            Tribastion
          </Typography>
        )}
        <IconButton 
          onClick={toggleSidebar} 
          size="small" 
          sx={{ 
            color: darkMode ? 'grey.400' : 'grey.700',
            '&:hover': {
              background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              color: darkMode ? 'grey.200' : 'grey.900',
            }
          }}
        >
          <FaBars />
        </IconButton>
      </Box>

      {/* Menu */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden', 
        mt: 1,
        px: 0.5,
        '&::-webkit-scrollbar': { 
          width: '4px' 
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          background: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          borderRadius: '2px'
        }
      }}>
        {renderMenuItems(menuConfig)}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1.5, mt: 'auto' }}>
        <Box sx={{
          p: 2,
          borderRadius: '16px',
          background: darkMode 
            ? 'rgba(0,0,0,0.3)' 
            : 'rgba(0,0,0,0.04)',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
        }}>
          {isSidebarOpen && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  mx: 'auto', 
                  mb: 1, 
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(45deg, #ec008c, #fc6767)',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                {getUserInitials(user?.email)}
              </Avatar>
              <Typography 
                variant="subtitle2" 
                sx={{
                  color: darkMode ? 'grey.200' : 'grey.800',
                  fontWeight: 500,
                  mb: 0.5
                }} 
                noWrap
              >
                {getUserDisplayName(user?.email)}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{
                  color: darkMode ? 'grey.400' : 'grey.600',
                  fontSize: '0.75rem'
                }} 
                noWrap
              >
                {user?.role || 'User'}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Tooltip title="Sign Out" placement="top" arrow>
              <IconButton 
                size="small" 
                onClick={handleLogout} 
                sx={{ 
                  color: darkMode ? 'grey.400' : 'grey.600',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    color: '#ff4757',
                    background: darkMode ? 'rgba(255, 71, 87, 0.1)' : 'rgba(255, 71, 87, 0.08)',
                    transform: 'scale(1.1)'
                  } 
                }}
              >
                <FaSignOutAlt size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;