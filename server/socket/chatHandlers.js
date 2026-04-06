import { nanoid } from "nanoid";
import { getRoom } from "../state/rooms.js";

export function registerChatHandlers(io, socket, ctx) {
  socket.on("chat:send", ({ text }) => {
    if (!ctx.currentRoom || !ctx.currentUser || !text?.trim()) return;
    const message = {
      id:        nanoid(),
      userId:    socket.id,
      name:      ctx.currentUser.name,
      avatarUrl: ctx.currentUser.avatarUrl,
      color:     ctx.currentUser.color,
      text:      text.slice(0, 500),
      time:      Date.now(),
    };
    const room = getRoom(ctx.currentRoom);
    room.chat.push(message);
    if (room.chat.length > 200) room.chat.shift();
    io.to(ctx.currentRoom).emit("chat:message", message);
  });
}
