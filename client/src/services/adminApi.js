// const BASE = import.meta.env.VITE_SERVER_URL;
const BASE = "/api";

async function parse(res) {
  let body = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  return { status: res.status, ok: res.ok, body };
}

export async function adminLogin(username, password) {
  const res = await fetch(`${BASE}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  return parse(res);
}

export async function adminMe() {
  const res = await fetch(`${BASE}/admin/auth/me`, {
    credentials: "include",
  });
  return parse(res);
}

export async function adminLogout() {
  const res = await fetch(`${BASE}/admin/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return parse(res);
}

export async function getWorkers() {
  const res = await fetch(`${BASE}/admin/workers`, {
    credentials: "include",
  });
  return parse(res);
}

export async function getQueueStats() {
  const res = await fetch(`${BASE}/admin/queue-stats`, {
    credentials: "include",
  });
  return parse(res);
}

export async function getJobs(state = "active", start = 0, end = 49) {
  const q = new URLSearchParams({ state, start: String(start), end: String(end) });
  const res = await fetch(`${BASE}/admin/jobs?${q.toString()}`, {
    credentials: "include",
  });
  return parse(res);
}