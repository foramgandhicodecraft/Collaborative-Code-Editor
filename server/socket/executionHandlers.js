import { executionQueue } from "../config/redis.js";

export function registerExecutionHandlers(io, socket, ctx) {
  socket.on("execution:run", async ({ code, language }) => {
    if (!ctx.currentRoom) return;
    try {
      const job = await executionQueue.add("run", {
        code, language, roomId: ctx.currentRoom,
      });
      socket.emit("execution:queued", { jobId: job.id });
    } catch (err) {
      socket.emit("execution:output", {
        output: `Queue error: ${err.message}`, done: true,
      });
    }
  });
}
