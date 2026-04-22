// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { adminLogin } from "../../services/adminApi";

// export default function AdminLogin() {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function onSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     const res = await adminLogin(username, password);

//     setLoading(false);
//     if (!res.ok) {
//       setError(res.body?.error || "Login failed");
//       return;
//     }

//     navigate("/admin/dashboard");
//   }

//   return (
//     <div style={{ maxWidth: 360, margin: "10vh auto", fontFamily: "sans-serif" }}>
//       <h2>Admin Login</h2>
//       <form onSubmit={onSubmit}>
//         <label>Username</label>
//         <input
//           style={{ display: "block", width: "100%", margin: "6px 0 12px", padding: 8 }}
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           autoComplete="username"
//           required
//         />

//         <label>Password</label>
//         <input
//           style={{ display: "block", width: "100%", margin: "6px 0 12px", padding: 8 }}
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           autoComplete="current-password"
//           required
//         />

//         <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
//           {loading ? "Signing in..." : "Sign in"}
//         </button>

//         {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
//       </form>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../services/adminApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .al-root {
    min-height: 100vh;
    background: #020d1a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Rajdhani', sans-serif;
    overflow: hidden;
    position: relative;
  }

  .al-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,180,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,180,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .al-glow {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,100,255,0.12) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .al-card {
    position: relative;
    width: 420px;
    background: rgba(4,20,44,0.9);
    border: 1px solid rgba(0,180,255,0.2);
    border-radius: 2px;
    padding: 44px 40px 40px;
    backdrop-filter: blur(12px);
    box-shadow:
      0 0 0 1px rgba(0,180,255,0.05),
      0 24px 64px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(0,180,255,0.1);
    animation: al-fadein 0.5s ease both;
  }

  @keyframes al-fadein {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .al-corner {
    position: absolute;
    width: 14px;
    height: 14px;
    border-color: #00b4ff;
    border-style: solid;
  }
  .al-corner-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
  .al-corner-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
  .al-corner-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
  .al-corner-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

  .al-badge {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: 3px;
    color: #00b4ff;
    text-transform: uppercase;
    margin-bottom: 8px;
    opacity: 0.7;
  }

  .al-title {
    font-size: 28px;
    font-weight: 700;
    color: #e8f4ff;
    letter-spacing: 1px;
    margin-bottom: 6px;
    line-height: 1;
  }

  .al-subtitle {
    font-size: 13px;
    color: rgba(160,200,240,0.45);
    margin-bottom: 36px;
    font-family: 'Share Tech Mono', monospace;
    letter-spacing: 0.5px;
  }

  .al-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,180,255,0.3), transparent);
    margin-bottom: 28px;
  }

  .al-field {
    margin-bottom: 20px;
  }

  .al-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    color: rgba(0,180,255,0.7);
    text-transform: uppercase;
    margin-bottom: 8px;
    font-family: 'Share Tech Mono', monospace;
  }

  .al-input-wrap {
    position: relative;
  }

  .al-input {
    width: 100%;
    background: rgba(0,20,50,0.8);
    border: 1px solid rgba(0,180,255,0.15);
    border-radius: 2px;
    padding: 11px 14px;
    font-size: 15px;
    font-family: 'Share Tech Mono', monospace;
    color: #c8e8ff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    letter-spacing: 0.5px;
  }

  .al-input:focus {
    border-color: rgba(0,180,255,0.5);
    box-shadow: 0 0 0 3px rgba(0,180,255,0.08), inset 0 0 12px rgba(0,100,255,0.05);
  }

  .al-input::placeholder { color: rgba(100,160,220,0.25); }

  .al-btn {
    width: 100%;
    margin-top: 8px;
    padding: 13px;
    background: linear-gradient(135deg, #0048cc 0%, #0080ff 100%);
    border: none;
    border-radius: 2px;
    color: #fff;
    font-family: 'Rajdhani', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: opacity 0.2s, transform 0.1s;
    box-shadow: 0 4px 20px rgba(0,100,255,0.35);
  }

  .al-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.08));
  }

  .al-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
  .al-btn:active:not(:disabled) { transform: translateY(0); }
  .al-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .al-error {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding: 10px 14px;
    background: rgba(220,30,60,0.1);
    border: 1px solid rgba(220,30,60,0.25);
    border-radius: 2px;
    color: #ff6070;
    font-size: 13px;
    font-family: 'Share Tech Mono', monospace;
    animation: al-fadein 0.25s ease;
  }

  .al-footer {
    margin-top: 28px;
    text-align: center;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    color: rgba(100,160,220,0.25);
    letter-spacing: 1px;
  }
`;

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
      setError(res.body?.error || "Authentication failed");
      return;
    }
    navigate("/admin/dashboard");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="al-root">
        <div className="al-grid" />
        <div className="al-glow" />
        <div className="al-card">
          <div className="al-corner al-corner-tl" />
          <div className="al-corner al-corner-tr" />
          <div className="al-corner al-corner-bl" />
          <div className="al-corner al-corner-br" />

          <div className="al-badge">// secure access</div>
          <h1 className="al-title">Admin Portal</h1>
          <p className="al-subtitle">AUTHENTICATED SESSION REQUIRED</p>
          <div className="al-divider" />

          <form onSubmit={onSubmit}>
            <div className="al-field">
              <label className="al-label" htmlFor="al-user">Username</label>
              <div className="al-input-wrap">
                <input
                  id="al-user"
                  className="al-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="enter username"
                  required
                />
              </div>
            </div>

            <div className="al-field">
              <label className="al-label" htmlFor="al-pass">Password</label>
              <div className="al-input-wrap">
                <input
                  id="al-pass"
                  className="al-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  required
                />
              </div>
            </div>

            <button className="al-btn" type="submit" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "SIGN IN"}
            </button>

            {error && (
              <div className="al-error">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}
          </form>

          <div className="al-footer">SYSTEM v2.0 · RESTRICTED ACCESS</div>
        </div>
      </div>
    </>
  );
}