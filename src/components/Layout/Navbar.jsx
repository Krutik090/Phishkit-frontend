import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    InputBase,
    IconButton,
    Box,
    Typography,
    alpha,
    Avatar,
    Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const { darkMode, setDarkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSearch = () => {
        console.log("Searching for:", searchQuery);
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                background: 'transparent',
                backdropFilter: 'blur(12px)',
                color: darkMode ? "#ffffff" : "#1e1e2f",
                borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                paddingX: 2,
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                {/* Left side: Welcome message */}
                <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        Welcome, {user?.name || 'User'}!
                    </Typography>
                </Box>

                {/* Right side: Search, Theme Toggle, and User */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {/* Search Bar */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' }, // Hide on small screens
                            alignItems: "center",
                            backgroundColor: alpha(darkMode ? "#ffffff" : "#000000", 0.08),
                            borderRadius: '12px',
                            px: 1.5,
                            width: { sm: 300, md: 400 },
                        }}
                    >
                        <InputBase
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1, color: 'inherit' }}
                            inputProps={{ "aria-label": "search" }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <IconButton onClick={handleSearch} sx={{ color: 'inherit' }} aria-label="search-button">
                            <SearchIcon />
                        </IconButton>
                    </Box>

                    {/* Theme Toggle Button */}
                    <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                        <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: 'inherit' }}>
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </IconButton>
                    </Tooltip>

                    {/* User Info */}
                    <Tooltip title={user?.email || ''}>
                         <Avatar sx={{ background: 'linear-gradient(45deg, #ec008c, #fc6767)' }}>
                            {user?.email?.[0].toUpperCase()}
                        </Avatar>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
