import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar />

      <Box
  component="main"
  sx={{
    flexGrow: 1,
    height: "100vh",
    overflowY: "auto",
    overflowX: "hidden",
    backgroundColor: "#f9f9f9",
    ml: { xs: "180px", sm: "220px", md: "250px" }, // <<< Add marginLeft
    p: { xs: 1, sm: 2, md: 3 },
  }}
>

        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
