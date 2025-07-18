import React from "react";
import { Outlet } from "react-router-dom";
import S_Sidebar from "./S_Sidebar";

const S_Layout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar on the left */}
      <S_Sidebar />

      {/* Page content on the right */}
      <main style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f5f6fa" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default S_Layout;
