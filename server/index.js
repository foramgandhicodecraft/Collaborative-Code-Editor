// import { app, server } from "./config/server.js";
// import { registerRoutes } from "./routes/index.js";
// import { registerSocket } from "./socket/index.js";

// const PORT = process.env.PORT || 3001;

// registerRoutes(app);
// registerSocket(server);

// server.listen(PORT, () => console.log(`[Server] Running on :${PORT}`));


import { createAdapter } from "@socket.io/redis-adapter";
import IORedis from "ioredis";
import { app, server, io } from "./config/server.js";
import { registerRoutes } from "./routes/index.js";
import { registerSocket } from "./socket/index.js";

const PORT = process.env.PORT || 3001;

registerRoutes(app);
registerSocket(server);

// Redis adapter — syncs room state between both servers through Redis pub/sub
const pubClient = new IORedis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
console.log("[Server] Redis adapter connected — servers are now in sync");

// server.listen(PORT, () => console.log(`[Server] Running on :${PORT}`));
server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on :${PORT}`);
  });