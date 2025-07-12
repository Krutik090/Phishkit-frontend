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
import QuizTemplate from "./components/Quiz_Template/QuizTemplate";
import Campaigns from "./components/Campaign/Campaigns";
import ResultCampaign from "./components/Campaign/ResultCampaign";
import Templates from "./components/Template/Templates";
import LandingPages from "./components/Landing_page/LandingPages";
import FullScreenEditor from "./components/Landing_page/FullScreenEditor";
import SendingProfiles from "./components/Sending Profile/SendingProfiles";
import UsersGroups from "./components/User_Groups/UsersGroups";
import Quiz from "./components/Quiz/Quiz";
import NewQuiz from "./components/Quiz/NewQuiz";
import Training from "./components/Training/Training";
import Settings from "./components/Settings/Settings";
import ClientsPage from "./components/Client/Clients";
import ClientCampaign from "./components/Stats_Results/ClientCampaign";
import ClientInsights from "./components/Stats_Results/ClientInsights";
import CampaignDetails from "./components/Stats_Results/CampaignDetails";
import GraphView from "./components/Stats_Results/GraphView";
import Login from "./components/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard/Dashboard";
import "./components/Dashboard/dashboard.css";

import SupportChatBot from "./components/chatbot/SupportChatBot"; // ✅ Chatbot
import User_Client from "./components/User_Clients/User_Client";

function AppContent() {
  const location = useLocation();
  const { darkMode } = useTheme();

  const isLoginPage = location.pathname === "/login";
  const isDark = isLoginPage ? false : darkMode;

  return (
    <Box
      className={`min-h-screen ${isDark ? "text-white" : "text-black"}`}
      sx={{
        backgroundColor: isDark ? "#1e1e2f" : "#ffffff",
        transition: "background-color 0.3s ease",
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/quiz/:publicUrl" element={<QuizTemplate />} />
        <Route path="/training" element={<Training />} />
        <Route path="/fullscreen-editor" element={<ProtectedRoute><FullScreenEditor /></ProtectedRoute>} />
        <Route path="/client/:clientId/insights/graphview" element={<ProtectedRoute><GraphView /></ProtectedRoute>} />
        <Route path="/campaign/:campaignId/graphview" element={<ProtectedRoute><GraphView /></ProtectedRoute>} />

        {/* Main Layout with Sidebar */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/campaigns" replace />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaign-results/:id" element={<ResultCampaign />} />
          <Route path="templates" element={<Templates />} />
          <Route path="landing-pages" element={<LandingPages />} />
          <Route path="sending-profiles" element={<SendingProfiles />} />
          <Route path="users-groups" element={<UsersGroups />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients-user" element={<AdminRoute><User_Client /></AdminRoute>} />
          <Route path="clients/:clientId" element={<ClientCampaign />} />
          <Route path="campaign/:campaignId/details" element={<CampaignDetails />} />
          <Route path="client/:clientId/insights" element={<ClientInsights />} />
          <Route path="quizz" element={<Quiz />} />
          <Route path="quizz/new" element={<NewQuiz />} />
          <Route path="quizz/edit/:id" element={<NewQuiz />} />
          <Route path="settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>

      {/* ✅ Global Chatbot - available on all screens */}
      <SupportChatBot />

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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
