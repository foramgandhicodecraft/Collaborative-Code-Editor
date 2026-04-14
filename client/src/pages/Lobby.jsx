import React, { useState, useRef } from "react";
import { nanoid } from "nanoid";
import clsx from "clsx";

import { SERVER_URL } from "../config/server.js";
const USER_COLORS = [
  "#f87171","#fb923c","#facc15","#4ade80",
  "#34d399","#38bdf8","#818cf8","#e879f9",
];

export default function Lobby({ onJoin }) {
  const [tab, setTab]         = useState("create"); // "create" | "join"
  const [name, setName]       = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  const myColor = useRef(USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar() {
    if (!avatarFile) return null;
    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      const res  = await fetch(`${SERVER}/upload-avatar`, { method: "POST", body: fd });
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  }

  async function handleCreate() {
    if (!name.trim()) { setError("Please enter your name."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${SERVER}/create-room`, { method: "POST" });
      const data = await res.json();
      const code = data.code;
      setGeneratedCode(code);
    } catch {
      setError("Could not create room. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnter(code) {
    if (!name.trim()) { setError("Please enter your name."); return; }
    setLoading(true); setError("");
    try {
      const avatarUrl = await uploadAvatar();
      onJoin({
        code: code.toUpperCase(),
        user: { name: name.trim(), avatarUrl, color: myColor.current },
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!name.trim())       { setError("Please enter your name."); return; }
    if (joinCode.length < 6){ setError("Enter a 6-character room code."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${SERVER}/room/${joinCode.toUpperCase()}`);
      const data = await res.json();
      if (!data.exists) { setError("Room not found or is empty."); setLoading(false); return; }
      await handleEnter(joinCode);
    } catch {
      setError("Could not connect to server.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">CollabCode</span>
          </div>
          <p className="text-gray-400 text-sm">Real-time collaborative coding platform</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => fileRef.current.click()}
              className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors group flex-shrink-0"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 group-hover:bg-gray-750">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-gray-500 mt-0.5">Photo</span>
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Your name</label>
              <input
                className="input-base"
                placeholder="Enter your name..."
                value={name}
                maxLength={24}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (tab === "create" ? handleCreate() : handleJoin())}
                autoFocus
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-800 p-1 rounded-lg mb-5">
            {["create","join"].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setGeneratedCode(""); }}
                className={clsx(
                  "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                  tab === t ? "bg-gray-700 text-white shadow" : "text-gray-400 hover:text-gray-200"
                )}
              >
                {t === "create" ? "Create Room" : "Join Room"}
              </button>
            ))}
          </div>

          {tab === "create" && (
            <div className="space-y-3">
              {!generatedCode ? (
                <button onClick={handleCreate} disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? "Generating…" : "✦ Generate Room Code"}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700 relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-gray-700 transition-all"
                      title="Copy code"
                    >
                      {copied ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Share this code</p>
                    <p className="text-3xl font-bold tracking-[0.3em] text-blue-400 font-mono">{generatedCode}</p>
                    <p className="text-xs text-gray-500 mt-2">Others can join with this code</p>
                  </div>
                  <button onClick={() => handleEnter(generatedCode)} disabled={loading} className="btn-primary w-full py-2.5">
                    {loading ? "Entering…" : "Enter Room →"}
                  </button>
                  <button onClick={() => setGeneratedCode("")} className="btn-ghost w-full text-sm py-1.5">
                    Generate new code
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "join" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Room code</label>
                <input
                  className="input-base text-center font-mono tracking-[0.3em] text-lg uppercase"
                  placeholder="R4K9MX"
                  maxLength={6}
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleJoin()}
                />
              </div>
              <button onClick={handleJoin} disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? "Joining…" : "Join Room →"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Distributed • Real-time • Multi-language
        </p>
      </div>
    </div>
  );
}
