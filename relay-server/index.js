import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import * as Y from "yjs";

const PORT = 1234;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// ─── Redis connection ─────────────────────────────────────────────────────────
const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// ─── BullMQ Queue ─────────────────────────────────────────────────────────────
const executionQueue = new Queue("code-execution", {
  connection: redisConnection,
});

// ─── In-memory store ──────────────────────────────────────────────────────────
// rooms : roomId -> Set<WebSocket>  (all connected clients in that room)
// docs  : roomId -> Y.Doc           (server-side Yjs document replica)
const rooms = new Map();
const docs  = new Map();

function getDoc(roomId) {
  if (!docs.has(roomId)) docs.set(roomId, new Y.Doc());
  return docs.get(roomId);
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  return rooms.get(roomId);
}

// ─── HTTP server ──────────────────────────────────────────────────────────────
// Workers POST execution output here → relay broadcasts it to the room
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/output") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { roomId, output, jobId, done } = JSON.parse(body);
        for (const client of getRoom(roomId)) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "output", jobId, output, done }));
          }
        }
        res.writeHead(200);
        res.end("ok");
      } catch {
        res.writeHead(400);
        res.end("bad request");
      }
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

// ─── WebSocket server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const url    = new URL(req.url, "http://localhost");
  const roomId = url.pathname.slice(1); // "/room-1" -> "room-1"
  const type   = url.searchParams.get("type");

  // ── Path 1: Run command ───────────────────────────────────────────────────
  if (type === "run") {
    getRoom(roomId).add(ws);
    console.log(`[Relay] Run client connected — room: ${roomId}`);

    ws.on("message", async (raw) => {
      let payload;
      try { payload = JSON.parse(raw.toString()); }
      catch { ws.send(JSON.stringify({ error: "Invalid JSON" })); return; }

      const { code, language } = payload;
      if (!code || !language) {
        ws.send(JSON.stringify({ error: "Missing code or language" }));
        return;
      }

      console.log(`[Relay] Run job — room: ${roomId}, lang: ${language}`);
      const job = await executionQueue.add("run", { code, language, roomId });
      console.log(`[Relay] Job ${job.id} queued`);
      ws.send(JSON.stringify({ status: "queued", jobId: job.id }));
    });

    ws.on("close", () => getRoom(roomId).delete(ws));
    return;
  }

  // ── Path 2: Yjs sync ──────────────────────────────────────────────────────
  const doc = getDoc(roomId);
  getRoom(roomId).add(ws);
  console.log(`[Relay] Yjs client connected — room: ${roomId}`);

  // Send the full current document state to the newly connected client
  const state = Y.encodeStateAsUpdate(doc);
  if (state.length > 2) ws.send(state);

  ws.on("message", (data) => {
    try {
      const update = new Uint8Array(data);
      Y.applyUpdate(doc, update); // merge into server-side replica
      // Broadcast to every OTHER client in the room
      for (const client of getRoom(roomId)) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(update);
        }
      }
    } catch (e) {
      console.error("[Relay] Yjs update error:", e.message);
    }
  });

  ws.on("close", () => {
    getRoom(roomId).delete(ws);
    console.log(`[Relay] Yjs client disconnected — room: ${roomId}`);
  });
});

server.listen(PORT, () => {
  console.log(`[Relay] Running on ws://localhost:${PORT}`);
});
