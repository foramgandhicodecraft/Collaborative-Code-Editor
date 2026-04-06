# CollabCode

A production-ready, real-time collaborative code editor with AI assistance.

## Features

- **Room-based collaboration** — create or join rooms with a 6-character code
- **Real-time editing** — Socket.IO + Yjs CRDT, multiple users edit simultaneously
- **Google Docs cursor labels** — see where teammates are typing in real time
- **18 programming languages** — Python, JS, TS, Java, C, C++, Go, Rust, C#, Kotlin, Swift, Ruby, PHP, Scala, R, Dart, Bash, SQL
- **Per-language code state** — switching languages never overwrites your other code
- **Isolated code execution** — Docker containers with CPU/memory limits
- **Room chat** — WhatsApp-style messaging with history
- **AI Assistant** — LangChain-powered coding assistant with editor context, per-user private chat
- **User profiles** — name + profile picture (Cloudinary)
- **Dark / Light theme** — full support across all panels
- **Distributed workers** — BullMQ + Redis for fault-tolerant code execution

## Architecture

```
collabcode/
├── server/          Node.js + Express + Socket.IO + LangChain
├── worker/          BullMQ worker — Docker code execution
├── client/          React 18 + Tailwind CSS + Monaco Editor
└── docker-compose.yml
```

## Setup

### 1. Prerequisites
- Docker Desktop (running)
- Node.js 18+
- Accounts: [Cloudinary](https://cloudinary.com) (free) + [OpenAI](https://platform.openai.com) (paid, ~$0.01 per AI chat)

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=sk-...your-key...
```

> **AI without OpenAI?** You can use [Groq](https://groq.com) (free tier) — set:
> ```
> OPENAI_API_KEY=gsk_...your-groq-key...
> OPENAI_BASE_URL=https://api.groq.com/openai/v1
> AI_MODEL=llama-3.1-8b-instant
> ```

### 3. Start the backend

```bash
docker compose up --build
```

This starts: Redis, the Socket.IO server, and 3 worker nodes.

### 4. Start the frontend

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in two browser tabs to test collaboration.

## Usage

1. **Create a room** — click "Create Room", a 6-character code is generated
2. **Share the code** — teammates enter it under "Join Room"
3. **Code together** — real-time sync, cursor labels show who's editing where
4. **Chat** — click the chat icon (💬) in the toolbar
5. **AI help** — click the bulb icon (💡) to open the AI Assistant panel
   - The assistant sees your current code automatically
   - Ask: "explain this code", "find the bug", "add error handling", etc.
   - Chat history is maintained during your session (private to you)
6. **Run code** — click ▶ Run; output appears in the panel below the editor
7. **Switch languages** — use the pills or "More" dropdown (searchable list of 18 languages)
   - Each language remembers its own code independently

## Notes

- The AI assistant requires `OPENAI_API_KEY` in `.env`. If not set, the assistant shows a configuration message.
- Some language Docker images are large (Kotlin, Scala, Swift) — first run may take a minute to pull them.
- SQL execution is syntax-checked but full queries require a database connection.
- Profile pictures require Cloudinary credentials. Without them, initials avatars are used as fallback.

## Distributed deployment

To run components on separate machines on the same network, set these env vars:

```
# On the worker machine:
REDIS_URL=redis://<redis-machine-ip>:6379
SERVER_URL=http://<server-machine-ip>:3001

# In the client (src/pages/Editor.jsx and src/pages/Lobby.jsx):
const SERVER = "http://<server-machine-ip>:3001";
```
