import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppProvider } from "./context/AppContext.jsx";
import Lobby from "./pages/Lobby.jsx";
import Editor from "./pages/Editor.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminRoute from "./guards/AdminRoute.jsx";

function MainAppShell() {
  const [page, setPage] = useState("lobby"); // "lobby" | "editor"
  const [roomCode, setRoomCode] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  function handleJoin({ code, user }) {
    setRoomCode(code);
    setUserInfo(user);
    setPage("editor");
  }

  return page === "lobby" ? (
    <Lobby onJoin={handleJoin} />
  ) : (
    <Editor roomCode={roomCode} userInfo={userInfo} onLeave={() => setPage("lobby")} />
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Existing client app remains here */}
          <Route path="/" element={<MainAppShell />} />

          {/* Admin only */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Any unknown path -> keep client safe */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}