import { Router } from "express";
import { io } from "../config/server.js";

const router = Router();

router.post("/output", (req, res) => {
  const { roomId, output, jobId, done } = req.body;
  io.to(roomId).emit("execution:output", { jobId, output, done });
  res.json({ ok: true });
});

export default router;
