import { Router } from "express";
import { nanoid } from "nanoid";
import { getRoom, hasRoom } from "../state/rooms.js";

const router = Router();

router.get("/room/:code", (req, res) => {
  const code   = req.params.code.toUpperCase();
  const exists = hasRoom(code) && getRoom(code).users.size > 0;
  res.json({ exists });
});

router.post("/create-room", (req, res) => {
  const code = nanoid(6).toUpperCase();
  getRoom(code); // initialise room
  res.json({ code });
});

export default router;
