import React from "react";
import clsx from "clsx";

function TypingDots() {
  return (
    <div className="flex items-center gap-0.5">
      {[0,1,2].map(i => (
        <div key={i} className="typing-dot bg-current rounded-full" style={{ animationDelay: `${i*0.2}s` }} />
      ))}
    </div>
  );
}

function UserCard({ user, isSelf, awareness }) {
  const info = awareness[user.id] || {};
  const isTyping = info.typing;

  return (
    <div className={clsx(
      "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors",
      isTyping ? "bg-gray-800/80" : "hover:bg-gray-800/40"
    )}>
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
            style={{ background: user.color }}>
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        {/* Online dot */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-900" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-200 truncate">{user.name}</span>
          {isSelf && <span className="text-xs text-gray-500 flex-shrink-0">(you)</span>}
        </div>
        <div className="flex items-center gap-1 h-4">
          {isTyping ? (
            <div className="flex items-center gap-1 text-xs" style={{ color: user.color }}>
              <TypingDots />
              <span className="text-gray-500">typing</span>
            </div>
          ) : info.lang ? (
            <span className="text-xs text-gray-500">
              {info.lang}{info.line ? ` · line ${info.line}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      {/* Color dot */}
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: user.color }} />
    </div>
  );
}

export default function UsersSidebar({ users, currentUserId, awareness, theme = "dark" }) {
  return (
    <div className={`w-52 flex-shrink-0 flex flex-col border-r ${theme === "dark" ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center gap-2 px-3 h-9 border-b border-gray-800 flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Users</span>
        <span className="ml-auto bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded-full font-medium">
          {users.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {users.length === 0 ? (
          <p className="text-xs text-gray-600 text-center mt-4">No users</p>
        ) : (
          users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
              awareness={awareness}
            />
          ))
        )}
      </div>
    </div>
  );
}
