import React, { useContext, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import Profile from "./pages/Profile";
import PaymentPage from "./pages/PaymentPage";
import HotOutreach from "./pages/HotOutreach";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import MeetingPage from "./pages/MeetingPage";

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

const App: React.FC = () => {
  const { authUser } = useContext(AuthContext) as { authUser: AuthUser | null };
  const [isDark, setIsDark] = useState<boolean>(false);

  return (
    <div className="bg-[url('/background.svg')] bg-contain min-h-screen">
      <Toaster />

      <Routes>
        {/* Public route */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth-required routes */}
        <Route
          path="/dashboard"
          element={
            authUser ? (
              <Dashboard isDark={isDark} setIsDark={setIsDark} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/explore"
          element={
            authUser ? (
              <PaymentPage isDark={isDark} setIsDark={setIsDark} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
          <Route
          path="/video"
          element={
            authUser ? (
              <MeetingPage isDark={isDark} setIsDark={setIsDark} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/chat"
          element={
            authUser ? (
              <ChatPage isDark={isDark} setIsDark={setIsDark} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/outreach"
          element={
            authUser ? (
              <HotOutreach isDark={isDark} setIsDark={setIsDark} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login (only when not logged in) */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />

        {/* Profile Page */}
        <Route
          path="/profile"
          element={
            authUser ? <Profile isDark={isDark} setIsDark={setIsDark} /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
