import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const sidebarWidth = 250; // match the width in Sidebar.js

const Layout = () => {
  return (
    <>
      <Sidebar />

      <Box
        component="main"
        sx={{
          marginLeft: `${sidebarWidth}px`, // push content to the right of sidebar
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: "#f9f9f9",
          p: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Outlet />
      </Box>
    </>
  );
};

export default Layout;
