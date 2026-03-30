import { Worker } from "bullmq";
import IORedis from "ioredis";
import Docker from "dockerode";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const RELAY_URL = process.env.RELAY_URL || "http://relay:1234";
const WORKER_ID = process.env.WORKER_ID || "worker-unknown";

const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// Code is passed as the CODE env var into the container.
// The container's cmd writes it to a file internally and runs it.
// This avoids bind mounts entirely — no Windows path issues.
const LANGUAGE_CONFIG = {
  python: {
    image: "python:3.11-slim",
    cmd: ["sh", "-c", "printf '%s' \"$CODE\" > /tmp/main.py && python /tmp/main.py"],
  },
  javascript: {
    image: "node:18-slim",
    cmd: ["sh", "-c", "printf '%s' \"$CODE\" > /tmp/main.js && node /tmp/main.js"],
  },
  java: {
    image: "openjdk:17-slim",
    cmd: ["sh", "-c", "printf '%s' \"$CODE\" > /tmp/Main.java && javac /tmp/Main.java -d /tmp && java -cp /tmp Main"],
  },
};

async function sendOutputToRelay(roomId, jobId, output, done = false) {
  try {
    await fetch(`${RELAY_URL}/output`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, jobId, output, done }),
    });
  } catch (e) {
    console.error(`[${WORKER_ID}] Failed to send output:`, e.message);
  }
}

async function ensureImage(image) {
  return new Promise((resolve, reject) => {
    docker.pull(image, (err, stream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

async function executeCode(job) {
  const { code, language, roomId } = job.data;
  const jobId = job.id;

  console.log(`[${WORKER_ID}] Job ${jobId} — lang: ${language}, room: ${roomId}`);

  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    await sendOutputToRelay(roomId, jobId, `Error: unsupported language "${language}"`, true);
    return;
  }

  let container;

  try {
    console.log(`[${WORKER_ID}] Ensuring image: ${config.image}`);
    await ensureImage(config.image);

    container = await docker.createContainer({
      Image: config.image,
      Cmd: config.cmd,
      Env: [`CODE=${code}`],
      HostConfig: {
        Memory: 128 * 1024 * 1024,
        CpuQuota: 50000,
        NetworkMode: "none",
        AutoRemove: true,
      },
    });

    await container.start();
    console.log(`[${WORKER_ID}] Container started`);

    const logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    await new Promise((resolve, reject) => {
      logStream.on("data", async (chunk) => {
        const output = chunk.slice(8).toString("utf8");
        if (output) await sendOutputToRelay(roomId, jobId, output, false);
      });
      logStream.on("end", async () => {
        await sendOutputToRelay(roomId, jobId, "", true);
        resolve();
      });
      logStream.on("error", reject);
    });

    console.log(`[${WORKER_ID}] Job ${jobId} complete`);

  } catch (err) {
    console.error(`[${WORKER_ID}] Job ${jobId} error:`, err.message);
    await sendOutputToRelay(roomId, jobId, `Execution error: ${err.message}`, true);
    if (container) {
      try { await container.stop(); } catch {}
    }
  }
}

const worker = new Worker("code-execution", executeCode, {
  connection: redisConnection,
  concurrency: 1,
});

worker.on("completed", (job) => console.log(`[${WORKER_ID}] Job ${job.id} complete`));
worker.on("failed", (job, err) => console.error(`[${WORKER_ID}] Job ${job?.id} failed:`, err.message));

console.log(`[${WORKER_ID}] Listening on queue "code-execution"...`);
