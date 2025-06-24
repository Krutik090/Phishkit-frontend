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
          height: "100vh", // lock height
          overflow: "hidden", // prevent scroll
          backgroundColor: "#f9f9f9",
          p: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
