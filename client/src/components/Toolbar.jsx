import React from "react";
import clsx from "clsx";
import { useState } from "react";
export const LANGUAGES = [
  { id: "python",     label: "Python"     },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "java",       label: "Java"       },
  { id: "cpp",        label: "C++"        },
  { id: "c",          label: "C"          },
  { id: "go",         label: "Go"         },
  { id: "rust",       label: "Rust"       },
  { id: "csharp",     label: "C#"         },
  { id: "kotlin",     label: "Kotlin"     },
  { id: "swift",      label: "Swift"      },
  { id: "ruby",       label: "Ruby"       },
  { id: "php",        label: "PHP"        },
  { id: "scala",      label: "Scala"      },
  { id: "r",          label: "R"          },
  { id: "dart",       label: "Dart"       },
  { id: "bash",       label: "Bash"       },
  { id: "sql",        label: "SQL"        },
];

export default function Toolbar({
  roomCode, lang, onLangChange, onRun, isRunning,
  connected, theme, onToggleTheme, onToggleChat, onToggleSidebar,
  chatOpen, sidebarOpen, onLeave, userInfo, onToggleAI, aiOpen,
}) {
  const dark = theme === "dark";
  const [toolbarCopied, setToolbarCopied] = useState(false);
  return (
    <header className={clsx(
      "flex items-center gap-1.5 px-3 h-12 border-b flex-shrink-0 z-20",
      dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
    )}>

      {/* Brand */}
      <div className="flex items-center gap-2 mr-1 flex-shrink-0">
        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <span className={clsx("font-bold text-sm hidden sm:block", dark ? "text-white" : "text-gray-900")}>
          CollabCode
        </span>
      </div>

      {/* Room badge */}
     <div className={clsx(
          "flex items-center gap-1.5 rounded-md px-2 py-1 border flex-shrink-0",
          dark ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"
        )}>
          <span className={clsx("text-xs", dark ? "text-gray-400" : "text-gray-500")}>Room</span>
          <span className="text-xs font-mono font-bold text-blue-400 tracking-wider">{roomCode}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomCode);
              setToolbarCopied(true);
              setTimeout(() => setToolbarCopied(false), 2000);
            }}
            className="text-gray-500 hover:text-blue-400 transition-colors"
            title="Copy room code"
          >
            {toolbarCopied ? (
              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <div className={clsx(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            connected ? "bg-green-400" : "bg-red-400 animate-pulse"
          )} />
        </div>

      <div className={clsx("w-px h-5 mx-0.5 flex-shrink-0", dark ? "bg-gray-700" : "bg-gray-200")} />

      {/* Language dropdown — native select, full list */}
      <select
        value={lang}
        onChange={e => onLangChange(e.target.value)}
        className={clsx(
          "text-xs font-medium rounded-lg border px-2 py-1.5 outline-none cursor-pointer transition-colors",
          dark
            ? "bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-500 focus:border-blue-500"
            : "bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-400 focus:border-blue-500"
        )}
      >
        {LANGUAGES.map(l => (
          <option key={l.id} value={l.id}>{l.label}</option>
        ))}
      </select>

      <div className={clsx("w-px h-5 mx-0.5 flex-shrink-0", dark ? "bg-gray-700" : "bg-gray-200")} />

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={isRunning}
        className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0",
          isRunning
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-500 text-white active:scale-95"
        )}
      >
        {isRunning ? (
          <>
            <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Running
          </>
        ) : (
          <><span>▶</span> Run</>
        )}
      </button>

      {/* Right-side icon buttons */}
      <div className="flex items-center gap-0.5 ml-auto">

        <IconBtn title="Toggle users panel" active={sidebarOpen} onClick={onToggleSidebar} dark={dark}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </IconBtn>

        <IconBtn title="Toggle chat" active={chatOpen} onClick={onToggleChat} dark={dark}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </IconBtn>

        {/* AI Assistant — purple accent when open */}
        <IconBtn title="AI Assistant" active={aiOpen} onClick={onToggleAI} dark={dark} highlight>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </IconBtn>

        <IconBtn title="Toggle theme" onClick={onToggleTheme} dark={dark}>
          <span className="text-sm leading-none">{dark ? "🌙" : "☀️"}</span>
        </IconBtn>

        <div className={clsx("w-px h-5 mx-1", dark ? "bg-gray-700" : "bg-gray-200")} />

        {/* User chip */}
        <div className={clsx(
          "flex items-center gap-1.5 rounded-lg px-2 py-1",
          dark ? "bg-gray-800" : "bg-gray-100"
        )}>
          {userInfo.avatarUrl ? (
            <img src={userInfo.avatarUrl} className="w-5 h-5 rounded-full object-cover flex-shrink-0" alt="" />
          ) : (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: userInfo.color }}
            >
              {userInfo.name[0].toUpperCase()}
            </div>
          )}
          <span className={clsx("text-xs hidden md:block max-w-[80px] truncate", dark ? "text-gray-300" : "text-gray-700")}>
            {userInfo.name}
          </span>
        </div>

        <button
          onClick={onLeave}
          title="Leave room"
          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors ml-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function IconBtn({ children, title, active, onClick, dark, highlight }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={clsx(
        "p-1.5 rounded-lg transition-colors",
        active
          ? highlight
            ? "text-purple-400 bg-purple-400/10"
            : "text-blue-400 bg-blue-400/10"
          : dark
            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );
}
