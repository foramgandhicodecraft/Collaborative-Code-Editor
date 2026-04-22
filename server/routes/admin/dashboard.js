import { Router } from "express";
import IORedis from "ioredis";
import { Queue } from "bullmq";

const router = Router();
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const queue = new Queue("code-execution", { connection: redis });

router.get("/workers", async (_req, res) => {
  try {
    const [counts, keys] = await Promise.all([
      queue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
      redis.keys("worker:heartbeat:*"),
    ]);

    const raw = keys.length ? await redis.mget(keys) : [];
    const workers = raw
      .map((s) => {
        try {
          return s ? JSON.parse(s) : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    res.json({ ok: true, aliveWorkers: workers.length, workers, queue: counts, ts: Date.now() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/queue-stats", async (_req, res) => {
  try {
    const counts = await queue.getJobCounts("waiting", "active", "completed", "failed", "delayed");
    res.json({ ok: true, queue: counts, ts: Date.now() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/jobs", async (req, res) => {
  try {
    const state = String(req.query.state || "active");
    const start = Number(req.query.start || 0);
    const end = Number(req.query.end || 49);
    const allowed = ["waiting", "active", "completed", "failed", "delayed"];

    if (!allowed.includes(state)) {
      return res.status(400).json({ ok: false, error: "Invalid state" });
    }

    const jobs = await queue.getJobs([state], start, end, true);
    res.json({
      ok: true,
      state,
      jobs: jobs.map((j) => ({
        id: j.id,
        name: j.name,
        data: j.data,
        progress: j.progress,
        attemptsMade: j.attemptsMade,
        failedReason: j.failedReason,
        timestamp: j.timestamp,
        processedOn: j.processedOn,
        finishedOn: j.finishedOn,
      })),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;