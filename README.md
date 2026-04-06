# CollabCode

> A production-ready, real-time collaborative code editor with AI assistance, room-based sessions, multi-language execution, and live chat - built on a fully distributed architecture.

---



## Overview

CollabCode is a collaborative coding platform where multiple users join a shared room using a 6-character code and edit code together in real time. Users can chat with each other, run code in isolated Docker containers, and get individual AI coding assistance without leaving the editor.

The system is a genuinely distributed application: the server, Redis, and worker nodes are independent services that can run on separate machines on the same network.

---

## Features

| Feature | Description |
|---|---|
| Room-based sessions | Create a room and get a unique 6-character code. Share it with teammates to collaborate |
| Real-time collaborative editing | Multiple users edit code simultaneously with full conflict resolution via Yjs CRDT |
| Cursor presence | Google Docs-style colored name labels appear at each user's cursor position |
| Per-language code state | Each of the 18 languages maintains its own independent code — switching never overwrites |
| Isolated code execution | Code runs in Docker containers with strict CPU and memory limits |
| Fault-tolerant execution | BullMQ job queue with Redis — if a worker crashes, jobs are automatically retried |
| Room chat | WhatsApp-style real-time messaging visible to all users in the room |
| AI Assistant | Personal AI coding assistant with your current code as context. Private per user |
| User profiles | Name and profile picture uploaded to Cloudinary. Initials avatar as fallback |
| 18 programming languages | Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, C#, Kotlin, Swift, Ruby, PHP, Scala, R, Dart, Bash, SQL |
| Dark / Light theme | Full theme support across all panels and the Monaco editor |
| Distributed architecture | Each component (server, Redis, workers) can run on a separate machine |

---

## Tech Stack

### Backend — Server

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.x | HTTP server and REST API routes |
| Socket.IO | 4.x | Real-time bidirectional communication for editing, chat, and awareness |
| Yjs | 13.x | CRDT library — the core engine of real-time collaborative editing |
| BullMQ | 4.x | Distributed job queue for fault-tolerant code execution |
| IORedis | 5.x | Redis client — powers BullMQ queue state |
| Multer | 1.x | Multipart file upload handling for profile pictures |
| Cloudinary SDK | 1.x | Cloud storage and transformation for profile pictures |
| Nanoid | 5.x | Cryptographically secure room code generation |
| CORS | 2.x | Cross-origin resource sharing middleware |

### Backend — Worker

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| BullMQ | 4.x | Pulls execution jobs from the Redis queue |
| IORedis | 5.x | Redis connection for BullMQ |
| Dockerode | 4.x | Node.js client for Docker Engine — creates and manages execution containers |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker | Containerises every service and provides isolated execution environments for user code |
| Docker Compose | Orchestrates all services (Redis, server, 3 workers) with one command |
| Redis 7 | Persistent message broker and job queue storage (AOF persistence enabled) |
| Docker Hub | Language runtime images pulled on demand (python, node, gcc, golang, rust, openjdk, etc.) |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI component framework |
| Vite | 5.x | Development server and production build tool |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| Monaco Editor | 0.44.x | The same editor that powers VS Code — full syntax highlighting for all 18 languages |
| @monaco-editor/react | 4.x | React wrapper for Monaco Editor |
| Socket.IO Client | 4.x | Real-time communication with the server |
| Yjs | 13.x | Client-side CRDT document management and update encoding |
| clsx | 2.x | Conditional CSS class names utility |
| nanoid | 5.x | Client-side unique ID generation |

### AI Assistant

| Technology | Purpose |
|---|---|
| Groq API (recommended) | Free, fast inference — supports Llama 3, Mixtral, Gemma |
| OpenAI API (alternative) | GPT-4o-mini, GPT-4o |
| Any OpenAI-compatible API | Azure OpenAI, Mistral, local Ollama — set via OPENAI_BASE_URL |
| Native fetch | All AI calls are server-side HTTP — no SDK dependency, no CORS issues, API key never exposed |

### External Services

| Service | Free Tier | Purpose |
|---|---|---|
| Cloudinary | Yes (25 GB storage) | Profile picture upload, storage, and transformation |
| Groq | Yes (rate-limited) | Fast AI inference for the coding assistant |

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       CLIENT BROWSER                           │
│                                                                │
│  Monaco Editor    Chat Panel      AI Assistant Panel           │
│  (Yjs CRDT)       (Socket.IO)     (fetch to /ai/chat)         │
│       │                │                                       │
│       └────────┬───────┘                                       │
└────────────────┼───────────────────────────────────────────────┘
                 │ WebSocket (Socket.IO)
                 ▼
┌────────────────────────────────────────┐
│           SERVER  :3001                │
│                                        │
│  Express HTTP  +  Socket.IO            │
│                                        │
│  /upload-avatar  →  Cloudinary         │
│  /create-room    →  nanoid             │
│  /ai/chat        →  Groq / OpenAI      │
│  /output         ←  Worker nodes       │
│                                        │
│  Yjs docs (per room, per language)     │
│  Room state (users, chat history)      │
└──────────┬─────────────────────────────┘
           │ BullMQ push job
           ▼
┌────────────────────────────────────────┐
│           REDIS  :6379                 │
│                                        │
│  BullMQ queue state                    │
│  Pending / active / completed jobs     │
│  AOF persistence (survives restarts)   │
└──────────┬─────────────────────────────┘
           │ BullMQ pull job (3 workers)
           ▼
┌────────────────────────────────────────┐
│        WORKER NODE (x3)                │
│                                        │
│  Pulls one job at a time from BullMQ   │
│  Creates Docker container via Dockerode│
│  Streams stdout to POST /output        │
│  Container auto-removed after exec     │
└──────────┬─────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│          DOCKER ENGINE                 │
│                                        │
│  python:3.11-slim    node:18-slim      │
│  gcc:13              golang:1.21-alpine│
│  rust:1.75-slim      openjdk:17-slim   │
│  ruby:3.2-slim       php:8.2-cli  ...  │
│                                        │
│  256MB RAM limit  •  50% CPU limit     │
│  No network access  •  Auto-removed    │
└────────────────────────────────────────┘
```

---

## Project Structure

```
collabcode/
├── docker-compose.yml              Orchestrates all services
├── .env.example                    Template for environment variables
├── README.md
│
├── server/                         Node.js + Express + Socket.IO server
│   ├── index.js                    All routes + Socket.IO events + AI endpoint
│   ├── package.json
│   └── Dockerfile
│
├── worker/                         BullMQ worker — code execution
│   ├── worker.js                   Docker execution logic for all 18 languages
│   ├── package.json
│   └── Dockerfile
│
└── client/                         React 18 + Tailwind CSS frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx                React entry point
        ├── App.jsx                 Root — lobby vs editor routing
        ├── index.css               Tailwind base + custom animations
        ├── context/
        │   └── AppContext.jsx      Global state (theme, user, room)
        ├── hooks/
        │   ├── useYjs.js           Per-language Yjs document management
        │   └── useSocket.js        Socket.IO connection hook
        ├── pages/
        │   ├── Lobby.jsx           Room creation and join screen
        │   └── Editor.jsx          Main editor — wires all components
        └── components/
            ├── Toolbar.jsx         Top bar — language, run, chat, AI, theme
            ├── CodeEditor.jsx      Monaco Editor wrapper
            ├── OutputPanel.jsx     Resizable execution output panel
            ├── ChatPanel.jsx       WhatsApp-style room chat
            ├── UsersSidebar.jsx    Active users with typing indicators
            └── AiPanel.jsx         Personal AI assistant panel
```

---

## Distributed System Design

CollabCode is built as a genuinely distributed system with these properties.

**Document state is replicated across all clients.**
Every connected client holds a full replica of the shared Yjs document. There is no single source of truth for the document content. The server holds a replica only to sync new joiners. If the server restarts, clients reconnect and re-sync their local state.

**Execution is distributed across worker nodes.**
Three separate worker processes pull jobs from the BullMQ queue independently. If one worker crashes mid-execution, BullMQ automatically re-queues the job and another worker picks it up. Workers can run on completely separate machines.

**Redis is the distributed backbone.**
BullMQ uses Redis as its persistent store for queue state. Pending jobs survive server and worker restarts because Redis AOF persistence is enabled. Redis is the single shared component between all worker nodes.

**Fault tolerance summary:**
- Worker crash: BullMQ retries the job automatically on another worker
- Server restart: Socket.IO clients reconnect and re-sync Yjs state
- Redis restart: AOF log is replayed, full queue state recovered

---

## Supported Languages

| Language | Docker Image | Notes |
|---|---|---|
| Python | python:3.11-slim | |
| JavaScript | node:18-slim | |
| TypeScript | node:18-slim | Compiled with tsc then run with Node |
| Java | openjdk:17-slim | Class must be named Main |
| C++ | gcc:13 | Compiled with g++ |
| C | gcc:13 | Compiled with gcc |
| Go | golang:1.21-alpine | |
| Rust | rust:1.75-slim | Compiled with rustc |
| C# | mcr.microsoft.com/dotnet/sdk:8.0 | Uses dotnet run |
| Kotlin | zenika/kotlin | Compiled to JAR then run |
| Swift | swift:5.9-slim | |
| Ruby | ruby:3.2-slim | |
| PHP | php:8.2-cli | |
| Scala | sbtscala/scala-sbt | |
| R | r-base:4.3.1 | |
| Dart | dart:stable | |
| Bash | bash:5.2 | |
| SQL | postgres:16-alpine | Syntax check; full execution needs a database |

First run of each language pulls the Docker image (30 to 120 seconds depending on size). Subsequent runs are instant.

---

## Prerequisites

- Docker Desktop — https://www.docker.com/products/docker-desktop — must be running
- Node.js 18+ — https://nodejs.org
- Cloudinary account — https://cloudinary.com — free, for profile pictures
- Groq account — https://console.groq.com — free, for the AI assistant

---

## Setup and Installation

### Step 1 — Get the project files

Make sure you have the full folder:
```
collabcode/
├── server/
├── worker/
├── client/
├── docker-compose.yml
└── .env
```

### Step 2 — Create your .env file


Fill in your credentials (see Environment Variables below).

### Step 3 — Start the backend

```bash
docker compose up --build
```

Wait until you see:
```
[Server] Running on :3001
[AI] enabled — model: llama-3.3-70b-versatile, base: https://api.groq.com/openai/v1
[worker-1] Ready — supporting 18 languages
[worker-2] Ready — supporting 18 languages
[worker-3] Ready — supporting 18 languages
```

### Step 4 — Start the frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Environment Variables

```env
# Cloudinary — profile picture storage
# Sign up free at https://cloudinary.com → Dashboard → Settings → API Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Assistant — Groq (recommended, free)
# Get key at https://console.groq.com → API Keys
OPENAI_API_KEY=gsk_...your-groq-key...
OPENAI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile

# AI Assistant — OpenAI alternative
# OPENAI_API_KEY=sk-...your-openai-key...
# AI_MODEL=gpt-4o-mini

# AI Assistant — Local Ollama (no API key needed)
# OPENAI_API_KEY=ollama
# OPENAI_BASE_URL=http://host.docker.internal:11434/v1
# AI_MODEL=llama3.2

# Server (leave unchanged for local Docker setup)
PORT=3001
REDIS_URL=redis://redis:6379
```

### Groq model options

| Model | Speed | Best for |
|---|---|---|
| llama-3.3-70b-versatile | Fast | General coding help — recommended |
| llama-3.1-8b-instant | Very fast | Quick questions |
| mixtral-8x7b-32768 | Fast | Large context, long code files |
| gemma2-9b-it | Very fast | Lightweight tasks |

---

## Running the Project

### Normal startup

Terminal 1 (backend):
```bash
docker compose up --build
```

Terminal 2 (frontend):
```bash
cd client
npm install
npm run dev
```

### Stop everything

```bash
docker compose down
```

### After changing .env

```bash
docker compose down
docker compose up --build
```

### After changing server or worker code

```bash
docker compose down
docker compose up --build
```

### After changing frontend code

The Vite dev server hot-reloads automatically. Just save the file.

---


## Distributed Deployment

To run each component on a separate machine on the same WiFi or LAN network:

Machine 1 — Redis only:
```bash
docker run -p 6379:6379 redis:7-alpine redis-server --appendonly yes
```
Note its IP, for example 192.168.1.2

Machine 2 — Server only:
Set REDIS_URL=redis://192.168.1.2:6379 in the server environment and run:
```bash
docker compose up server --build
```
Note its IP, for example 192.168.1.3

Machine 3, 4, 5 — One worker each:
Set REDIS_URL=redis://192.168.1.2:6379 and SERVER_URL=http://192.168.1.3:3001 and run:
```bash
docker compose up worker1 --build
```

Client machines — update the server URL in the client:
```js
// client/src/pages/Editor.jsx and Lobby.jsx — change this line:
const SERVER = "http://192.168.1.3:3001";
```

Then run npm run dev on each client machine.

---

## How It Works Internally

### Real-time collaborative editing

Every keystroke is converted into a Yjs CRDT update — a compact binary object describing the change with a unique ID and causal metadata. This update is sent via Socket.IO to the server, which applies it to its server-side Yjs document replica and broadcasts the binary update to all other clients in the room. Each client independently applies the update. If two users type at the same position simultaneously, Yjs's YATA (Yet Another Transformation Approach) algorithm deterministically resolves the conflict — every client arrives at the same result without a coordination round-trip.

Each language has its own independent Y.Doc on both the client and server. Switching languages reconnects to that language's document channel.

### Code execution pipeline

1. User clicks Run — Socket.IO event sent to server — server pushes a BullMQ job to Redis
2. A worker pulls the job (one at a time per worker process)
3. Worker calls Dockerode to create a container with the correct language image
4. Code is passed as the CODE environment variable — the container writes it to a file internally and executes it
5. Container stdout is streamed chunk by chunk — each chunk is POSTed to /output on the server — server emits execution:output to all clients in the room
6. Container is auto-removed after execution finishes
7. If the worker crashes mid-execution, BullMQ marks the job as stalled and re-queues it automatically

No bind mounts are used. The code-as-env-var approach works on all platforms including Windows with Docker Desktop.

### Room lifecycle

Rooms are created in server memory when the first user joins. A 10-minute cleanup timer starts when the last user leaves. If no one rejoins in that time, the room state is deleted. The 6-character code remains valid while the server is running.

---

## Troubleshooting

**docker compose up fails with port already allocated**

Run docker compose down first, then check what is using the port:
```bash
# On Windows PowerShell:
netstat -ano | findstr :6379
# Kill by PID or change the Redis port in docker-compose.yml to "6380:6379"
```

**AI says "AI not configured"**

Check that OPENAI_API_KEY is set in .env and that you ran docker compose down followed by docker compose up --build after editing the file. The server prints [AI] enabled on startup if the key is loaded.

**AI says "Could not reach server"**

Make sure docker compose up is running. Check server logs with docker compose logs server.

**Code execution fails with "No such image"**

The language Docker image needs to be pulled. Run docker pull python:3.11-slim (or whichever language failed), or just try running again — workers pull images automatically on first use.

**Changes to .env have no effect**

You must restart Docker: docker compose down then docker compose up --build. Restarting only the frontend has no effect on server-side environment variables.

**Room not found when joining**

The room creator must enter the room first. The room only exists in memory while at least one user is connected, or within 10 minutes of the last user leaving.

**Profile picture upload fails**

Check your Cloudinary credentials in .env. Without valid credentials the app uses initials avatars as fallback — all other features still work normally.
