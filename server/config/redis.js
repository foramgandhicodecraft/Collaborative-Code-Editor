import IORedis from "ioredis";
import { Queue } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis          = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const executionQueue = new Queue("code-execution", { connection: redis });

export { redis, executionQueue };
