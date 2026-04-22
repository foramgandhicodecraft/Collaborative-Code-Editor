// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app    = express();
// const server = createServer(app);

// app.use(cors({ origin: "*" }));
// app.use(express.json({ limit: "2mb" }));

// app.get("/", (req, res) => {
//   res.send("Server is running");
// });

// const io = new Server(server, {
//   cors: { origin: "*", methods: ["GET", "POST"] },
//   maxHttpBufferSize: 5e6,
// });

// export { app, server, io };

// // ✅ ADD THIS PART
// const PORT = 3001;

// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send("Server is working");
});

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
  maxHttpBufferSize: 5e6,
});

export { app, server, io };