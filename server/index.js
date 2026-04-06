import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import * as Y from "yjs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";

const PORT      = process.env.PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// ─── Cloudinary ───────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Redis + BullMQ ───────────────────────────────────────────────────────────
const redis          = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const executionQueue = new Queue("code-execution", { connection: redis });

// ─── AI config ────────────────────────────────────────────────────────────────
// Works with OpenAI, Groq, Azure OpenAI, or any OpenAI-compatible API.
// Base URL defaults to OpenAI; override with OPENAI_BASE_URL for Groq etc.
const AI_API_KEY  = process.env.OPENAI_API_KEY || "";
const AI_BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const AI_MODEL    = process.env.AI_MODEL || "gpt-4o-mini";
const AI_ENABLED  = !!AI_API_KEY;

console.log(`[AI] ${AI_ENABLED ? `enabled — model: ${AI_MODEL}, base: ${AI_BASE_URL}` : "disabled (no OPENAI_API_KEY)"}`);

const AI_SYSTEM = `You are an expert coding assistant embedded inside CollabCode, a real-time collaborative code editor.
Help developers understand, debug, improve, and write code.
When given code context, refer to it specifically.
Be concise but thorough. Format code with proper indentation.
Use plain language — no excessive markdown outside of code blocks.`;

// ─── Express + Socket.IO ──────────────────────────────────────────────────────
const app    = express();
const server = createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 5e6,
});

// ─── Room state ───────────────────────────────────────────────────────────────
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { users: new Map(), docs: new Map(), chat: [] });
  }
  return rooms.get(roomId);
}

function getLangDoc(room, lang) {
  if (!room.docs.has(lang)) room.docs.set(lang, new Y.Doc());
  return room.docs.get(lang);
}

function roomUsers(roomId) {
  return Array.from(getRoom(roomId).users.values());
}

// ─── Multer ───────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ─── HTTP Routes ──────────────────────────────────────────────────────────────

app.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "collabcode-avatars", transformation: [{ width: 128, height: 128, crop: "fill" }] },
        (err, r) => { if (err) reject(err); else resolve(r); }
      );
      stream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("[Upload]", err.message);
    res.status(500).json({ error: "Upload failed", url: null });
  }
});

app.get("/room/:code", (req, res) => {
  const code   = req.params.code.toUpperCase();
  const exists = rooms.has(code) && getRoom(code).users.size > 0;
  res.json({ exists });
});

app.post("/create-room", (req, res) => {
  const code = nanoid(6).toUpperCase();
  getRoom(code);
  res.json({ code });
});

app.post("/output", (req, res) => {
  const { roomId, output, jobId, done } = req.body;
  io.to(roomId).emit("execution:output", { jobId, output, done });
  res.json({ ok: true });
});

// ── AI Chat ───────────────────────────────────────────────────────────────────
// All AI calls happen server-side. API key never reaches the browser.
// Uses plain fetch to the OpenAI-compatible /chat/completions endpoint.
// Works with: OpenAI, Groq, Azure OpenAI, Mistral, local Ollama, etc.
app.post("/ai/chat", async (req, res) => {
  if (!AI_ENABLED) {
    return res.status(503).json({
      error: "AI not configured. Add OPENAI_API_KEY to your .env file and restart Docker.",
    });
  }

  const { history = [], message, code = "", language = "code" } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Build messages array for the chat completions API
  const messages = [{ role: "system", content: AI_SYSTEM }];

  // Inject editor code as context if present
  if (code.trim()) {
    messages.push({
      role: "system",
      content: `The user is currently editing this ${language} code:\n\`\`\`${language}\n${code.slice(0, 3000)}\n\`\`\``,
    });
  }

  // Add conversation history (last 10 turns to stay within token limits)
  for (const turn of history.slice(-10)) {
    if (turn.role === "user" || turn.role === "assistant") {
      messages.push({ role: turn.role, content: turn.content });
    }
  }

  // Add the new user message
  messages.push({ role: "user", content: message });

  try {
    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model:       AI_MODEL,
        messages,
        max_tokens:  2048,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI] API error:", response.status, errText);
      return res.status(502).json({ error: `AI API error ${response.status}: ${errText.slice(0, 200)}` });
    }

    const data   = await response.json();
    const answer = data?.choices?.[0]?.message?.content || "No response from AI.";
    res.json({ answer });

  } catch (err) {
    console.error("[AI] fetch error:", err.message);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  let currentRoom = null;
  let currentUser = null;

  socket.on("room:join", ({ roomId, name, avatarUrl, color }) => {
    const code = roomId.toUpperCase();
    currentRoom = code;
    currentUser = {
      id: socket.id, name: name || "Anonymous",
      avatarUrl: avatarUrl || null, color: color || "#58a6ff",
      lang: "python", typing: false, line: 1,
    };
    socket.join(code);
    const room = getRoom(code);
    room.users.set(socket.id, currentUser);
    socket.emit("room:joined", {
      roomId: code,
      users:  roomUsers(code),
      chat:   room.chat.slice(-50),
    });
    socket.to(code).emit("room:user-joined", currentUser);
    io.to(code).emit("room:users", roomUsers(code));
    console.log(`[Room] ${name} joined ${code}`);
  });

  socket.on("yjs:update", ({ lang, update }) => {
    if (!currentRoom) return;
    const doc = getLangDoc(getRoom(currentRoom), lang);
    Y.applyUpdate(doc, new Uint8Array(update));
    socket.to(currentRoom).emit("yjs:update", { lang, update });
  });

  socket.on("yjs:request-state", ({ lang }) => {
    if (!currentRoom) return;
    const doc   = getLangDoc(getRoom(currentRoom), lang);
    const state = Y.encodeStateAsUpdate(doc);
    socket.emit("yjs:state", { lang, state: Array.from(state) });
  });

  socket.on("awareness:update", (data) => {
    if (!currentRoom || !currentUser) return;
    Object.assign(currentUser, {
      typing: data.typing ?? false,
      line:   data.line   ?? 1,
      lang:   data.lang   ?? currentUser.lang,
      col:    data.col    ?? 1,
    });
    getRoom(currentRoom).users.set(socket.id, currentUser);
    socket.to(currentRoom).emit("awareness:update", currentUser);
  });

  socket.on("chat:send", ({ text }) => {
    if (!currentRoom || !currentUser || !text?.trim()) return;
    const message = {
      id:        nanoid(),
      userId:    socket.id,
      name:      currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      color:     currentUser.color,
      text:      text.slice(0, 500),
      time:      Date.now(),
    };
    const room = getRoom(currentRoom);
    room.chat.push(message);
    if (room.chat.length > 200) room.chat.shift();
    io.to(currentRoom).emit("chat:message", message);
  });

  socket.on("execution:run", async ({ code, language }) => {
    if (!currentRoom) return;
    try {
      const job = await executionQueue.add("run", {
        code, language, roomId: currentRoom,
      });
      socket.emit("execution:queued", { jobId: job.id });
    } catch (err) {
      socket.emit("execution:output", {
        output: `Queue error: ${err.message}`, done: true,
      });
    }
  });

  socket.on("disconnect", () => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.users.delete(socket.id);
    io.to(currentRoom).emit("room:user-left", socket.id);
    io.to(currentRoom).emit("room:users", roomUsers(currentRoom));
    if (room.users.size === 0) {
      setTimeout(() => {
        if (rooms.has(currentRoom) && getRoom(currentRoom).users.size === 0) {
          rooms.delete(currentRoom);
          console.log(`[Room] ${currentRoom} cleaned up`);
        }
      }, 10 * 60 * 1000);
    }
    console.log(`[Room] ${currentUser?.name} left ${currentRoom}`);
  });
});

server.listen(PORT, () => console.log(`[Server] Running on :${PORT}`));
