import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/quiz/:publicUrl" element={<QuizTemplate />} />
        {/* ✅ New Training Route */}
        <Route path="/training" element={<Training />} />

        {/* ✅ Protected Route without Sidebar (fullscreen editor) */}
        <Route
          path="/fullscreen-editor"
          element={
            <ProtectedRoute>
              <FullScreenEditor />
            </ProtectedRoute>
          }
        />

        {/* ✅ Protected Routes without Sidebar (GraphView) */}
        <Route
          path="/client/:clientId/insights/graphview"
          element={
            <ProtectedRoute>
              <GraphView />
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar toastStyle={{ zIndex: 1600 }} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:campaignId/graphview"
          element={
            <ProtectedRoute>
              <GraphView />
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar toastStyle={{ zIndex: 1600 }} />
            </ProtectedRoute>
          }
        />

        {/* ✅ Protected Routes with Sidebar */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
               <main className="flex-1 p-6 overflow-auto ml-[250px]">
                  <Routes>
                    <Route path="/" element={<Navigate to="/campaigns" replace />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/campaign-results/:id" element={<ResultCampaign />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/landing-pages" element={<LandingPages />} />
                    <Route path="/sending-profiles" element={<SendingProfiles />} />
                    <Route path="/users-groups" element={<UsersGroups />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/clients/:clientId" element={<ClientCampaign />} />
                    <Route path="/campaign/:campaignId/details" element={<CampaignDetails />} />
                    <Route path="/client/:clientId/insights" element={<ClientInsights />} />

                    {/* ✅ Updated paths */}
                    <Route path="/quizz" element={<Quiz />} />
                    <Route path="/quizz/new" element={<NewQuiz />} />
                    <Route path="/quizz/edit/:id" element={<NewQuiz />} />

                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>

              {/* ✅ Toast Notifications */}
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar toastStyle={{ zIndex: 1600 }} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
