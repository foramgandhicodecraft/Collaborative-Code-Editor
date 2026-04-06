import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3001";

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
