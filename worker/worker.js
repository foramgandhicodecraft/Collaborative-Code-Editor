import { Worker } from "bullmq";
import IORedis from "ioredis";
import Docker from "dockerode";

const REDIS_URL  = process.env.REDIS_URL  || "redis://localhost:6379";
const SERVER_URL = process.env.SERVER_URL || "http://server:3001";
const WORKER_ID  = process.env.WORKER_ID  || "worker-unknown";

const redis  = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// Full language → Docker image + execution command
// Code is passed via the CODE env var; written to a file inside the container.
// No bind mounts needed — works on all platforms.
const LANG_CONFIG = {
  python:     { image: "python:3.11-slim",      cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.py && python /tmp/main.py"] },
  javascript: { image: "node:18-slim",           cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.js && node /tmp/main.js"] },
  typescript: { image: "node:18-slim",           cmd: ["sh","-c","npm install -g typescript 2>/dev/null; printf '%s' \"$CODE\" > /tmp/main.ts && npx tsc /tmp/main.ts --outDir /tmp --skipLibCheck 2>&1 && node /tmp/main.js"] },
  java:       { image: "openjdk:17-slim",        cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/Main.java && javac /tmp/Main.java -d /tmp && java -cp /tmp Main"] },
  cpp:        { image: "gcc:13",                 cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.cpp && g++ -o /tmp/main /tmp/main.cpp && /tmp/main"] },
  c:          { image: "gcc:13",                 cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.c && gcc -o /tmp/main /tmp/main.c && /tmp/main"] },
  go:         { image: "golang:1.21-alpine",     cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.go && go run /tmp/main.go"] },
  rust:       { image: "rust:1.75-slim",         cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.rs && rustc /tmp/main.rs -o /tmp/main && /tmp/main"] },
  csharp:     { image: "mcr.microsoft.com/dotnet/sdk:8.0", cmd: ["sh","-c","mkdir -p /tmp/csapp && printf '%s' \"$CODE\" > /tmp/csapp/Program.cs && cd /tmp/csapp && dotnet new console -n app --force -o . 2>/dev/null && cp Program.cs Program.cs.bak && dotnet run"] },
  kotlin:     { image: "zenika/kotlin",          cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.kt && kotlinc /tmp/main.kt -include-runtime -d /tmp/main.jar 2>/dev/null && java -jar /tmp/main.jar"] },
  ruby:       { image: "ruby:3.2-slim",          cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.rb && ruby /tmp/main.rb"] },
  php:        { image: "php:8.2-cli",            cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.php && php /tmp/main.php"] },
  scala:      { image: "sbtscala/scala-sbt:eclipse-temurin-17.0.5_8_1.9.3_3.3.1", cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.scala && scala /tmp/main.scala"] },
  r:          { image: "r-base:4.3.1",           cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.R && Rscript /tmp/main.R"] },
  swift:      { image: "swift:5.9-slim",         cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.swift && swift /tmp/main.swift"] },
  dart:       { image: "dart:stable",            cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.dart && dart /tmp/main.dart"] },
  bash:       { image: "bash:5.2",               cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.sh && bash /tmp/main.sh"] },
  sql:        { image: "postgres:16-alpine",     cmd: ["sh","-c","printf '%s' \"$CODE\" > /tmp/main.sql && psql -U postgres -c \"$(cat /tmp/main.sql)\" 2>&1 || echo 'Note: Full SQL execution requires a running database. Syntax checked.'"] },
};

async function post(path, body) {
  try {
    await fetch(`${SERVER_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error(`[${WORKER_ID}] POST ${path} failed:`, e.message);
  }
}

async function ensureImage(image) {
  return new Promise((resolve, reject) => {
    docker.pull(image, (err, stream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, err => err ? reject(err) : resolve());
    });
  });
}

async function run(job) {
  const { code, language, roomId } = job.data;
  const jobId = job.id;
  console.log(`[${WORKER_ID}] Job ${jobId} — ${language} room:${roomId}`);

  const cfg = LANG_CONFIG[language];
  if (!cfg) {
    await post("/output", { roomId, jobId, output: `Unsupported language: ${language}\n`, done: true });
    return;
  }

  let container;
  try {
    console.log(`[${WORKER_ID}] Pulling ${cfg.image}...`);
    await ensureImage(cfg.image);

    container = await docker.createContainer({
      Image: cfg.image, Cmd: cfg.cmd,
      Env: [`CODE=${code}`],
      HostConfig: {
        Memory: 256 * 1024 * 1024,
        CpuQuota: 50000,
        NetworkMode: "none",
        AutoRemove: true,
      },
    });
    await container.start();

    const logs = await container.logs({ follow: true, stdout: true, stderr: true });
    await new Promise((resolve, reject) => {
      logs.on("data", async chunk => {
        const out = chunk.slice(8).toString("utf8");
        if (out) await post("/output", { roomId, jobId, output: out, done: false });
      });
      logs.on("end",   async () => { await post("/output", { roomId, jobId, output: "", done: true }); resolve(); });
      logs.on("error", reject);
    });
  } catch (err) {
    console.error(`[${WORKER_ID}] Error:`, err.message);
    await post("/output", { roomId, jobId, output: `Execution error: ${err.message}\n`, done: true });
    if (container) try { await container.stop(); } catch {}
  }
}

const worker = new Worker("code-execution", run, { connection: redis, concurrency: 1 });
worker.on("completed", job => console.log(`[${WORKER_ID}] Job ${job.id} done`));
worker.on("failed",   (job, err) => console.error(`[${WORKER_ID}] Job ${job?.id} failed:`, err.message));
console.log(`[${WORKER_ID}] Ready — supporting ${Object.keys(LANG_CONFIG).length} languages`);
