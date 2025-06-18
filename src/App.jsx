// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import QuizTemplate from "./components/QuizTemplate";
import Campaigns from "./pages/Campaigns";
import Templates from "./pages/Templates";
import LandingPages from "./pages/LandingPages";
import SendingProfiles from "./pages/SendingProfiles";
import UsersGroups from "./pages/UsersGroups";
import Quiz from "./pages/Quiz";
import NewQuiz from "./components/NewQuiz";
import Settings from "./pages/Settings";
import ClientsPage from "./pages/Clients"; 

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/campaigns" replace />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/landing-pages" element={<LandingPages />} />
            <Route path="/sending-profiles" element={<SendingProfiles />} />
            <Route path="/users-groups" element={<UsersGroups />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/quiz-training" element={<Quiz />} />
            <Route path="/quiz-training/new" element={<NewQuiz />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/QuizTemplate/:id" element={<QuizTemplate></QuizTemplate>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
