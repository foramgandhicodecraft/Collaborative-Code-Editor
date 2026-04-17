import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../services/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await adminLogin(username, password);

    setLoading(false);
    if (!res.ok) {
      setError(res.body?.error || "Login failed");
      return;
    }

    navigate("/admin/dashboard");
  }

  return (
    <div style={{ maxWidth: 360, margin: "10vh auto", fontFamily: "sans-serif" }}>
      <h2>Admin Login</h2>
      <form onSubmit={onSubmit}>
        <label>Username</label>
        <input
          style={{ display: "block", width: "100%", margin: "6px 0 12px", padding: 8 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label>Password</label>
        <input
          style={{ display: "block", width: "100%", margin: "6px 0 12px", padding: 8 }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
      </form>
    </div>
  );
}