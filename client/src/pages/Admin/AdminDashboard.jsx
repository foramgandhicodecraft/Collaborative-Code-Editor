import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogout, getJobs, getQueueStats, getWorkers } from "../../services/adminApi";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [workersData, setWorkersData] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [jobsData, setJobsData] = useState(null);
  const [jobState, setJobState] = useState("active");
  const [error, setError] = useState("");

  async function loadAll() {
    setError("");

    const [w, q, j] = await Promise.all([
      getWorkers(),
      getQueueStats(),
      getJobs(jobState, 0, 30),
    ]);

    if ([w, q, j].some((r) => r.status === 401)) {
      navigate("/admin");
      return;
    }

    if (!w.ok || !q.ok || !j.ok) {
      setError(w.body?.error || q.body?.error || j.body?.error || "Failed to load dashboard data");
      return;
    }

    setWorkersData(w.body);
    setQueueData(q.body);
    setJobsData(j.body);
  }

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobState]);

  async function onLogout() {
    await adminLogout();
    navigate("/admin");
  }

  const queue = queueData?.queue || {};
  const workers = workersData?.workers || [];
  const jobs = jobsData?.jobs || [];

  const busyCount = useMemo(
    () => workers.filter((w) => w.status === "busy").length,
    [workers]
  );

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin Dashboard</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(120px, 1fr))", gap: 10, margin: "12px 0 20px" }}>
        <Stat title="Alive Workers" value={workersData?.aliveWorkers ?? 0} />
        <Stat title="Busy Workers" value={busyCount} />
        <Stat title="Waiting" value={queue.waiting ?? 0} />
        <Stat title="Active" value={queue.active ?? 0} />
        <Stat title="Completed" value={queue.completed ?? 0} />
        <Stat title="Failed" value={queue.failed ?? 0} />
      </div>

      <h3>Workers</h3>
      <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr style={{ background: "#f3f3f3" }}>
            <th align="left">Worker ID</th>
            <th align="left">Status</th>
            <th align="left">Current Job</th>
            <th align="left">Room</th>
            <th align="left">Language</th>
            <th align="left">Heartbeat</th>
          </tr>
        </thead>
        <tbody>
          {workers.length === 0 ? (
            <tr><td colSpan="6">No active workers</td></tr>
          ) : (
            workers.map((w) => (
              <tr key={w.workerId} style={{ borderTop: "1px solid #ddd" }}>
                <td>{w.workerId}</td>
                <td>{w.status}</td>
                <td>{w.job?.jobId ?? "-"}</td>
                <td>{w.job?.roomId ?? "-"}</td>
                <td>{w.job?.language ?? "-"}</td>
                <td>{w.ts ? new Date(w.ts).toLocaleTimeString() : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Jobs</h3>
        <select value={jobState} onChange={(e) => setJobState(e.target.value)}>
          <option value="active">active</option>
          <option value="waiting">waiting</option>
          <option value="completed">completed</option>
          <option value="failed">failed</option>
          <option value="delayed">delayed</option>
        </select>
      </div>

      <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr style={{ background: "#f3f3f3" }}>
            <th align="left">Job ID</th>
            <th align="left">Room</th>
            <th align="left">Language</th>
            <th align="left">Worker</th>
            <th align="left">Created</th>
            <th align="left">Started</th>
            <th align="left">Finished</th>
            <th align="left">Error</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr><td colSpan="8">No jobs in "{jobState}"</td></tr>
          ) : (
            jobs.map((j) => (
              <tr key={String(j.id)} style={{ borderTop: "1px solid #ddd" }}>
                <td>{j.id}</td>
                <td>{j.data?.roomId ?? "-"}</td>
                <td>{j.data?.language ?? "-"}</td>
                <td>{j.data?.workerId || j.progress?.workerId || "-"}</td>
                <td>{j.timestamp ? new Date(j.timestamp).toLocaleTimeString() : "-"}</td>
                <td>{j.processedOn ? new Date(j.processedOn).toLocaleTimeString() : "-"}</td>
                <td>{j.finishedOn ? new Date(j.finishedOn).toLocaleTimeString() : "-"}</td>
                <td>{j.failedReason || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
      <div style={{ fontSize: 12, color: "#555" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}