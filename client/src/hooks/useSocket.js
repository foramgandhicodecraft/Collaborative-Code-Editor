import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SERVER_URL } from "../config/server.js";

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    return () => socketRef.current?.disconnect();
  }, []);

  return socketRef;
}
