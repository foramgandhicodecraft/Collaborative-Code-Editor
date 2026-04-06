import { getRoom } from "../state/rooms.js";

export function registerAwarenessHandlers(io, socket, ctx) {
  socket.on("awareness:update", (data) => {
    if (!ctx.currentRoom || !ctx.currentUser) return;
    Object.assign(ctx.currentUser, {
      typing: data.typing ?? false,
      line:   data.line   ?? 1,
      lang:   data.lang   ?? ctx.currentUser.lang,
      col:    data.col    ?? 1,
    });
    getRoom(ctx.currentRoom).users.set(socket.id, ctx.currentUser);
    socket.to(ctx.currentRoom).emit("awareness:update", ctx.currentUser);
  });
}
