import { getRoom, roomUsers, deleteRoom, hasRoom } from "../state/rooms.js";

export function registerRoomHandlers(io, socket, ctx) {
  socket.on("room:join", ({ roomId, name, avatarUrl, color }) => {
    const code = roomId.toUpperCase();
    ctx.currentRoom = code;
    ctx.currentUser = {
      id: socket.id, name: name || "Anonymous",
      avatarUrl: avatarUrl || null, color: color || "#58a6ff",
      lang: "python", typing: false, line: 1,
    };
    socket.join(code);
    const room = getRoom(code);
    room.users.set(socket.id, ctx.currentUser);
    socket.emit("room:joined", {
      roomId: code,
      users:  roomUsers(code),
      chat:   room.chat.slice(-50),
    });
    socket.to(code).emit("room:user-joined", ctx.currentUser);
    io.to(code).emit("room:users", roomUsers(code));
    console.log(`[Room] ${name} joined ${code}`);
  });

  socket.on("disconnect", () => {
    if (!ctx.currentRoom) return;
    const room = getRoom(ctx.currentRoom);
    room.users.delete(socket.id);
    io.to(ctx.currentRoom).emit("room:user-left", socket.id);
    io.to(ctx.currentRoom).emit("room:users", roomUsers(ctx.currentRoom));
    if (room.users.size === 0) {
      setTimeout(() => {
        if (hasRoom(ctx.currentRoom) && getRoom(ctx.currentRoom).users.size === 0) {
          deleteRoom(ctx.currentRoom);
          console.log(`[Room] ${ctx.currentRoom} cleaned up`);
        }
      }, 10 * 60 * 1000);
    }
    console.log(`[Room] ${ctx.currentUser?.name} left ${ctx.currentRoom}`);
  });
}
