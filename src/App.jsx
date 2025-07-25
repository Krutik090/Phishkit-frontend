import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  BrowserRouter,
} from "react-router-dom";
import { Box } from "@mui/material";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import QuizTemplate from "./components/Quiz_Template/QuizTemplate";
import Campaigns from "./components/Campaign/Campaigns";
import ResultCampaign from "./components/Result_Camapaigns/ResultCampaign";
import Templates from "./components/Template/Templates";
import LandingPages from "./components/Landing_page/LandingPages";
import FullScreenEditor from "./components/Landing_page/FullScreenEditor";
import SendingProfiles from "./components/Sending Profile/SendingProfiles";
import UsersGroups from "./components/User_Groups/UsersGroups";
import Quiz from "./components/Quiz/Quiz";
import NewQuiz from "./components/Quiz/NewQuiz";
import Training from "./components/Training/Training";
import Settings from "./components/Settings/Settings";
import ProjectPage from "./components/Project/Projects"
import ClientCampaign from "./components/Stats_Results/ClientCampaign";
import ClientInsights from "./components/Stats_Results/ClientInsights";
import CampaignDetails from "./components/Stats_Results/CampaignDetails";
import GraphView from "./components/Stats_Results/GraphView";
import Login from "./components/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Layout from "./components/Layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard/Dashboard";
import "./components/Dashboard/dashboard.css";
import { ThemeProvider } from "./components/Settings/Settings";
import UserManagement from "./components/User_Management/UserManagement";
import SuperAdminRoutes from "./Super_Admin/SuperAdminRoutes";
import Database_Collection from "./components/Database/Database";
import AdminRoute from "./components/RoleProtectedRoute";
import Database_Docs from "./components/Database/Database_Docs";
import Logs from "./components/Audit_Logs/Logs"

function AppContent() {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { loading } = useAuth();

  const isLoginPage = location.pathname === "/login";
  const isTraining = location.pathname === "/training";
  const isQuiz = location.pathname.startsWith("/quiz/");
  const isPublic = isLoginPage || isTraining || isQuiz;

  const isDark = isPublic ? false : darkMode;

  // Only block loading on protected routes
  if (loading && !isPublic) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: isDark ? "#1e1e2f" : "#ffffff",
        }}
      >
        <div>Loading...</div>
      </Box>
    );
  }

  return (
    <ThemeProvider>
      <Box
        className={`min-h-screen ${isDark ? "text-white" : "text-black"}`}
        sx={{
          backgroundColor: isDark ? "#1e1e2f" : "#ffffff",
          transition: "background-color 0.3s ease",
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/quiz/:publicUrl" element={<QuizTemplate />} />
          <Route path="/training" element={<Training />} />

          {/* Protected Standalone Routes */}
          <Route path="/fullscreen-editor" element={<ProtectedRoute><RoleProtectedRoute fallbackPath="/dashboard"><FullScreenEditor /></RoleProtectedRoute></ProtectedRoute>} />
          <Route path="/projects/:projectId/insights/graphview" element={<ProtectedRoute><RoleProtectedRoute fallbackPath="/dashboard"><GraphView /></RoleProtectedRoute></ProtectedRoute>} />
          <Route path="/campaign/:campaignId/graphview" element={<ProtectedRoute><RoleProtectedRoute fallbackPath="/dashboard"><GraphView /></RoleProtectedRoute></ProtectedRoute>} />

          {/* Authenticated Layout Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/campaigns" replace />} />
            {/* Routes accessible to read-only users */}
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaign-results/:id" element={<ResultCampaign />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />

            {/* Routes NOT accessible to read-only users */}
            <Route path="templates" element={<RoleProtectedRoute fallbackPath="/dashboard"><Templates /></RoleProtectedRoute>} />
            <Route path="landing-pages" element={<RoleProtectedRoute fallbackPath="/dashboard"><LandingPages /></RoleProtectedRoute>} />
            <Route path="sending-profiles" element={<RoleProtectedRoute fallbackPath="/dashboard"><SendingProfiles /></RoleProtectedRoute>} />
            <Route path="users-groups" element={<RoleProtectedRoute fallbackPath="/dashboard"><UsersGroups /></RoleProtectedRoute>} />
            <Route path="projects" element={<RoleProtectedRoute fallbackPath="/dashboard"><ProjectPage /></RoleProtectedRoute>} />
            <Route path="clients-user" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="projects/:id" element={<RoleProtectedRoute fallbackPath="/dashboard"><ClientCampaign /></RoleProtectedRoute>} />
            <Route path="campaign/:campaignId/details" element={<RoleProtectedRoute fallbackPath="/dashboard"><CampaignDetails /></RoleProtectedRoute>} />
            <Route path="projects/:projectId/insights" element={<RoleProtectedRoute fallbackPath="/dashboard"><ClientInsights /></RoleProtectedRoute>} />
            <Route path="quizz" element={<RoleProtectedRoute fallbackPath="/dashboard"><Quiz /></RoleProtectedRoute>} />
            <Route path="quizz/new" element={<RoleProtectedRoute fallbackPath="/dashboard"><NewQuiz /></RoleProtectedRoute>} />
            <Route path="quizz/edit/:id" element={<RoleProtectedRoute fallbackPath="/dashboard"><NewQuiz /></RoleProtectedRoute>} />

            <Route
              path="user-management"
              element={
                <RoleProtectedRoute allowRoles={["admin", "superadmin"]} fallbackPath="/dashboard">
                  <UserManagement />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="database"
              element={
                <RoleProtectedRoute allowRoles={["admin", "superadmin"]} fallbackPath="/dashboard">
                  <Database_Collection />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="database/:dbName"
              element={
                <RoleProtectedRoute allowRoles={["admin", "superadmin"]} fallbackPath="/dashboard">
                  <Database_Docs />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/audit-logs"
              element={
                <RoleProtectedRoute allowRoles={["admin", "superadmin"]} fallbackPath="/dashboard">
                  <Logs />
                </RoleProtectedRoute>
              }
            />
          </Route>
        </Routes>

        {/* SuperAdmin specific */}
        <SuperAdminRoutes />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          toastStyle={{
            backgroundColor: isDark ? "#2a2a3b" : "#ffffff",
            color: isDark ? "#ffffff" : "#000000",
            boxShadow: isDark
              ? "0 0 10px rgba(255, 255, 255, 0.1)"
              : "0 0 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            zIndex: 1600,
          }}
          theme={isDark ? "dark" : "light"}
        />
      </Box>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}