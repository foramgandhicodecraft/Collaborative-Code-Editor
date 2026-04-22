// import { Router } from "express";
// import IORedis from "ioredis";
// import { Queue } from "bullmq";
// import { createBullBoard } from "@bull-board/api";
// import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
// import { ExpressAdapter } from "@bull-board/express";

// const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// const redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
// const queue = new Queue("code-execution", { connection: redis });

// const bullAdapter = new ExpressAdapter();
// bullAdapter.setBasePath("/admin/queues");

// createBullBoard({
//   queues: [new BullMQAdapter(queue)],
//   serverAdapter: bullAdapter,
// });

// const router = Router();

// // Bull Board UI
// router.use("/queues", bullAdapter.getRouter());

// // Worker liveness/status (JSON only)
// router.get("/workers", async (_req, res) => {
//   try {
//     const [counts, keys] = await Promise.all([
//       queue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
//       redis.keys("worker:heartbeat:*"),
//     ]);

//     const raw = keys.length ? await redis.mget(keys) : [];
//     const workers = raw
//       .map((s) => {
//         try {
//           return s ? JSON.parse(s) : null;
//         } catch {
//           return null;
//         }
//       })
//       .filter(Boolean)
//       .sort((a, b) => String(a.workerId).localeCompare(String(b.workerId)));

//     res.json({
//       ok: true,
//       aliveWorkers: workers.length,
//       workers,
//       queue: counts,
//       ts: Date.now(),
//     });
//   } catch (err) {
//     res.status(500).json({ ok: false, error: err.message });
//   }
// });

// export default router;

import { Router } from "express";
import IORedis from "ioredis";
import { Queue } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import authRouter from "./admin/auth.js";
import dashboardRouter from "./admin/dashboard.js";
import { adminAuth } from "../middleware/adminAuth.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const queue = new Queue("code-execution", { connection: redis });

const bullAdapter = new ExpressAdapter();
bullAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter: bullAdapter,
});

const router = Router();

// Public auth routes
router.use("/auth", authRouter);

// Protected routes
router.use(adminAuth);
router.use("/", dashboardRouter);
router.use("/queues", bullAdapter.getRouter());

export default router;