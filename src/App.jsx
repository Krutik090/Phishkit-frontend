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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./components/Settings/Settings";
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
 * Custom Toast Component with advanced styling
 */
const CustomToast = ({ type, message, title }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '4px 0'
  }}>
    <div style={{
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      flexShrink: 0,
      marginTop: '2px',
      background: type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                 type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                 type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white'
    }}>
      {type === 'success' ? '✓' : 
       type === 'error' ? '✕' :
       type === 'warning' ? '⚠' : 'ℹ'}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      {title && (
        <div style={{
          fontWeight: '600',
          fontSize: '14px',
          marginBottom: '4px',
          color: 'inherit'
        }}>
          {title}
        </div>
      )}
      <div style={{
        fontSize: '13px',
        lineHeight: '1.4',
        color: 'inherit',
        opacity: title ? 0.9 : 1
      }}>
        {message}
      </div>
    </div>
  </div>
);

/**
 * Enhanced toast methods
 */
export const advancedToast = {
  success: (message, title) => {
    toast.success(<CustomToast type="success" message={message} title={title} />);
  },
  error: (message, title) => {
    toast.error(<CustomToast type="error" message={message} title={title} />);
  },
  warning: (message, title) => {
    toast.warning(<CustomToast type="warning" message={message} title={title} />);
  },
  info: (message, title) => {
    toast.info(<CustomToast type="info" message={message} title={title} />);
  },
  promise: async (promise, messages) => {
    return toast.promise(promise, {
      pending: <CustomToast type="info" message={messages.pending || "Loading..."} />,
      success: <CustomToast type="success" message={messages.success || "Success!"} />,
      error: <CustomToast type="error" message={messages.error || "Something went wrong!"} />
    });
  }
};

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
    <ThemeProvider>
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
              <Route path="/audit-logs" element={<ProtectedRoleRoute allowRoles={["admin", "superadmin"]}><Logs /></ProtectedRoleRoute>} />
              
              {/* Fallback for any unmatched routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>

        {/* Advanced Toast Container with modern styling */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={5}
          toastStyle={{
            background: isDark ? 
              'linear-gradient(135deg, rgba(30, 30, 47, 0.95), rgba(42, 42, 59, 0.95))' : 
              'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
            backdropFilter: 'blur(12px)',
            border: isDark ? 
              '1px solid rgba(255, 255, 255, 0.1)' : 
              '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: '16px',
            boxShadow: isDark ? 
              '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' : 
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: isDark ? '#f1f5f9' : '#334155',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            padding: '16px',
            minHeight: '72px',
            zIndex: 9999,
            marginBottom: '12px',
          }}
          progressStyle={{
            background: 'linear-gradient(135deg, #ec008c, #fc6767)',
            height: '3px',
            borderRadius: '2px',
          }}
          closeButton={({ closeToast }) => (
            <button
              onClick={closeToast}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#94a3b8' : '#64748b',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                e.target.style.color = isDark ? '#f1f5f9' : '#334155';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = isDark ? '#94a3b8' : '#64748b';
              }}
            >
              ×
            </button>
          )}
          style={{
            '--toastify-toast-width': '420px',
          }}
        />

        {/* Custom CSS for additional animations and removing default icons */}
        <style jsx global>{`
          .Toastify__toast {
            animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          
          /* Hide default toast icons */
          .Toastify__toast-icon {
            display: none !important;
          }
          
          .Toastify__toast--success .Toastify__progress-bar {
            background: linear-gradient(135deg, #10b981, #059669) !important;
          }
          
          .Toastify__toast--error .Toastify__progress-bar {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          }
          
          .Toastify__toast--warning .Toastify__progress-bar {
            background: linear-gradient(135deg, #f59e0b, #d97706) !important;
          }
          
          .Toastify__toast--info .Toastify__progress-bar {
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
          }
          
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .Toastify__toast:hover {
            transform: translateY(-2px);
            box-shadow: ${isDark ? 
              '0 25px 30px -5px rgba(0, 0, 0, 0.5), 0 15px 15px -5px rgba(0, 0, 0, 0.3)' : 
              '0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08)'} !important;
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}</style>
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