import React from "react";
import { Route, Routes } from "react-router-dom";
import S_Layout from "./Layout/S_Layout";

// Pages
import S_Dashboard from "./Admin_Dashboard/S_Dashboard";
import S_Admins from "./Admins/S_Admins";
import S_Log from "./Logs/S_Log";
import S_Settings from "./Settings/S_Settings";

import SuperAdmin_Protect from "./SuperAdmin_Protect";

const SuperAdminRoutes = () => (
  <Routes>
    <Route
  path="/super-admin"
  element={
    <SuperAdmin_Protect>
      <S_Layout />
    </SuperAdmin_Protect>
  }
>
  <Route index element={<S_Dashboard />} /> {/* 👈 default page when path is exactly /super-admin */}
  <Route path="admin-dashboard" element={<S_Dashboard />} />
  <Route path="admins" element={<S_Admins />} />
  <Route path="logs" element={<S_Log />} />
  <Route path="settings" element={<S_Settings />} />
</Route>

  </Routes>
);

export default SuperAdminRoutes;
