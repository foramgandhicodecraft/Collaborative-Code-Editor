import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";

function Avatar({ user, size = "sm" }) {
  const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm";
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} className={clsx(dim, "rounded-full object-cover flex-shrink-0")} alt="" />;
  }
  return (
    <div className={clsx(dim, "rounded-full flex items-center justify-center font-bold text-white flex-shrink-0")}
      style={{ background: user.color }}>
      {user.name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function Message({ msg, isMine }) {
  const time = new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isMine) {
    return (
      <div className="flex flex-col items-end gap-0.5 animate-fade-in">
        <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%] break-words leading-relaxed">
          {msg.text}
        </div>
        <span className="text-xs text-gray-600 pr-1">{time} ✓</span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <Avatar user={msg} size="sm" />
      <div className="flex flex-col gap-0.5 max-w-[80%]">
        <span className="text-xs font-semibold pl-1" style={{ color: msg.color }}>{msg.name}</span>
        <div className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-2xl rounded-bl-sm px-3 py-2 break-words leading-relaxed">
          {msg.text}
        </div>
        <span className="text-xs text-gray-600 pl-1">{time}</span>
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, onSend, currentUser, socketId, theme = "dark" }) {
  const [text, setText]    = useState("");
  const bottomRef = useRef();
  const inputRef  = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  }

  // Group messages by date
  const grouped = [];
  let lastDate  = "";
  for (const msg of messages) {
    const d = new Date(msg.time).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    if (d !== lastDate) { grouped.push({ type: "date", label: d }); lastDate = d; }
    grouped.push({ type: "msg", msg });
  }

  return (
    <div className={`w-72 flex-shrink-0 flex flex-col border-l ${theme === "dark" ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-9 border-b border-gray-800 flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Room Chat</span>
        <span className="ml-auto text-xs text-gray-600">{messages.length}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {grouped.length === 0 && (
          <div className="text-center text-xs text-gray-600 mt-8">
            No messages yet.<br />Start the conversation!
          </div>
        )}
        {grouped.map((item, i) =>
          item.type === "date" ? (
            <div key={`date-${i}`} className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600 whitespace-nowrap">{item.label}</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
          ) : (
            <Message
              key={item.msg.id}
              msg={item.msg}
              isMine={item.msg.userId === socketId}
            />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-gray-800 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none resize-none focus:border-blue-500 transition-colors max-h-20 leading-relaxed"
          placeholder="Message…"
          rows={1}
          value={text}
          onChange={e => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
          }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
