import React, { createContext, useContext, useState, useRef } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme]           = useState("dark");
  const [user, setUser]             = useState(null);   // { name, avatarUrl, color }
  const [room, setRoom]             = useState(null);   // { code }
  const [users, setUsers]           = useState([]);     // active room users
  const [messages, setMessages]     = useState([]);     // chat messages
  const [currentLang, setCurrentLang] = useState("python");
  const [output, setOutput]         = useState([]);
  const [isRunning, setIsRunning]   = useState(false);
  const socketRef = useRef(null);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      user, setUser,
      room, setRoom,
      users, setUsers,
      messages, setMessages,
      currentLang, setCurrentLang,
      output, setOutput,
      isRunning, setIsRunning,
      socketRef,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
