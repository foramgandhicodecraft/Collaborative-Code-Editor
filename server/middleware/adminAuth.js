import { COOKIE_NAME, getCookie, verifyAdminToken } from "../utils/adminSession.js";

export function adminAuth(req, res, next) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = getCookie(req, COOKIE_NAME);
  const payload = verifyAdminToken(token, secret);

  if (!payload) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  req.admin = payload;
  next();
}