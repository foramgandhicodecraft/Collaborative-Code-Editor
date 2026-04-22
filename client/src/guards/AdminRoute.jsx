import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { adminMe } from "../services/adminApi";

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState("checking"); // checking | allowed | denied

  useEffect(() => {
    let mounted = true;
    adminMe().then((r) => {
      if (!mounted) return;
      setStatus(r.ok ? "allowed" : "denied");
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (status === "checking") return <div style={{ padding: 16 }}>Checking admin session...</div>;
  if (status === "denied") return <Navigate to="/admin" replace />;
  return children;
}