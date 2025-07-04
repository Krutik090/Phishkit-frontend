import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh", // full viewport height
        overflow: "hidden", // prevent body scroll
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflowY: "auto", // allow vertical scroll in content
          overflowX: "hidden",
          backgroundColor: "#f9f9f9",
          p: { xs: 1, sm: 2, md: 3 }, // responsive padding
        }}
      >
        <Outlet />
      </Box>

    </Box>
  );
};

export default Layout;
