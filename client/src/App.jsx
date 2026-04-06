import React, { useState } from "react";
import { AppProvider } from "./context/AppContext.jsx";
import Lobby from "./pages/Lobby.jsx";
import Editor from "./pages/Editor.jsx";

export default function App() {
  const [page, setPage]     = useState("lobby"); // "lobby" | "editor"
  const [roomCode, setRoomCode] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  function handleJoin({ code, user }) {
    setRoomCode(code);
    setUserInfo(user);
    setPage("editor");
  }

  return (
    <AppProvider>
      {page === "lobby" ? (
        <Lobby onJoin={handleJoin} />
      ) : (
        <Editor roomCode={roomCode} userInfo={userInfo} onLeave={() => setPage("lobby")} />
      )}
    </AppProvider>
  );
}
