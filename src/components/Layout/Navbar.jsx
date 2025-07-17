// src/components/layout/Navbar.jsx
import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Button,
    InputBase,
    IconButton,
    Box,
    alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const { darkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleSearch = () => {
        console.log("Searching for:", searchQuery);
        // TODO: implement actual search logic
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            navigate("/login");
        }
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: darkMode ? "#1e1e2f" : "#ffffff",
                color: darkMode ? "#ffffff" : "#1e1e2f",
                borderBottom: `1px solid ${darkMode ? "#ec008c" : "#ec008c33"}`,
                boxShadow: darkMode
                    ? "inset 0 -2px 4px rgba(236, 0, 140, 0.2)"
                    : "inset 0 -2px 4px rgba(236, 0, 140, 0.1)",
                zIndex: 1101,
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* 🔍 Centered Search Bar */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: alpha(darkMode ? "#ffffff" : "#000000", 0.05),
                        borderRadius: 2,
                        px: 1,
                        flex: 1,
                        maxWidth: 600,
                        justifyContent: "center",
                        border: "1px solid",
                        borderColor: darkMode ? "#ec008c88" : "#ec008c33",
                    }}
                >
                    <InputBase
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            ml: 1,
                            flex: 1,
                            color: darkMode ? "#ffffff" : "#1e1e2f",
                        }}
                        inputProps={{ "aria-label": "search" }}
                    />
                    <IconButton
                        onClick={handleSearch}
                        sx={{ color: "#ec008c" }}
                        aria-label="search-button"
                    >
                        <SearchIcon />
                    </IconButton>
                </Box>

                {/* 🚪 Logout Button */}
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleLogout}
                    sx={{
                        ml: 2,
                        minWidth: 100, // Wider button
                        py: 1.0,        // Taller button
                        background: "linear-gradient(to right, #8b0000, #e11d48)",
                        color: "#ffffff",
                        fontWeight: "bold",
                        textTransform: "none",
                        fontSize: '15px',
                        "&:hover": {
                            background: "linear-gradient(to right, #7f1d1d, #be123c)",
                        },
                    }}
                >
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
