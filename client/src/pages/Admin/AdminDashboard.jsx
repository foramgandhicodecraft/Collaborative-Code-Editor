// // // import { useEffect, useMemo, useState } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import { adminLogout, getJobs, getQueueStats, getWorkers } from "../../services/adminApi";

// // // export default function AdminDashboard() {
// // //   const navigate = useNavigate();

// // //   const [workersData, setWorkersData] = useState(null);
// // //   const [queueData, setQueueData] = useState(null);
// // //   const [jobsData, setJobsData] = useState(null);
// // //   const [jobState, setJobState] = useState("active");
// // //   const [error, setError] = useState("");

// // //   async function loadAll() {
// // //     setError("");

// // //     const [w, q, j] = await Promise.all([
// // //       getWorkers(),
// // //       getQueueStats(),
// // //       getJobs(jobState, 0, 30),
// // //     ]);

// // //     if ([w, q, j].some((r) => r.status === 401)) {
// // //       navigate("/admin");
// // //       return;
// // //     }

// // //     if (!w.ok || !q.ok || !j.ok) {
// // //       setError(w.body?.error || q.body?.error || j.body?.error || "Failed to load dashboard data");
// // //       return;
// // //     }

// // //     setWorkersData(w.body);
// // //     setQueueData(q.body);
// // //     setJobsData(j.body);
// // //   }

// // //   useEffect(() => {
// // //     loadAll();
// // //     const t = setInterval(loadAll, 3000);
// // //     return () => clearInterval(t);
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [jobState]);

// // //   async function onLogout() {
// // //     await adminLogout();
// // //     navigate("/admin");
// // //   }

// // //   const queue = queueData?.queue || {};
// // //   const workers = workersData?.workers || [];
// // //   const jobs = jobsData?.jobs || [];

// // //   const busyCount = useMemo(
// // //     () => workers.filter((w) => w.status === "busy").length,
// // //     [workers]
// // //   );

// // //   return (
// // //     <div style={{ padding: 20, fontFamily: "sans-serif" }}>
// // //       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
// // //         <h2>Admin Dashboard</h2>
// // //         <button onClick={onLogout}>Logout</button>
// // //       </div>

// // //       {error && <p style={{ color: "crimson" }}>{error}</p>}

// // //       <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(120px, 1fr))", gap: 10, margin: "12px 0 20px" }}>
// // //         <Stat title="Alive Workers" value={workersData?.aliveWorkers ?? 0} />
// // //         <Stat title="Busy Workers" value={busyCount} />
// // //         <Stat title="Waiting" value={queue.waiting ?? 0} />
// // //         <Stat title="Active" value={queue.active ?? 0} />
// // //         <Stat title="Completed" value={queue.completed ?? 0} />
// // //         <Stat title="Failed" value={queue.failed ?? 0} />
// // //       </div>

// // //       <h3>Workers</h3>
// // //       <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: 20 }}>
// // //         <thead>
// // //           <tr style={{ background: "#f3f3f3" }}>
// // //             <th align="left">Worker ID</th>
// // //             <th align="left">Status</th>
// // //             <th align="left">Current Job</th>
// // //             <th align="left">Room</th>
// // //             <th align="left">Language</th>
// // //             <th align="left">Heartbeat</th>
// // //           </tr>
// // //         </thead>
// // //         <tbody>
// // //           {workers.length === 0 ? (
// // //             <tr><td colSpan="6">No active workers</td></tr>
// // //           ) : (
// // //             workers.map((w) => (
// // //               <tr key={w.workerId} style={{ borderTop: "1px solid #ddd" }}>
// // //                 <td>{w.workerId}</td>
// // //                 <td>{w.status}</td>
// // //                 <td>{w.job?.jobId ?? "-"}</td>
// // //                 <td>{w.job?.roomId ?? "-"}</td>
// // //                 <td>{w.job?.language ?? "-"}</td>
// // //                 <td>{w.ts ? new Date(w.ts).toLocaleTimeString() : "-"}</td>
// // //               </tr>
// // //             ))
// // //           )}
// // //         </tbody>
// // //       </table>

// // //       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
// // //         <h3 style={{ margin: 0 }}>Jobs</h3>
// // //         <select value={jobState} onChange={(e) => setJobState(e.target.value)}>
// // //           <option value="active">active</option>
// // //           <option value="waiting">waiting</option>
// // //           <option value="completed">completed</option>
// // //           <option value="failed">failed</option>
// // //           <option value="delayed">delayed</option>
// // //         </select>
// // //       </div>

// // //       <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", marginTop: 10 }}>
// // //         <thead>
// // //           <tr style={{ background: "#f3f3f3" }}>
// // //             <th align="left">Job ID</th>
// // //             <th align="left">Room</th>
// // //             <th align="left">Language</th>
// // //             <th align="left">Worker</th>
// // //             <th align="left">Created</th>
// // //             <th align="left">Started</th>
// // //             <th align="left">Finished</th>
// // //             <th align="left">Error</th>
// // //           </tr>
// // //         </thead>
// // //         <tbody>
// // //           {jobs.length === 0 ? (
// // //             <tr><td colSpan="8">No jobs in "{jobState}"</td></tr>
// // //           ) : (
// // //             jobs.map((j) => (
// // //               <tr key={String(j.id)} style={{ borderTop: "1px solid #ddd" }}>
// // //                 <td>{j.id}</td>
// // //                 <td>{j.data?.roomId ?? "-"}</td>
// // //                 <td>{j.data?.language ?? "-"}</td>
// // //                 <td>{j.data?.workerId || j.progress?.workerId || "-"}</td>
// // //                 <td>{j.timestamp ? new Date(j.timestamp).toLocaleTimeString() : "-"}</td>
// // //                 <td>{j.processedOn ? new Date(j.processedOn).toLocaleTimeString() : "-"}</td>
// // //                 <td>{j.finishedOn ? new Date(j.finishedOn).toLocaleTimeString() : "-"}</td>
// // //                 <td>{j.failedReason || "-"}</td>
// // //               </tr>
// // //             ))
// // //           )}
// // //         </tbody>
// // //       </table>
// // //     </div>
// // //   );
// // // }

// // // function Stat({ title, value }) {
// // //   return (
// // //     <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
// // //       <div style={{ fontSize: 12, color: "#555" }}>{title}</div>
// // //       <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
// // //     </div>
// // //   );
// // // }

// // import { useEffect, useMemo, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { adminLogout, getJobs, getQueueStats, getWorkers } from "../../services/adminApi";

// // const styles = `
// //   @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

// //   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

// //   .ad-root {
// //     min-height: 100vh;
// //     background: #020d1a;
// //     font-family: 'Rajdhani', sans-serif;
// //     color: #c8e8ff;
// //   }

// //   .ad-bg-grid {
// //     position: fixed;
// //     inset: 0;
// //     background-image:
// //       linear-gradient(rgba(0,180,255,0.03) 1px, transparent 1px),
// //       linear-gradient(90deg, rgba(0,180,255,0.03) 1px, transparent 1px);
// //     background-size: 40px 40px;
// //     pointer-events: none;
// //     z-index: 0;
// //   }

// //   .ad-content {
// //     position: relative;
// //     z-index: 1;
// //     max-width: 1400px;
// //     margin: 0 auto;
// //     padding: 0 24px 40px;
// //   }

// //   /* ── TOPBAR ── */
// //   .ad-topbar {
// //     display: flex;
// //     align-items: center;
// //     justify-content: space-between;
// //     padding: 18px 0 16px;
// //     border-bottom: 1px solid rgba(0,180,255,0.12);
// //     margin-bottom: 28px;
// //   }

// //   .ad-brand {
// //     display: flex;
// //     align-items: center;
// //     gap: 12px;
// //   }

// //   .ad-brand-dot {
// //     width: 8px;
// //     height: 8px;
// //     border-radius: 50%;
// //     background: #00b4ff;
// //     box-shadow: 0 0 8px #00b4ff;
// //     animation: ad-pulse 2s ease-in-out infinite;
// //   }

// //   @keyframes ad-pulse {
// //     0%,100% { opacity: 1; }
// //     50% { opacity: 0.4; }
// //   }

// //   .ad-brand-label {
// //     font-family: 'Share Tech Mono', monospace;
// //     font-size: 11px;
// //     letter-spacing: 3px;
// //     color: rgba(0,180,255,0.6);
// //     text-transform: uppercase;
// //   }

// //   .ad-brand-title {
// //     font-size: 20px;
// //     font-weight: 700;
// //     color: #e8f4ff;
// //     letter-spacing: 1px;
// //   }

// //   .ad-topbar-right {
// //     display: flex;
// //     align-items: center;
// //     gap: 16px;
// //   }

// //   .ad-timestamp {
// //     font-family: 'Share Tech Mono', monospace;
// //     font-size: 11px;
// //     color: rgba(100,160,220,0.4);
// //     letter-spacing: 1px;
// //   }

// //   .ad-logout-btn {
// //     background: transparent;
// //     border: 1px solid rgba(0,180,255,0.2);
// //     border-radius: 2px;
// //     color: rgba(0,180,255,0.7);
// //     padding: 7px 18px;
// //     font-family: 'Rajdhani', sans-serif;
// //     font-size: 13px;
// //     font-weight: 600;
// //     letter-spacing: 2px;
// //     text-transform: uppercase;
// //     cursor: pointer;
// //     transition: all 0.2s;
// //   }

// //   .ad-logout-btn:hover {
// //     background: rgba(0,180,255,0.08);
// //     border-color: rgba(0,180,255,0.45);
// //     color: #00b4ff;
// //   }

// //   /* ── ERROR ── */
// //   .ad-error {
// //     display: flex;
// //     align-items: center;
// //     gap: 8px;
// //     padding: 10px 16px;
// //     background: rgba(220,30,60,0.1);
// //     border: 1px solid rgba(220,30,60,0.25);
// //     border-radius: 2px;
// //     color: #ff6070;
// //     font-size: 13px;
// //     font-family: 'Share Tech Mono', monospace;
// //     margin-bottom: 20px;
// //   }

// //   /* ── STAT GRID ── */
// //   .ad-stats {
// //     display: grid;
// //     grid-template-columns: repeat(6, 1fr);
// //     gap: 12px;
// //     margin-bottom: 32px;
// //   }

// //   @media (max-width: 900px) {
// //     .ad-stats { grid-template-columns: repeat(3, 1fr); }
// //   }

// //   .ad-stat {
// //     background: rgba(4,20,44,0.8);
// //     border: 1px solid rgba(0,180,255,0.12);
// //     border-radius: 2px;
// //     padding: 16px 18px;
// //     position: relative;
// //     overflow: hidden;
// //     transition: border-color 0.2s;
// //   }

// //   .ad-stat::before {
// //     content: '';
// //     position: absolute;
// //     top: 0; left: 0; right: 0;
// //     height: 2px;
// //     background: linear-gradient(90deg, transparent, rgba(0,180,255,0.4), transparent);
// //   }

// //   .ad-stat:hover { border-color: rgba(0,180,255,0.28); }

// //   .ad-stat-label {
// //     font-family: 'Share Tech Mono', monospace;
// //     font-size: 9px;
// //     letter-spacing: 2px;
// //     color: rgba(0,180,255,0.5);
// //     text-transform: uppercase;
// //     margin-bottom: 8px;
// //   }

// //   .ad-stat-value {
// //     font-size: 30px;
// //     font-weight: 700;
// //     color: #e8f4ff;
// //     line-height: 1;
// //   }

// //   .ad-stat-value.highlight { color: #00b4ff; }
// //   .ad-stat-value.danger { color: #ff4a5a; }
// //   .ad-stat-value.success { color: #00d98b; }

// //   /* ── SECTION ── */
// //   .ad-section {
// //     margin-bottom: 32px;
// //   }

// //   .ad-section-head {
// //     display: flex;
// //     align-items: center;
// //     justify-content: space-between;
// //     margin-bottom: 14px;
// //   }

// //   .ad-section-title {
// //     display: flex;
// //     align-items: center;
// //     gap: 10px;
// //     font-size: 14px;
// //     font-weight: 700;
// //     letter-spacing: 3px;
// //     text-transform: uppercase;
// //     color: rgba(0,180,255,0.8);
// //     font-family: 'Share Tech Mono', monospace;
// //   }

// //   .ad-section-line {
// //     flex: 1;
// //     margin-left: 16px;
// //     height: 1px;
// //     background: linear-gradient(90deg, rgba(0,180,255,0.2), transparent);
// //   }

// //   /* ── TABLE ── */
// //   .ad-table-wrap {
// //     background: rgba(4,20,44,0.7);
// //     border: 1px solid rgba(0,180,255,0.12);
// //     border-radius: 2px;
// //     overflow-x: auto;
// //   }

// //   .ad-table {
// //     width: 100%;
// //     border-collapse: collapse;
// //     font-size: 13.5px;
// //   }

// //   .ad-table thead tr {
// //     border-bottom: 1px solid rgba(0,180,255,0.15);
// //   }

// //   .ad-table th {
// //     font-family: 'Share Tech Mono', monospace;
// //     font-size: 9px;
// //     letter-spacing: 2px;
// //     color: rgba(0,180,255,0.5);
// //     text-transform: uppercase;
// //     text-align: left;
// //     padding: 13px 16px;
// //     font-weight: 400;
// //     white-space: nowrap;
// //   }

// //   .ad-table tbody tr {
// //     border-bottom: 1px solid rgba(0,100,180,0.08);
// //     transition: background 0.15s;
// //   }

// //   .ad-table tbody tr:hover { background: rgba(0,100,255,0.05); }
// //   .ad-table tbody tr:last-child { border-bottom: none; }

// //   .ad-table td {
// //     padding: 12px 16px;
// //     color: rgba(180,220,255,0.75);
// //     font-family: 'Share Tech Mono', monospace;
// //     font-size: 12px;
// //     white-space: nowrap;
// //   }

// //   .ad-table td.empty {
// //     color: rgba(100,160,220,0.25);
// //     text-align: center;
// //     padding: 24px;
// //     letter-spacing: 2px;
// //     font-size: 11px;
// //     text-transform: uppercase;
// //   }

// //   /* status badges */
// //   .ad-badge {
// //     display: inline-flex;
// //     align-items: center;
// //     gap: 5px;
// //     padding: 3px 8px;
// //     border-radius: 2px;
// //     font-size: 10px;
// //     letter-spacing: 1px;
// //     text-transform: uppercase;
// //     font-weight: 600;
// //   }

// //   .ad-badge.busy {
// //     background: rgba(255,160,0,0.1);
// //     border: 1px solid rgba(255,160,0,0.3);
// //     color: #ffb347;
// //   }

// //   .ad-badge.idle {
// //     background: rgba(0,217,139,0.08);
// //     border: 1px solid rgba(0,217,139,0.2);
// //     color: #00d98b;
// //   }

// //   .ad-badge.offline {
// //     background: rgba(120,140,180,0.08);
// //     border: 1px solid rgba(120,140,180,0.2);
// //     color: rgba(150,170,200,0.6);
// //   }

// //   .ad-badge-dot {
// //     width: 5px; height: 5px;
// //     border-radius: 50%;
// //     background: currentColor;
// //   }

// //   /* ── JOB FILTER ── */
// //   .ad-filter-row {
// //     display: flex;
// //     align-items: center;
// //     gap: 6px;
// //   }

// //   .ad-filter-btn {
// //     background: transparent;
// //     border: 1px solid rgba(0,180,255,0.15);
// //     border-radius: 2px;
// //     color: rgba(100,160,220,0.5);
// //     padding: 5px 14px;
// //     font-family: 'Share Tech Mono', monospace;
// //     font-size: 10px;
// //     letter-spacing: 1.5px;
// //     text-transform: uppercase;
// //     cursor: pointer;
// //     transition: all 0.15s;
// //   }

// //   .ad-filter-btn:hover {
// //     border-color: rgba(0,180,255,0.35);
// //     color: rgba(0,180,255,0.8);
// //   }

// //   .ad-filter-btn.active {
// //     background: rgba(0,100,255,0.15);
// //     border-color: rgba(0,180,255,0.4);
// //     color: #00b4ff;
// //   }
// // `;

// // const JOB_STATES = ["active", "waiting", "completed", "failed", "delayed"];

// // function StatusBadge({ status }) {
// //   const cls = status === "busy" ? "busy" : status === "idle" ? "idle" : "offline";
// //   return (
// //     <span className={`ad-badge ${cls}`}>
// //       <span className="ad-badge-dot" />
// //       {status}
// //     </span>
// //   );
// // }

// // function Stat({ title, value, variant }) {
// //   return (
// //     <div className="ad-stat">
// //       <div className="ad-stat-label">{title}</div>
// //       <div className={`ad-stat-value ${variant || ""}`}>{value}</div>
// //     </div>
// //   );
// // }

// // function SectionTitle({ children }) {
// //   return (
// //     <div className="ad-section-head">
// //       <div className="ad-section-title">
// //         <span>{children}</span>
// //         <div className="ad-section-line" />
// //       </div>
// //     </div>
// //   );
// // }

// // export default function AdminDashboard() {
// //   const navigate = useNavigate();
// //   const [workersData, setWorkersData] = useState(null);
// //   const [queueData, setQueueData] = useState(null);
// //   const [jobsData, setJobsData] = useState(null);
// //   const [jobState, setJobState] = useState("active");
// //   const [error, setError] = useState("");
// //   const [now, setNow] = useState(new Date());

// //   async function loadAll() {
// //     setError("");
// //     const [w, q, j] = await Promise.all([
// //       getWorkers(),
// //       getQueueStats(),
// //       getJobs(jobState, 0, 30),
// //     ]);
// //     if ([w, q, j].some((r) => r.status === 401)) { navigate("/admin"); return; }
// //     if (!w.ok || !q.ok || !j.ok) {
// //       setError(w.body?.error || q.body?.error || j.body?.error || "Failed to load dashboard data");
// //       return;
// //     }
// //     setWorkersData(w.body);
// //     setQueueData(q.body);
// //     setJobsData(j.body);
// //     setNow(new Date());
// //   }

// //   useEffect(() => {
// //     loadAll();
// //     const t = setInterval(loadAll, 3000);
// //     return () => clearInterval(t);
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [jobState]);

// //   const queue = queueData?.queue || {};
// //   const workers = workersData?.workers || [];
// //   const jobs = jobsData?.jobs || [];

// //   const busyCount = useMemo(() => workers.filter((w) => w.status === "busy").length, [workers]);

// //   const fmt = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "-";

// //   return (
// //     <>
// //       <style>{styles}</style>
// //       <div className="ad-root">
// //         <div className="ad-bg-grid" />
// //         <div className="ad-content">

// //           {/* Topbar */}
// //           <div className="ad-topbar">
// //             <div className="ad-brand">
// //               <div className="ad-brand-dot" />
// //               <div>
// //                 <div className="ad-brand-label">// admin console</div>
// //                 <div className="ad-brand-title">System Dashboard</div>
// //               </div>
// //             </div>
// //             <div className="ad-topbar-right">
// //               <span className="ad-timestamp">{now.toLocaleTimeString([], { hour12: false })} · LIVE</span>
// //               <button className="ad-logout-btn" onClick={async () => { await adminLogout(); navigate("/admin"); }}>
// //                 Logout
// //               </button>
// //             </div>
// //           </div>

// //           {error && <div className="ad-error"><span>⚠</span><span>{error}</span></div>}

// //           {/* Stats */}
// //           <div className="ad-stats">
// //             <Stat title="Alive Workers" value={workersData?.aliveWorkers ?? 0} variant="highlight" />
// //             <Stat title="Busy Workers" value={busyCount} variant={busyCount > 0 ? "highlight" : ""} />
// //             <Stat title="Waiting" value={queue.waiting ?? 0} />
// //             <Stat title="Active" value={queue.active ?? 0} />
// //             <Stat title="Completed" value={queue.completed ?? 0} variant="success" />
// //             <Stat title="Failed" value={queue.failed ?? 0} variant={queue.failed > 0 ? "danger" : ""} />
// //           </div>

// //           {/* Workers */}
// //           <div className="ad-section">
// //             <SectionTitle>Workers</SectionTitle>
// //             <div className="ad-table-wrap">
// //               <table className="ad-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Worker ID</th>
// //                     <th>Status</th>
// //                     <th>Current Job</th>
// //                     <th>Room</th>
// //                     <th>Language</th>
// //                     <th>Heartbeat</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {workers.length === 0 ? (
// //                     <tr><td colSpan="6" className="empty">— no active workers —</td></tr>
// //                   ) : (
// //                     workers.map((w) => (
// //                       <tr key={w.workerId}>
// //                         <td style={{ color: "#a0ccff" }}>{w.workerId}</td>
// //                         <td><StatusBadge status={w.status} /></td>
// //                         <td>{w.job?.jobId ?? "-"}</td>
// //                         <td>{w.job?.roomId ?? "-"}</td>
// //                         <td style={{ color: w.job?.language ? "#00b4ff" : undefined }}>{w.job?.language ?? "-"}</td>
// //                         <td>{w.ts ? fmt(w.ts) : "-"}</td>
// //                       </tr>
// //                     ))
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>

// //           {/* Jobs */}
// //           <div className="ad-section">
// //             <div className="ad-section-head">
// //               <div className="ad-section-title">
// //                 Jobs
// //                 <div className="ad-section-line" />
// //               </div>
// //               <div className="ad-filter-row">
// //                 {JOB_STATES.map((s) => (
// //                   <button
// //                     key={s}
// //                     className={`ad-filter-btn${jobState === s ? " active" : ""}`}
// //                     onClick={() => setJobState(s)}
// //                   >
// //                     {s}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>
// //             <div className="ad-table-wrap">
// //               <table className="ad-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Job ID</th>
// //                     <th>Room</th>
// //                     <th>Language</th>
// //                     <th>Worker</th>
// //                     <th>Created</th>
// //                     <th>Started</th>
// //                     <th>Finished</th>
// //                     <th>Error</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {jobs.length === 0 ? (
// //                     <tr><td colSpan="8" className="empty">— no jobs in "{jobState}" —</td></tr>
// //                   ) : (
// //                     jobs.map((j) => (
// //                       <tr key={String(j.id)}>
// //                         <td style={{ color: "#a0ccff" }}>{j.id}</td>
// //                         <td>{j.data?.roomId ?? "-"}</td>
// //                         <td style={{ color: j.data?.language ? "#00b4ff" : undefined }}>{j.data?.language ?? "-"}</td>
// //                         <td>{j.data?.workerId || j.progress?.workerId || "-"}</td>
// //                         <td>{fmt(j.timestamp)}</td>
// //                         <td>{fmt(j.processedOn)}</td>
// //                         <td>{fmt(j.finishedOn)}</td>
// //                         <td style={{ color: j.failedReason ? "#ff6070" : undefined, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
// //                           {j.failedReason || "-"}
// //                         </td>
// //                       </tr>
// //                     ))
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>

// //         </div>
// //       </div>
// //     </>
// //   );
// // }

// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { adminLogout, getJobs, getQueueStats, getWorkers } from "../../services/adminApi";

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   .ad-root {
//     min-height: 100vh;
//     background: #020d1a;
//     font-family: 'Rajdhani', sans-serif;
//     color: #c8e8ff;
//   }

//   .ad-bg-grid {
//     position: fixed;
//     inset: 0;
//     background-image:
//       linear-gradient(rgba(0,180,255,0.03) 1px, transparent 1px),
//       linear-gradient(90deg, rgba(0,180,255,0.03) 1px, transparent 1px);
//     background-size: 40px 40px;
//     pointer-events: none;
//     z-index: 0;
//   }

//   .ad-content {
//     position: relative;
//     z-index: 1;
//     max-width: 1400px;
//     margin: 0 auto;
//     padding: 0 24px 40px;
//   }

//   /* TOPBAR */
//   .ad-topbar {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     padding: 18px 0 16px;
//     border-bottom: 1px solid rgba(0,180,255,0.12);
//     margin-bottom: 28px;
//   }

//   .ad-brand { display: flex; align-items: center; gap: 12px; }

//   .ad-brand-dot {
//     width: 8px; height: 8px;
//     border-radius: 50%;
//     background: #00b4ff;
//     box-shadow: 0 0 8px #00b4ff;
//     animation: ad-pulse 2s ease-in-out infinite;
//   }

//   @keyframes ad-pulse {
//     0%,100% { opacity: 1; }
//     50%      { opacity: 0.4; }
//   }

//   .ad-brand-label {
//     font-family: 'Share Tech Mono', monospace;
//     font-size: 11px;
//     letter-spacing: 3px;
//     color: rgba(0,180,255,0.6);
//     text-transform: uppercase;
//   }

//   .ad-brand-title { font-size: 20px; font-weight: 700; color: #e8f4ff; letter-spacing: 1px; }

//   .ad-topbar-right { display: flex; align-items: center; gap: 16px; }

//   .ad-timestamp {
//     font-family: 'Share Tech Mono', monospace;
//     font-size: 11px;
//     color: rgba(100,160,220,0.4);
//     letter-spacing: 1px;
//   }

//   .ad-logout-btn {
//     background: transparent;
//     border: 1px solid rgba(0,180,255,0.2);
//     border-radius: 2px;
//     color: rgba(0,180,255,0.7);
//     padding: 7px 18px;
//     font-family: 'Rajdhani', sans-serif;
//     font-size: 13px;
//     font-weight: 600;
//     letter-spacing: 2px;
//     text-transform: uppercase;
//     cursor: pointer;
//     transition: all 0.2s;
//   }
//   .ad-logout-btn:hover { background: rgba(0,180,255,0.08); border-color: rgba(0,180,255,0.45); color: #00b4ff; }

//   /* ERROR */
//   .ad-error {
//     display: flex; align-items: center; gap: 8px;
//     padding: 10px 16px;
//     background: rgba(220,30,60,0.1);
//     border: 1px solid rgba(220,30,60,0.25);
//     border-radius: 2px;
//     color: #ff6070;
//     font-size: 13px;
//     font-family: 'Share Tech Mono', monospace;
//     margin-bottom: 20px;
//   }

//   /* STAT GRID */
//   .ad-stats {
//     display: grid;
//     grid-template-columns: repeat(6, 1fr);
//     gap: 12px;
//     margin-bottom: 32px;
//   }
//   @media (max-width: 900px) { .ad-stats { grid-template-columns: repeat(3, 1fr); } }

//   .ad-stat {
//     background: rgba(4,20,44,0.8);
//     border: 1px solid rgba(0,180,255,0.12);
//     border-radius: 2px;
//     padding: 16px 18px;
//     position: relative;
//     overflow: hidden;
//     transition: border-color 0.2s;
//   }
//   .ad-stat::before {
//     content: '';
//     position: absolute; top: 0; left: 0; right: 0; height: 2px;
//     background: linear-gradient(90deg, transparent, rgba(0,180,255,0.4), transparent);
//   }
//   .ad-stat:hover { border-color: rgba(0,180,255,0.28); }

//   .ad-stat-label {
//     font-family: 'Share Tech Mono', monospace;
//     font-size: 9px; letter-spacing: 2px;
//     color: rgba(0,180,255,0.5);
//     text-transform: uppercase;
//     margin-bottom: 8px;
//   }

//   .ad-stat-value { font-size: 30px; font-weight: 700; color: #e8f4ff; line-height: 1; }
//   .ad-stat-value.highlight { color: #00b4ff; }
//   .ad-stat-value.danger    { color: #ff4a5a; }
//   .ad-stat-value.success   { color: #00d98b; }

//   /* SECTION */
//   .ad-section { margin-bottom: 32px; }

//   .ad-section-head {
//     display: flex; align-items: center; justify-content: space-between;
//     margin-bottom: 14px;
//   }

//   .ad-section-title {
//     display: flex; align-items: center; gap: 10px;
//     font-size: 14px; font-weight: 700; letter-spacing: 3px;
//     text-transform: uppercase; color: rgba(0,180,255,0.8);
//     font-family: 'Share Tech Mono', monospace;
//   }

//   .ad-section-line {
//     flex: 1; margin-left: 16px; height: 1px;
//     background: linear-gradient(90deg, rgba(0,180,255,0.2), transparent);
//   }

//   /* TABLE */
//   .ad-table-wrap {
//     background: rgba(4,20,44,0.7);
//     border: 1px solid rgba(0,180,255,0.12);
//     border-radius: 2px;
//     overflow-x: auto;
//   }

//   .ad-table-wrap.scrollable {
//     max-height: 420px;
//     overflow-y: auto;
//   }
//   .ad-table-wrap.scrollable::-webkit-scrollbar       { width: 6px; height: 6px; }
//   .ad-table-wrap.scrollable::-webkit-scrollbar-track { background: rgba(0,20,50,0.6); }
//   .ad-table-wrap.scrollable::-webkit-scrollbar-thumb { background: rgba(0,180,255,0.25); border-radius: 3px; }
//   .ad-table-wrap.scrollable::-webkit-scrollbar-thumb:hover { background: rgba(0,180,255,0.45); }
//   .ad-table-wrap.scrollable thead th {
//     position: sticky; top: 0;
//     background: rgba(4,16,38,0.97);
//     z-index: 1;
//   }

//   .ad-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
//   .ad-table thead tr { border-bottom: 1px solid rgba(0,180,255,0.15); }

//   .ad-table th {
//     font-family: 'Share Tech Mono', monospace;
//     font-size: 9px; letter-spacing: 2px;
//     color: rgba(0,180,255,0.5);
//     text-transform: uppercase; text-align: left;
//     padding: 13px 16px; font-weight: 400; white-space: nowrap;
//   }

//   .ad-table tbody tr { border-bottom: 1px solid rgba(0,100,180,0.08); transition: background 0.15s; }
//   .ad-table tbody tr:hover      { background: rgba(0,100,255,0.05); }
//   .ad-table tbody tr:last-child { border-bottom: none; }

//   .ad-table td {
//     padding: 12px 16px;
//     color: rgba(180,220,255,0.75);
//     font-family: 'Share Tech Mono', monospace;
//     font-size: 12px; white-space: nowrap;
//   }

//   .ad-table td.empty {
//     color: rgba(100,160,220,0.25); text-align: center;
//     padding: 24px; letter-spacing: 2px; font-size: 11px; text-transform: uppercase;
//   }

//   /* WORKER BADGES */
//   .ad-badge {
//     display: inline-flex; align-items: center; gap: 5px;
//     padding: 3px 8px; border-radius: 2px;
//     font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;
//   }
//   .ad-badge.busy    { background: rgba(255,160,0,0.1);   border: 1px solid rgba(255,160,0,0.3);   color: #ffb347; }
//   .ad-badge.idle    { background: rgba(0,217,139,0.08);  border: 1px solid rgba(0,217,139,0.2);   color: #00d98b; }
//   .ad-badge.offline { background: rgba(120,140,180,0.08);border: 1px solid rgba(120,140,180,0.2); color: rgba(150,170,200,0.6); }
//   .ad-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

//   /* JOB FILTER */
//   .ad-filter-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

//   .ad-filter-btn {
//     background: transparent;
//     border: 1px solid rgba(0,180,255,0.15);
//     border-radius: 2px;
//     color: rgba(100,160,220,0.5);
//     padding: 5px 14px;
//     font-family: 'Share Tech Mono', monospace;
//     font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
//     cursor: pointer; transition: all 0.15s;
//   }
//   .ad-filter-btn:hover  { border-color: rgba(0,180,255,0.35); color: rgba(0,180,255,0.8); }
//   .ad-filter-btn.active { background: rgba(0,100,255,0.15); border-color: rgba(0,180,255,0.4); color: #00b4ff; }
//   .ad-filter-btn.all-btn.active { background: rgba(180,100,255,0.12); border-color: rgba(180,100,255,0.4); color: #c87aff; }
// `;

// const JOB_STATES = ["active", "waiting", "completed", "failed", "delayed"];

// const JOB_STATUS_STYLES = {
//   active:    { bg: "rgba(0,180,255,0.1)",    border: "rgba(0,180,255,0.3)",    color: "#00b4ff" },
//   waiting:   { bg: "rgba(255,200,0,0.08)",   border: "rgba(255,200,0,0.25)",   color: "#ffc800" },
//   completed: { bg: "rgba(0,217,139,0.08)",   border: "rgba(0,217,139,0.2)",    color: "#00d98b" },
//   failed:    { bg: "rgba(255,60,80,0.1)",    border: "rgba(255,60,80,0.3)",    color: "#ff4a5a" },
//   delayed:   { bg: "rgba(180,100,255,0.08)", border: "rgba(180,100,255,0.25)", color: "#c87aff" },
// };

// function WorkerStatusBadge({ status }) {
//   const cls = status === "busy" ? "busy" : status === "idle" ? "idle" : "offline";
//   return (
//     <span className={`ad-badge ${cls}`}>
//       <span className="ad-badge-dot" />
//       {status}
//     </span>
//   );
// }

// function JobStatusBadge({ status }) {
//   const s = JOB_STATUS_STYLES[status] ?? JOB_STATUS_STYLES.waiting;
//   return (
//     <span style={{
//       display: "inline-flex", alignItems: "center", gap: 5,
//       padding: "3px 8px", borderRadius: 2,
//       fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600,
//       background: s.bg, border: `1px solid ${s.border}`, color: s.color,
//     }}>
//       <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
//       {status}
//     </span>
//   );
// }

// function Stat({ title, value, variant }) {
//   return (
//     <div className="ad-stat">
//       <div className="ad-stat-label">{title}</div>
//       <div className={`ad-stat-value ${variant || ""}`}>{value}</div>
//     </div>
//   );
// }

// function SectionTitle({ children }) {
//   return (
//     <div className="ad-section-head">
//       <div className="ad-section-title">
//         <span>{children}</span>
//         <div className="ad-section-line" />
//       </div>
//     </div>
//   );
// }

// export default function AdminDashboard() {
//   const navigate = useNavigate();
//   const [workersData, setWorkersData] = useState(null);
//   const [queueData,   setQueueData]   = useState(null);
//   const [jobsData,    setJobsData]    = useState(null);
//   const [jobState,    setJobState]    = useState("active");
//   const [error,       setError]       = useState("");
//   const [now,         setNow]         = useState(new Date());

//   async function loadAll() {
//     setError("");
  
//     const [w, q, j] = await Promise.allSettled([
//       getWorkers(),
//       getQueueStats(),
//       getJobs(jobState, 0, 30),
//     ]);
  
//     // extract safely
//     const workersRes = w.status === "fulfilled" ? w.value : null;
//     const queueRes   = q.status === "fulfilled" ? q.value : null;
//     const jobsRes    = j.status === "fulfilled" ? j.value : null;
  
//     // handle auth ONLY if all fail
//     if (
//       workersRes?.status === 401 &&
//       queueRes?.status === 401 &&
//       jobsRes?.status === 401
//     ) {
//       navigate("/admin");
//       return;
//     }
  
//     // set fallback-safe data
//     setWorkersData(workersRes?.ok ? workersRes.body : { workers: [] });
//     setQueueData(queueRes?.ok ? queueRes.body : { queue: {} });
//     setJobsData(jobsRes?.ok ? jobsRes.body : { jobs: [] });
  
//     // optional error (non-breaking)
//     if (!workersRes?.ok || !queueRes?.ok || !jobsRes?.ok) {
//       setError("Some data failed to load");
//     }
  
//     setNow(new Date());
//   }

//   useEffect(() => {
//     loadAll();
//     const t = setInterval(loadAll, 3000);
//     return () => clearInterval(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [jobState]);

//   const queue     = queueData?.queue || {};
//   const workers   = workersData?.workers || [];
//   const jobs      = jobsData?.jobs || [];
//   const busyCount = useMemo(() => workers.filter((w) => w.status === "busy").length, [workers]);
//   const fmt       = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "-";
//   const isAll     = jobState === "all";

//   return (
//     <>
//       <style>{styles}</style>
//       <div className="ad-root">
//         <div className="ad-bg-grid" />
//         <div className="ad-content">

//           {/* Topbar */}
//           <div className="ad-topbar">
//             <div className="ad-brand">
//               <div className="ad-brand-dot" />
//               <div>
//                 <div className="ad-brand-label">// admin console</div>
//                 <div className="ad-brand-title">System Dashboard</div>
//               </div>
//             </div>
//             <div className="ad-topbar-right">
//               <span className="ad-timestamp">{now.toLocaleTimeString([], { hour12: false })} · LIVE</span>
//               <button className="ad-logout-btn" onClick={async () => { await adminLogout(); navigate("/admin"); }}>
//                 Logout
//               </button>
//             </div>
//           </div>

//           {error && <div className="ad-error"><span>⚠</span><span>{error}</span></div>}

//           {/* Stats */}
//           <div className="ad-stats">
//             <Stat title="Alive Workers" value={workersData?.aliveWorkers ?? 0} variant="highlight" />
//             <Stat title="Busy Workers"  value={busyCount} variant={busyCount > 0 ? "highlight" : ""} />
//             <Stat title="Waiting"       value={queue.waiting ?? 0} />
//             <Stat title="Active"        value={queue.active ?? 0} />
//             <Stat title="Completed"     value={queue.completed ?? 0} variant="success" />
//             <Stat title="Failed"        value={queue.failed ?? 0} variant={queue.failed > 0 ? "danger" : ""} />
//           </div>

//           {/* Workers */}
//           <div className="ad-section">
//             <SectionTitle>Workers</SectionTitle>
//             <div className="ad-table-wrap">
//               <table className="ad-table">
//                 <thead>
//                   <tr>
//                     <th>Worker ID</th>
//                     <th>Status</th>
//                     <th>Current Job</th>
//                     <th>Room</th>
//                     <th>Language</th>
//                     <th>Heartbeat</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {workers.length === 0 ? (
//                     <tr><td colSpan="6" className="empty">— no active workers —</td></tr>
//                   ) : (
//                     workers.map((w) => (
//                       <tr key={w.workerId}>
//                         <td style={{ color: "#a0ccff" }}>{w.workerId}</td>
//                         <td><WorkerStatusBadge status={w.status} /></td>
//                         <td>{w.job?.jobId ?? "-"}</td>
//                         <td>{w.job?.roomId ?? "-"}</td>
//                         <td style={{ color: w.job?.language ? "#00b4ff" : undefined }}>{w.job?.language ?? "-"}</td>
//                         <td>{w.ts ? fmt(w.ts) : "-"}</td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Jobs */}
//           <div className="ad-section">
//             <div className="ad-section-head">
//               <div className="ad-section-title">
//                 Jobs
//                 <div className="ad-section-line" />
//               </div>
//               <div className="ad-filter-row">
//                 {JOB_STATES.map((s) => (
//                   <button
//                     key={s}
//                     className={`ad-filter-btn${s === "all" ? " all-btn" : ""}${jobState === s ? " active" : ""}`}
//                     onClick={() => setJobState(s)}
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="ad-table-wrap scrollable">
//               <table className="ad-table">
//                 <thead>
//                   <tr>
//                     <th>Job ID</th>
//                     <th>Room</th>
//                     <th>Language</th>
//                     <th>Worker</th>
//                     {isAll && <th>Status</th>}
//                     <th>Created</th>
//                     <th>Started</th>
//                     <th>Finished</th>
//                     <th>Error</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {jobs.length === 0 ? (
//                     <tr>
//                       <td colSpan={isAll ? 9 : 8} className="empty">
//                         — no jobs in "{jobState}" —
//                       </td>
//                     </tr>
//                   ) : (
//                     jobs.map((j) => (
//                       <tr key={String(j.id)}>
//                         <td style={{ color: "#a0ccff" }}>{j.id}</td>
//                         <td>{j.data?.roomId ?? "-"}</td>
//                         <td style={{ color: j.data?.language ? "#00b4ff" : undefined }}>{j.data?.language ?? "-"}</td>
//                         <td>{j.data?.workerId || j.progress?.workerId || "-"}</td>
//                         {isAll && <td><JobStatusBadge status={j._status} /></td>}
//                         <td>{fmt(j.timestamp)}</td>
//                         <td>{fmt(j.processedOn)}</td>
//                         <td>{fmt(j.finishedOn)}</td>
//                         <td style={{ color: j.failedReason ? "#ff6070" : undefined, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
//                           {j.failedReason || "-"}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogout, getJobs, getQueueStats, getWorkers } from "../../services/adminApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ad-root {
    min-height: 100vh;
    background: #020d1a;
    font-family: 'Rajdhani', sans-serif;
    color: #c8e8ff;
  }

  .ad-bg-grid {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,180,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,180,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .ad-content {
    position: relative;
    z-index: 1;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  /* TOPBAR */
  .ad-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 0 16px;
    border-bottom: 1px solid rgba(0,180,255,0.12);
    margin-bottom: 28px;
  }

  .ad-brand { display: flex; align-items: center; gap: 12px; }

  .ad-brand-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #00b4ff;
    box-shadow: 0 0 8px #00b4ff;
    animation: ad-pulse 2s ease-in-out infinite;
  }

  @keyframes ad-pulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }

  .ad-brand-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    color: rgba(0,180,255,0.6);
    text-transform: uppercase;
  }

  .ad-brand-title { font-size: 20px; font-weight: 700; color: #e8f4ff; letter-spacing: 1px; }

  .ad-topbar-right { display: flex; align-items: center; gap: 16px; }

  .ad-timestamp {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    color: rgba(100,160,220,0.4);
    letter-spacing: 1px;
  }

  .ad-logout-btn {
    background: transparent;
    border: 1px solid rgba(0,180,255,0.2);
    border-radius: 2px;
    color: rgba(0,180,255,0.7);
    padding: 7px 18px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ad-logout-btn:hover { background: rgba(0,180,255,0.08); border-color: rgba(0,180,255,0.45); color: #00b4ff; }

  /* ERROR */
  .ad-error {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px;
    background: rgba(220,30,60,0.1);
    border: 1px solid rgba(220,30,60,0.25);
    border-radius: 2px;
    color: #ff6070;
    font-size: 13px;
    font-family: 'Share Tech Mono', monospace;
    margin-bottom: 20px;
  }

  /* STAT GRID */
  .ad-stats {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-bottom: 32px;
  }
  @media (max-width: 900px) { .ad-stats { grid-template-columns: repeat(3, 1fr); } }

  .ad-stat {
    background: rgba(4,20,44,0.8);
    border: 1px solid rgba(0,180,255,0.12);
    border-radius: 2px;
    padding: 16px 18px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .ad-stat::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0,180,255,0.4), transparent);
  }
  .ad-stat:hover { border-color: rgba(0,180,255,0.28); }

  .ad-stat-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; letter-spacing: 2px;
    color: rgba(0,180,255,0.5);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .ad-stat-value { font-size: 30px; font-weight: 700; color: #e8f4ff; line-height: 1; }
  .ad-stat-value.highlight { color: #00b4ff; }
  .ad-stat-value.danger    { color: #ff4a5a; }
  .ad-stat-value.success   { color: #00d98b; }

  /* SECTION */
  .ad-section { margin-bottom: 32px; }

  .ad-section-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }

  .ad-section-title {
    display: flex; align-items: center; gap: 10px;
    font-size: 14px; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase; color: rgba(0,180,255,0.8);
    font-family: 'Share Tech Mono', monospace;
  }

  .ad-section-line {
    flex: 1; margin-left: 16px; height: 1px;
    background: linear-gradient(90deg, rgba(0,180,255,0.2), transparent);
  }

  /* TABLE */
  .ad-table-wrap {
    background: rgba(4,20,44,0.7);
    border: 1px solid rgba(0,180,255,0.12);
    border-radius: 2px;
    overflow-x: auto;
  }

  .ad-table-wrap.scrollable {
    max-height: 420px;
    overflow-y: auto;
  }
  .ad-table-wrap.scrollable::-webkit-scrollbar       { width: 6px; height: 6px; }
  .ad-table-wrap.scrollable::-webkit-scrollbar-track { background: rgba(0,20,50,0.6); }
  .ad-table-wrap.scrollable::-webkit-scrollbar-thumb { background: rgba(0,180,255,0.25); border-radius: 3px; }
  .ad-table-wrap.scrollable::-webkit-scrollbar-thumb:hover { background: rgba(0,180,255,0.45); }
  .ad-table-wrap.scrollable thead th {
    position: sticky; top: 0;
    background: rgba(4,16,38,0.97);
    z-index: 1;
  }

  .ad-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .ad-table thead tr { border-bottom: 1px solid rgba(0,180,255,0.15); }

  .ad-table th {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; letter-spacing: 2px;
    color: rgba(0,180,255,0.5);
    text-transform: uppercase; text-align: left;
    padding: 13px 16px; font-weight: 400; white-space: nowrap;
  }

  .ad-table tbody tr { border-bottom: 1px solid rgba(0,100,180,0.08); transition: background 0.15s; }
  .ad-table tbody tr:hover      { background: rgba(0,100,255,0.05); }
  .ad-table tbody tr:last-child { border-bottom: none; }

  .ad-table td {
    padding: 12px 16px;
    color: rgba(180,220,255,0.75);
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px; white-space: nowrap;
  }

  .ad-table td.empty {
    color: rgba(100,160,220,0.25); text-align: center;
    padding: 24px; letter-spacing: 2px; font-size: 11px; text-transform: uppercase;
  }

  /* WORKER BADGES */
  .ad-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 8px; border-radius: 2px;
    font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;
  }
  .ad-badge.busy    { background: rgba(255,160,0,0.1);   border: 1px solid rgba(255,160,0,0.3);   color: #ffb347; }
  .ad-badge.idle    { background: rgba(0,217,139,0.08);  border: 1px solid rgba(0,217,139,0.2);   color: #00d98b; }
  .ad-badge.offline { background: rgba(120,140,180,0.08);border: 1px solid rgba(120,140,180,0.2); color: rgba(150,170,200,0.6); }
  .ad-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  /* JOB FILTER */
  .ad-filter-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

  .ad-filter-btn {
    background: transparent;
    border: 1px solid rgba(0,180,255,0.15);
    border-radius: 2px;
    color: rgba(100,160,220,0.5);
    padding: 5px 14px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
  }
  .ad-filter-btn:hover  { border-color: rgba(0,180,255,0.35); color: rgba(0,180,255,0.8); }
  .ad-filter-btn.active { background: rgba(0,100,255,0.15); border-color: rgba(0,180,255,0.4); color: #00b4ff; }
  .ad-filter-btn.all-btn.active { background: rgba(180,100,255,0.12); border-color: rgba(180,100,255,0.4); color: #c87aff; }
`;

const JOB_STATES  = ["active", "waiting", "completed", "failed", "delayed", "all"];
const ALL_STATES  = ["active", "waiting", "completed", "failed", "delayed"];

const JOB_STATUS_STYLES = {
  active:    { bg: "rgba(0,180,255,0.1)",    border: "rgba(0,180,255,0.3)",    color: "#00b4ff" },
  waiting:   { bg: "rgba(255,200,0,0.08)",   border: "rgba(255,200,0,0.25)",   color: "#ffc800" },
  completed: { bg: "rgba(0,217,139,0.08)",   border: "rgba(0,217,139,0.2)",    color: "#00d98b" },
  failed:    { bg: "rgba(255,60,80,0.1)",    border: "rgba(255,60,80,0.3)",    color: "#ff4a5a" },
  delayed:   { bg: "rgba(180,100,255,0.08)", border: "rgba(180,100,255,0.25)", color: "#c87aff" },
};

function WorkerStatusBadge({ status }) {
  const cls = status === "busy" ? "busy" : status === "idle" ? "idle" : "offline";
  return (
    <span className={`ad-badge ${cls}`}>
      <span className="ad-badge-dot" />
      {status}
    </span>
  );
}

function JobStatusBadge({ status }) {
  const s = JOB_STATUS_STYLES[status] ?? JOB_STATUS_STYLES.waiting;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 2,
      fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
      {status}
    </span>
  );
}

function Stat({ title, value, variant }) {
  return (
    <div className="ad-stat">
      <div className="ad-stat-label">{title}</div>
      <div className={`ad-stat-value ${variant || ""}`}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="ad-section-head">
      <div className="ad-section-title">
        <span>{children}</span>
        <div className="ad-section-line" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [workersData, setWorkersData] = useState(null);
  const [queueData,   setQueueData]   = useState(null);
  const [jobsData,    setJobsData]    = useState(null);
  const [jobState,    setJobState]    = useState("active");
  const [error,       setError]       = useState("");
  const [now,         setNow]         = useState(new Date());

  async function loadAll() {
    setError("");

    if (jobState === "all") {
      const [w, q, ...jobResults] = await Promise.all([
        getWorkers(),
        getQueueStats(),
        ...ALL_STATES.map((s) => getJobs(s, 0, 100)),
      ]);
      if ([w, q, ...jobResults].some((r) => r.status === 401)) { navigate("/admin"); return; }
      if (!w.ok || !q.ok) {
        setError(w.body?.error || q.body?.error || "Failed to load dashboard data");
        return;
      }
      setWorkersData(w.body);
      setQueueData(q.body);
      const merged = jobResults
        .flatMap((r, i) =>
          (r.ok ? (r.body?.jobs ?? []).map((job) => ({ ...job, _status: ALL_STATES[i] })) : [])
        )
        .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
      setJobsData({ jobs: merged });
      setNow(new Date());
      return;
    }

    const [w, q, j] = await Promise.all([
      getWorkers(),
      getQueueStats(),
      getJobs(jobState, 0, 30),
    ]);
    if ([w, q, j].some((r) => r.status === 401)) { navigate("/admin"); return; }
    if (!w.ok || !q.ok || !j.ok) {
      setError(w.body?.error || q.body?.error || j.body?.error || "Failed to load dashboard data");
      return;
    }
    setWorkersData(w.body);
    setQueueData(q.body);
    setJobsData(j.body);
    setNow(new Date());
  }

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobState]);

  const queue     = queueData?.queue || {};
  const workers   = workersData?.workers || [];
  const jobs      = jobsData?.jobs || [];
  const busyCount = useMemo(() => workers.filter((w) => w.status === "busy").length, [workers]);
  const fmt       = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "-";
  const isAll     = jobState === "all";

  return (
    <>
      <style>{styles}</style>
      <div className="ad-root">
        <div className="ad-bg-grid" />
        <div className="ad-content">

          {/* Topbar */}
          <div className="ad-topbar">
            <div className="ad-brand">
              <div className="ad-brand-dot" />
              <div>
                <div className="ad-brand-label">// admin console</div>
                <div className="ad-brand-title">System Dashboard</div>
              </div>
            </div>
            <div className="ad-topbar-right">
              <span className="ad-timestamp">{now.toLocaleTimeString([], { hour12: false })} · LIVE</span>
              <button className="ad-logout-btn" onClick={async () => { await adminLogout(); navigate("/admin"); }}>
                Logout
              </button>
            </div>
          </div>

          {error && <div className="ad-error"><span>⚠</span><span>{error}</span></div>}

          {/* Stats */}
          <div className="ad-stats">
            <Stat title="Alive Workers" value={workersData?.aliveWorkers ?? 0} variant="highlight" />
            <Stat title="Busy Workers"  value={busyCount} variant={busyCount > 0 ? "highlight" : ""} />
            <Stat title="Waiting"       value={queue.waiting ?? 0} />
            <Stat title="Active"        value={queue.active ?? 0} />
            <Stat title="Completed"     value={queue.completed ?? 0} variant="success" />
            <Stat title="Failed"        value={queue.failed ?? 0} variant={queue.failed > 0 ? "danger" : ""} />
          </div>

          {/* Workers */}
          <div className="ad-section">
            <SectionTitle>Workers</SectionTitle>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Worker ID</th>
                    <th>Status</th>
                    <th>Current Job</th>
                    <th>Room</th>
                    <th>Language</th>
                    <th>Heartbeat</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.length === 0 ? (
                    <tr><td colSpan="6" className="empty">— no active workers —</td></tr>
                  ) : (
                    workers.map((w) => (
                      <tr key={w.workerId}>
                        <td style={{ color: "#a0ccff" }}>{w.workerId}</td>
                        <td><WorkerStatusBadge status={w.status} /></td>
                        <td>{w.job?.jobId ?? "-"}</td>
                        <td>{w.job?.roomId ?? "-"}</td>
                        <td style={{ color: w.job?.language ? "#00b4ff" : undefined }}>{w.job?.language ?? "-"}</td>
                        <td>{w.ts ? fmt(w.ts) : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Jobs */}
          <div className="ad-section">
            <div className="ad-section-head">
              <div className="ad-section-title">
                Jobs
                <div className="ad-section-line" />
              </div>
              <div className="ad-filter-row">
                {JOB_STATES.map((s) => (
                  <button
                    key={s}
                    className={`ad-filter-btn${s === "all" ? " all-btn" : ""}${jobState === s ? " active" : ""}`}
                    onClick={() => setJobState(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="ad-table-wrap scrollable">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Room</th>
                    <th>Language</th>
                    <th>Worker</th>
                    {isAll && <th>Status</th>}
                    <th>Created</th>
                    <th>Started</th>
                    <th>Finished</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={isAll ? 9 : 8} className="empty">
                        — no jobs in "{jobState}" —
                      </td>
                    </tr>
                  ) : (
                    jobs.map((j) => (
                      <tr key={String(j.id)}>
                        <td style={{ color: "#a0ccff" }}>{j.id}</td>
                        <td>{j.data?.roomId ?? "-"}</td>
                        <td style={{ color: j.data?.language ? "#00b4ff" : undefined }}>{j.data?.language ?? "-"}</td>
                        <td>{j.data?.workerId || j.progress?.workerId || "-"}</td>
                        {isAll && <td><JobStatusBadge status={j._status} /></td>}
                        <td>{fmt(j.timestamp)}</td>
                        <td>{fmt(j.processedOn)}</td>
                        <td>{fmt(j.finishedOn)}</td>
                        <td style={{ color: j.failedReason ? "#ff6070" : undefined, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {j.failedReason || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}