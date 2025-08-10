import React, { Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  BrowserRouter,
} from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AdminRoute from "./components/RoleProtectedRoute";

import { ColorThemeProvider  } from "./components/Settings/Settings";
import { ToastProvider } from "./utils/toast";
import "./components/Dashboard/dashboard.css";

// Lazy-loaded components
const Login = lazy(() => import("./components/Login/Login"));
const QuizTemplate = lazy(() => import("./components/Quiz_Template/QuizTemplate"));
const Training = lazy(() => import("./components/Training/Training"));
const FullScreenEditor = lazy(() => import("./components/Landing_page/FullScreenEditor"));
const GraphView = lazy(() => import("./components/Stats_Results/GraphView"));
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const AdvancedDashboard = lazy(() => import("./components/NewDashboard/AdvancedDashboard"));
const Campaigns = lazy(() => import("./components/Campaign/Campaigns"));
const ResultCampaign = lazy(() => import("./components/Result_Camapaigns/ResultCampaign"));
const Templates = lazy(() => import("./components/Template/Templates"));
const LandingPages = lazy(() => import("./components/Landing_page/LandingPages"));
const SendingProfiles = lazy(() => import("./components/Sending Profile/SendingProfiles"));
const UsersGroups = lazy(() => import("./components/User_Groups/UsersGroups"));
const Quiz = lazy(() => import("./components/Quiz/Quiz"));
const NewQuiz = lazy(() => import("./components/Quiz/NewQuiz"));
const Settings = lazy(() => import("./components/Settings/Settings"));
const ProjectPage = lazy(() => import("./components/Project/Projects"));
const ClientCampaign = lazy(() => import("./components/Stats_Results/ClientCampaign"));
const ClientInsights = lazy(() => import("./components/Stats_Results/ClientInsights"));
const CampaignDetails = lazy(() => import("./components/Stats_Results/CampaignDetails"));
const UserManagement = lazy(() => import("./components/User_Management/UserManagement"));
const Database_Collection = lazy(() => import("./components/Database/Database"));
const Database_Docs = lazy(() => import("./components/Database/Database_Docs"));
const Logs = lazy(() => import("./components/Audit_Logs/Logs"));

/**
 * A full-screen loader component to be used as a fallback for Suspense
 * and for the initial authentication check.
 */
const FullScreenLoader = ({ isDark }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: isDark ? "#1e1e2f" : "#ffffff",
    }}
  >
    <CircularProgress />
  </Box>
);

/**
 * A helper component to reduce nesting for protected routes that also require role checks.
 */
const ProtectedRoleRoute = ({ children, allowRoles, fallbackPath = "/dashboard" }) => (
    <ProtectedRoute>
        <RoleProtectedRoute allowRoles={allowRoles} fallbackPath={fallbackPath}>
            {children}
        </RoleProtectedRoute>
    </ProtectedRoute>
);

function AppContent() {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { loading: isAuthLoading } = useAuth();

  const isPublicRoute = ["/login", "/training"].includes(location.pathname) || location.pathname.startsWith("/quiz/");
  const isDark = isPublicRoute ? false : darkMode;

  // Show a full-screen loader during the initial authentication check on protected routes.
  if (isAuthLoading && !isPublicRoute) {
    return <FullScreenLoader isDark={isDark} />;
  }

  return (
    <ColorThemeProvider>
      <ToastProvider darkMode={isDark}>
        <Box
          className={`min-h-screen ${isDark ? "text-white" : "text-black"}`}
          sx={{
            backgroundColor: isDark ? "#1e1e2f" : "#ffffff",
            transition: "background-color 0.3s ease",
          }}
        >
          {/* Suspense handles the loading state for our lazy-loaded route components */}
          <Suspense fallback={<FullScreenLoader isDark={isDark} />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/quiz/:publicUrl" element={<QuizTemplate />} />
              <Route path="/training" element={<Training />} />

              {/* Standalone Protected Routes (not using the main layout) */}
              <Route path="/fullscreen-editor" element={<ProtectedRoleRoute><FullScreenEditor /></ProtectedRoleRoute>} />
              <Route path="/projects/:projectId/insights/graphview" element={<ProtectedRoleRoute><GraphView /></ProtectedRoleRoute>} />
              <Route path="/campaign/:campaignId/graphview" element={<ProtectedRoleRoute><GraphView /></ProtectedRoleRoute>} />
              
              {/* Authenticated Routes with Main Layout */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/campaigns" replace />} />
                
                {/* General Access Routes */}
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="campaign-results/:id" element={<ResultCampaign />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="projects" element={<ProjectPage />} />
                <Route path="projects/:id" element={<ClientCampaign />} />
                <Route path="campaign/:campaignId/details" element={<CampaignDetails />} />
                <Route path="projects/:projectId/insights" element={<ClientInsights />} />
                <Route path="AdvancedDashboard" element={<AdvancedDashboard />} />

                {/* Role-Protected Routes (Read-Only users cannot access) */}
                <Route path="templates" element={<RoleProtectedRoute fallbackPath="/dashboard"><Templates /></RoleProtectedRoute>} />
                <Route path="landing-pages" element={<RoleProtectedRoute fallbackPath="/dashboard"><LandingPages /></RoleProtectedRoute>} />
                <Route path="sending-profiles" element={<RoleProtectedRoute fallbackPath="/dashboard"><SendingProfiles /></RoleProtectedRoute>} />
                <Route path="users-groups" element={<RoleProtectedRoute fallbackPath="/dashboard"><UsersGroups /></RoleProtectedRoute>} />
                <Route path="quizz" element={<RoleProtectedRoute fallbackPath="/dashboard"><Quiz /></RoleProtectedRoute>} />
                <Route path="quizz/new" element={<RoleProtectedRoute fallbackPath="/dashboard"><NewQuiz /></RoleProtectedRoute>} />
                <Route path="quizz/edit/:id" element={<RoleProtectedRoute fallbackPath="/dashboard"><NewQuiz /></RoleProtectedRoute>} />

                {/* Admin & SuperAdmin Routes */}
                <Route path="clients-user" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="user-management" element={<ProtectedRoleRoute allowRoles={["admin", "superadmin"]}><UserManagement /></ProtectedRoleRoute>} />
                <Route path="database" element={<ProtectedRoleRoute allowRoles={["admin", "superadmin"]}><Database_Collection /></ProtectedRoleRoute>} />
                <Route path="database/:dbName" element={<ProtectedRoleRoute allowRoles={["admin", "superadmin"]}><Database_Docs /></ProtectedRoleRoute>} />
                <Route path="audit-logs" element={<ProtectedRoleRoute allowRoles={["admin", "superadmin"]}><Logs /></ProtectedRoleRoute>} />
                
                {/* Fallback for any unmatched routes */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </Box>
      </ToastProvider>
    </ColorThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}