// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import QuizTemplate from "./components/Quiz_Template/QuizTemplate";
import Campaigns from "./components/Campaign/Campaigns";
import ResultCampaign from "./components/Campaign/ResultCampaign";
import Templates from "./components/Template/Templates";
import LandingPages from "./components/Landing_page/LandingPages";
import SendingProfiles from "./components/Sending Profile/SendingProfiles";
import UsersGroups from "./components/User_Groups/UsersGroups";
import Quiz from "./components/Quiz_Training/Quiz";
import NewQuiz from "./components/Quiz_Training/NewQuiz";
import Settings from "./components/Settings/Settings";
import ClientsPage from "./components/Client/Clients";
import ClientCampaign from "./components/Stats_Results/ClientCampaign";
import ClientInsights from "./components/Stats_Results/ClientInsights";
import CampaignDetails from "./components/Stats_Results/CampaignDetails";
import GraphView from "./components/Stats_Results/GraphView";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public route without layout */}
        <Route path="/quiz/:publicUrl" element={<QuizTemplate />} />

        {/* Admin layout with sidebar */}
        <Route
          path="/*"
          element={
            <>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-6 overflow-auto">
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
                    <Route path="/client/:clientId/insights/graphview" element={<GraphView />} />
                    <Route path="/quiz-training" element={<Quiz />} />
                    <Route path="/quiz-training/new" element={<NewQuiz />} />
                    <Route path="/quiz-training/edit/:id" element={<NewQuiz />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar
                toastStyle={{ zIndex: 1600 }}
              />
            </>
          }
        />
      </Routes>
    </Router>

  );
}
