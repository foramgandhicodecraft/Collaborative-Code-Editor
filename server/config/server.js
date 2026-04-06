import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app    = express();
const server = createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 5e6,
});

export { app, server, io };
