import { Router } from "express";
import {
  createAdminToken,
  setAdminCookie,
  clearAdminCookie,
  getCookie,
  verifyAdminToken,
  COOKIE_NAME,
} from "../../utils/adminSession.js";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!envUser || !envPass || !secret) {
    return res.status(500).json({ ok: false, error: "Admin auth env not configured" });
  }

  if (username !== envUser || password !== envPass) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }

  const now = Date.now();
  const token = createAdminToken(
    { username: envUser, iat: now, exp: now + 24 * 60 * 60 * 1000 },
    secret
  );

  setAdminCookie(res, token);
  return res.json({ ok: true, username: envUser });
});

router.get("/me", (req, res) => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = getCookie(req, COOKIE_NAME);
  const payload = verifyAdminToken(token, secret);

  if (!payload) return res.status(401).json({ ok: false, error: "Unauthorized" });
  return res.json({ ok: true, username: payload.username });
});

router.post("/logout", (_req, res) => {
  clearAdminCookie(res);
  return res.json({ ok: true });
});

export default router;