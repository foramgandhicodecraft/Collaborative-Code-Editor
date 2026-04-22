// import crypto from "crypto";

// const COOKIE_NAME = "admin_session";

// function b64url(input) {
//   return Buffer.from(input).toString("base64url");
// }

// function sign(value, secret) {
//   return crypto.createHmac("sha256", secret).update(value).digest("base64url");
// }

// export function createAdminToken(payload, secret) {
//   const encoded = b64url(JSON.stringify(payload));
//   const sig = sign(encoded, secret);
//   return `${encoded}.${sig}`;
// }

// export function verifyAdminToken(token, secret) {
//   if (!token || !secret) return null;
//   const [encoded, sig] = token.split(".");
//   if (!encoded || !sig) return null;

//   const expected = sign(encoded, secret);
//   if (sig !== expected) return null;

//   try {
//     const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
//     if (!payload?.exp || Date.now() > payload.exp) return null;
//     return payload;
//   } catch {
//     return null;
//   }
// }

// export function getCookie(req, name) {
//   const header = req.headers.cookie || "";
//   const parts = header.split(";").map((v) => v.trim());
//   const row = parts.find((p) => p.startsWith(`${name}=`));
//   return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
// }

// export function setAdminCookie(res, token) {
//   const secure = process.env.NODE_ENV === "production";
//   res.setHeader(
//     "Set-Cookie",
//     // `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${
//     //   secure ? "; Secure" : ""
//     // }`
//     `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=None; Max-Age=86400${
//       secure ? "; Secure" : ""
//     }`
//   );
// }

// export function clearAdminCookie(res) {
//   const secure = process.env.NODE_ENV === "production";
//   res.setHeader(
//     "Set-Cookie",
//     // `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`
//     `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=None; Max-Age=0${secure ? "; Secure" : ""}`
//   );
// }
// export { COOKIE_NAME };

import crypto from "crypto";

const COOKIE_NAME = "admin_session";

function b64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function createAdminToken(payload, secret) {
  const encoded = b64url(JSON.stringify(payload));
  const sig = sign(encoded, secret);
  return `${encoded}.${sig}`;
}

export function verifyAdminToken(token, secret) {
  if (!token || !secret) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  const expected = sign(encoded, secret);
  if (sig !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload?.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getCookie(req, name) {
  const header = req.headers.cookie || "";
  const parts = header.split(";").map((v) => v.trim());
  const row = parts.find((p) => p.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
}

export function setAdminCookie(res, token) {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${
      secure ? "; Secure" : ""
    }`
  );
}

export function clearAdminCookie(res) {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`
  );
}

export { COOKIE_NAME };