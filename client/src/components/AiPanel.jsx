import React, { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import { SERVER_URL } from "../config/server.js";

// Simple markdown-lite renderer — handles code blocks and bold
function MsgContent({ text }) {
  const parts = [];
  const codeRe = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = codeRe.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", content: text.slice(last, m.index) });
    parts.push({ type: "code", lang: m[1], content: m[2].trimEnd() });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });

  return (
    <div className="space-y-2">
      {parts.map((p, i) =>
        p.type === "code" ? (
          <pre key={i} className="bg-gray-950 rounded-lg p-3 text-xs font-mono overflow-x-auto text-green-300 border border-gray-800">
            {p.content}
          </pre>
        ) : (
          <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">{p.content}</p>
        )
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">✦</div>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm px-3 py-2">
        <div className="flex gap-1 items-center h-4">
          {[0,1,2].map(i => (
            <div key={i} className="typing-dot bg-gray-400 rounded-full" style={{ animationDelay: `${i*0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AiPanel({ theme, currentCode, currentLang, open, onClose }) {
  const [history, setHistory]   = useState([]); // {role, content}
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const bottomRef = useRef();
  const inputRef  = useRef();
  const dark = theme === "dark";

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    setHistory(h => [...h, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${SERVER_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:  trimmed,
          history:  history, // send existing history for context
          code:     currentCode || "",
          language: currentLang || "code",
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Request failed");
      } else {
        setHistory(h => [...h, { role: "assistant", content: data.answer }]);
      }
    } catch (e) {
      setError("Could not reach server. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, [loading, history, currentCode, currentLang]);

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const STARTERS = [
    "Explain this code",
    "Find bugs in this code",
    "How can I optimize this?",
    "Write a test for this function",
  ];

  if (!open) return null;

  return (
    <div className={clsx(
      "w-80 flex-shrink-0 flex flex-col border-l h-full",
      dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
    )}>
      {/* Header */}
      <div className={clsx(
        "flex items-center gap-2 px-3 h-12 border-b flex-shrink-0",
        dark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
      )}>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0">✦</div>
        <div className="flex-1 min-w-0">
          <p className={clsx("text-sm font-semibold leading-none", dark ? "text-white" : "text-gray-900")}>AI Assistant</p>
          <p className="text-xs text-gray-500 mt-0.5">Powered by LangChain · Personal</p>
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={() => { setHistory([]); setError(""); }}
              title="Clear chat"
              className={clsx("p-1 rounded text-xs transition-colors", dark ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100")}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className={clsx("p-1 rounded transition-colors", dark ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Context pill */}
      {currentCode?.trim() && (
        <div className={clsx("px-3 py-1.5 border-b flex items-center gap-2", dark ? "border-gray-800 bg-gray-850" : "border-gray-100 bg-gray-50")}>
          <svg className="w-3 h-3 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="text-xs text-gray-500 truncate">
            Using {currentLang} context ({currentCode.split("\n").length} lines)
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Welcome state */}
        {history.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-xl">✦</div>
            <div>
              <p className={clsx("text-sm font-medium", dark ? "text-gray-200" : "text-gray-800")}>
                AI Coding Assistant
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                Ask about your code, get explanations, debug issues, or learn new concepts.
              </p>
            </div>
            {/* Starter prompts */}
            <div className="flex flex-col gap-2 w-full">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className={clsx(
                    "text-xs text-left px-3 py-2 rounded-lg border transition-colors",
                    dark
                      ? "border-gray-700 text-gray-400 hover:border-purple-500/50 hover:text-gray-200 hover:bg-purple-500/5"
                      : "border-gray-200 text-gray-600 hover:border-purple-300 hover:text-gray-800 hover:bg-purple-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat history */}
        {history.map((msg, i) => (
          <div
            key={i}
            className={clsx("flex gap-2 animate-fade-in", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            {/* Avatar */}
            <div className={clsx(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 self-end",
              msg.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
            )}>
              {msg.role === "user" ? "U" : "✦"}
            </div>

            {/* Bubble */}
            <div className={clsx(
              "rounded-2xl px-3 py-2 max-w-[82%]",
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : dark
                  ? "bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-sm"
                  : "bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-sm"
            )}>
              {msg.role === "assistant"
                ? <MsgContent text={msg.content} />
                : <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              }
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={clsx("p-2 border-t", dark ? "border-gray-800" : "border-gray-200")}>
        <div className={clsx(
          "flex items-end gap-2 rounded-xl border px-2 py-1.5",
          dark ? "bg-gray-800 border-gray-700 focus-within:border-purple-500/50" : "bg-gray-50 border-gray-200 focus-within:border-purple-400"
        )}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Ask about your code…"
            disabled={loading}
            rows={1}
            className={clsx(
              "flex-1 bg-transparent text-sm outline-none resize-none leading-relaxed",
              dark ? "text-gray-200 placeholder-gray-500" : "text-gray-800 placeholder-gray-400"
            )}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0 self-end mb-0.5"
          >
            {loading
              ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            }
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1 text-center">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
