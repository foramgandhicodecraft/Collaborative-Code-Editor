import { io } from "../config/server.js";
import { registerRoomHandlers }      from "./roomHandlers.js";
import { registerYjsHandlers }       from "./yjsHandlers.js";
import { registerAwarenessHandlers } from "./awarenessHandlers.js";
import { registerChatHandlers }      from "./chatHandlers.js";
import { registerExecutionHandlers } from "./executionHandlers.js";

export function registerSocket(server) {
  io.on("connection", (socket) => {
    // Shared mutable context per socket connection
    const ctx = { currentRoom: null, currentUser: null };

    registerRoomHandlers(io, socket, ctx);
    registerYjsHandlers(io, socket, ctx);
    registerAwarenessHandlers(io, socket, ctx);
    registerChatHandlers(io, socket, ctx);
    registerExecutionHandlers(io, socket, ctx);
  });
}
