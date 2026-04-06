import { executionQueue } from "../config/redis.js";

export function registerExecutionHandlers(io, socket, ctx) {
  socket.on("execution:run", async ({ code, language }) => {
    if (!ctx.currentRoom) return;
    try {
      io.to(ctx.currentRoom).emit("execution:started", {
        runnerName: ctx.currentUser?.name || "Anonymous",
        language,
      });
      const job = await executionQueue.add("run", {
        code, language, roomId: ctx.currentRoom,
        runnerName: ctx.currentUser?.name || "Anonymous",
      });
      socket.emit("execution:queued", { jobId: job.id });
    } catch (err) {
      socket.emit("execution:output", {
        output: `Queue error: ${err.message}`, done: true,
      });
    }
  });
}