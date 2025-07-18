import React from "react";
import { Route, Routes } from "react-router-dom";
import S_Layout from "./Layout/S_Layout";

// Pages
import S_Dashboard from "./Admin_Dashboard/S_Dashboard";
import S_Admins from "./Admins/S_Admins";
import S_Log from "./Logs/S_Log";
import S_Settings from "./Settings/S_Settings";

import SuperAdmin_Protect from "./SuperAdmin_Protect";
import S_AllUsers from "./User_Management/S_AllUsers";
import S_dashboard from "./General/S_dashboard";
import S_campaign from "./General/S_campaign";
import S_templates from "./General/S_templates";
import S_landingPage from "./General/S_landingPage";
import S_sendingProfiles from "./General/S_sendingProfiles";
import S_userGroup from "./General/S_userGroup";
import S_project from "./Extra/S_project";
import S_quiz from "./Extra/S_quiz";
import S_training from "./Extra/S_training";

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
  <Route path = "users" element= {<S_AllUsers />} />
  <Route path="dashboard" element={<S_dashboard />} />
  <Route path="campaign" element={<S_campaign />} />
  <Route path="template" element={<S_templates />} />
  <Route path="landing-page" element={<S_landingPage />} />
  <Route path="sending-profile" element={<S_sendingProfiles />} />
  <Route path="users-groups" element={<S_userGroup />} />
  <Route path="project" element={<S_project />} />
  <Route path="quiz" element={<S_quiz />} />
  <Route path="training" element={<S_training />} />
</Route>

  </Routes>
);

export default SuperAdminRoutes;
