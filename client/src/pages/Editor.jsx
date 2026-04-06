import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import * as Y from "yjs";
import { useYjs } from "../hooks/useYjs.js";
import Toolbar, { LANGUAGES } from "../components/Toolbar.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import UsersSidebar from "../components/UsersSidebar.jsx";
import AiPanel from "../components/AiPanel.jsx";

const SERVER = "http://localhost:3001";

// Starter snippets for every language in the full list
const SNIPPETS = {
  python:     'print("Hello from Python!")',
  javascript: 'console.log("Hello from JavaScript!");',
  typescript: 'const greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet("TypeScript"));',
  java:       'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
  cpp:        '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}',
  c:          '#include <stdio.h>\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
  go:         'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello from Go!")\n}',
  rust:       'fn main() {\n    println!("Hello from Rust!");\n}',
  csharp:     'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C#!");\n    }\n}',
  kotlin:     'fun main() {\n    println("Hello from Kotlin!")\n}',
  swift:      'import Foundation\nprint("Hello from Swift!")',
  ruby:       'puts "Hello from Ruby!"',
  php:        '<?php\necho "Hello from PHP!\\n";',
  scala:      'object Main extends App {\n    println("Hello from Scala!")\n}',
  r:          'cat("Hello from R!\\n")',
  dart:       'void main() {\n  print("Hello from Dart!");\n}',
  bash:       '#!/bin/bash\necho "Hello from Bash!"',
  sql:        'SELECT \'Hello from SQL!\' AS greeting;',
};

export default function Editor({ roomCode, userInfo, onLeave }) {
  const [theme, setTheme]             = useState("dark");
  const [lang, setLang]               = useState("python");
  const [users, setUsers]             = useState([]);
  const [messages, setMessages]       = useState([]);
  const [output, setOutput]           = useState([]);
  const [isRunning, setIsRunning]     = useState(false);
  const [chatOpen, setChatOpen]       = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen]           = useState(false);
  const [connected, setConnected]     = useState(false);
  const [awareness, setAwareness]     = useState({});
  const [editorCode, setEditorCode]   = useState(""); // mirror for AI context

  const socketRef    = useRef(null);
  const langRef      = useRef(lang);
  const editorRef    = useRef(null);
  const applyingRef  = useRef(false);
  const cursorTimers = useRef({});
  const cursorLabels = useRef({});
  const runnerRef = useRef("");
  const yjs = useYjs();

  const seedSnippet = useCallback((l) => {
    if (yjs.getContent(l) === "") {
      yjs.setContent(l, SNIPPETS[l] || `// Start coding in ${l}...`);
    }
  }, [yjs]);

  // ── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SERVER, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      seedSnippet("python");
      socket.emit("room:join", {
        roomId: roomCode, name: userInfo.name,
        avatarUrl: userInfo.avatarUrl, color: userInfo.color,
      });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("room:joined", ({ users, chat }) => {
      setUsers(users);
      setMessages(chat);
      socket.emit("yjs:request-state", { lang: langRef.current });
    });

    socket.on("room:users",       setUsers);
    socket.on("room:user-joined", user => setUsers(prev => [...prev.filter(u => u.id !== user.id), user]));
    socket.on("room:user-left", id => {
      setUsers(prev => prev.filter(u => u.id !== id));
      setAwareness(prev => { const n = {...prev}; delete n[id]; return n; });
      if (cursorLabels.current[id]) { cursorLabels.current[id].remove(); delete cursorLabels.current[id]; }
    });

    socket.on("yjs:update", ({ lang: l, update }) => {
      applyingRef.current = true;
      yjs.applyUpdate(l, update);
      applyingRef.current = false;
      if (l === langRef.current && editorRef.current) {
        const txt = yjs.getContent(l);
        const mdl = editorRef.current.getModel();
        if (mdl && mdl.getValue() !== txt) {
          const pos = editorRef.current.getPosition();
          mdl.setValue(txt);
          if (pos) editorRef.current.setPosition(pos);
        }
      }
    });

    socket.on("yjs:state", ({ lang: l, state }) => {
      applyingRef.current = true;
      yjs.applyUpdate(l, state);
      applyingRef.current = false;
      if (l === langRef.current && editorRef.current) {
        const txt = yjs.getContent(l);
        if (txt && editorRef.current.getModel()?.getValue() !== txt) {
          editorRef.current.getModel()?.setValue(txt);
          setEditorCode(txt);
        }
      }
    });

    socket.on("awareness:update", (user) => {
      setAwareness(prev => ({ ...prev, [user.id]: user }));
      if (editorRef.current && user.line) renderCursorLabel(user);
    });

   socket.on("chat:message", msg => setMessages(prev => [...prev, msg]));

socket.on("execution:started", ({ runnerName, language }) => {
  runnerRef.current = runnerName;
  setOutput([]);
  setIsRunning(true);
});

socket.on("execution:queued", ({ jobId }) => {
  setOutput(prev => [...prev, { type: "info", text: `${runnerRef.current || "Someone"}'s job queued…` }]);
});

socket.on("execution:output", ({ output: txt, done }) => {
  if (txt) {
    const prefix = runnerRef.current ? `${runnerRef.current} ⟶ ` : "";
    setOutput(prev => [
      ...prev,
      { type: "out", text: `${prefix}${txt}`, runner: runnerRef.current }
    ]);
    runnerRef.current = ""; // only prefix first line
  }
  if (done) setIsRunning(false);
});

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Language switch ───────────────────────────────────────────────────────
  const handleLangChange = useCallback((newLang) => {
    if (!LANGUAGES.find(l => l.id === newLang)) return; // guard invalid
    if (editorRef.current) {
      yjs.setContent(langRef.current, editorRef.current.getModel()?.getValue() || "");
    }
    langRef.current = newLang;
    setLang(newLang);
    seedSnippet(newLang);

    const content = yjs.getContent(newLang) || SNIPPETS[newLang] || `// Start coding in ${newLang}...`;
    if (editorRef.current) {
      applyingRef.current = true;
      editorRef.current.getModel()?.setValue(content);
      applyingRef.current = false;
      setEditorCode(content);
    }

    socketRef.current?.emit("yjs:request-state", { lang: newLang });
    socketRef.current?.emit("awareness:update", { lang: newLang, typing: false, line: 1 });
  }, [yjs, seedSnippet]);

  // ── Editor change ─────────────────────────────────────────────────────────
  const handleEditorChange = useCallback((value) => {
    if (applyingRef.current || !socketRef.current) return;
    const l      = langRef.current;
    const before = yjs.encodeStateVector(l);
    yjs.setContent(l, value);
    const update = yjs.encodeUpdate(l, before);
    socketRef.current.emit("yjs:update", { lang: l, update });
    setEditorCode(value);

    socketRef.current.emit("awareness:update", {
      typing: true, lang: l,
      line: editorRef.current?.getPosition()?.lineNumber ?? 1,
      col:  editorRef.current?.getPosition()?.column ?? 1,
    });
    clearTimeout(editorRef._typingTimer);
    editorRef._typingTimer = setTimeout(() => {
      socketRef.current?.emit("awareness:update", { typing: false, lang: l });
    }, 1500);
  }, [yjs]);

  // ── Cursor labels ─────────────────────────────────────────────────────────
  function renderCursorLabel(user) {
    if (!editorRef.current) return;
    const existing = cursorLabels.current[user.id];
    if (existing) existing.remove();
    const layout    = editorRef.current.getLayoutInfo();
    const lineTop   = editorRef.current.getTopForLineNumber(user.line || 1);
    const scrollTop = editorRef.current.getScrollTop();
    const top       = lineTop - scrollTop + layout.contentTop - 20;
    const container = document.getElementById("editor-wrap");
    if (!container || top < 0) return;
    const el = document.createElement("div");
    el.className     = "cursor-label";
    el.textContent   = user.name;
    el.style.cssText = `background:${user.color};top:${top}px;left:${layout.contentLeft+6}px;`;
    container.appendChild(el);
    cursorLabels.current[user.id] = el;
    clearTimeout(cursorTimers.current[user.id]);
    cursorTimers.current[user.id] = setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => { el.remove(); delete cursorLabels.current[user.id]; }, 300);
    }, 3000);
  }

  // ── Run ───────────────────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    const code = editorRef.current?.getModel()?.getValue() || "";
    if (!code.trim() || !socketRef.current) return;
    socketRef.current.emit("execution:run", { code, language: lang });
  }, [lang]);

  const sendMessage = useCallback((text) => { socketRef.current?.emit("chat:send", { text }); }, []);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  const dark = theme === "dark";

  return (
    <div className={`flex flex-col h-screen ${dark ? "dark bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Toolbar
        roomCode={roomCode}
        lang={lang}
        onLangChange={handleLangChange}
        onRun={handleRun}
        isRunning={isRunning}
        connected={connected}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleChat={() => setChatOpen(o => !o)}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onToggleAI={() => setAiOpen(o => !o)}
        chatOpen={chatOpen}
        sidebarOpen={sidebarOpen}
        aiOpen={aiOpen}
        onLeave={onLeave}
        userInfo={userInfo}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <UsersSidebar users={users} currentUserId={socketRef.current?.id} awareness={awareness} theme={theme} />
        )}

        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <div id="editor-wrap" className="flex-1 overflow-hidden relative">
            <CodeEditor
              lang={lang}
              theme={theme}
              onMount={editor => {
                editorRef.current = editor;
                const content = yjs.getContent(lang) || SNIPPETS[lang] || "";
                editor.getModel()?.setValue(content);
                setEditorCode(content);
              }}
              onChange={handleEditorChange}
              onCursorChange={pos => {
                socketRef.current?.emit("awareness:update", {
                  typing: false, lang,
                  line: pos.lineNumber, col: pos.column,
                });
              }}
            />
          </div>
          <OutputPanel output={output} onClear={() => setOutput([])} theme={theme} />
        </div>

        {chatOpen && (
          <ChatPanel
            messages={messages}
            onSend={sendMessage}
            currentUser={userInfo}
            socketId={socketRef.current?.id}
            theme={theme}
          />
        )}

        {/* AI panel — separate column on the far right */}
        <AiPanel
          theme={theme}
          currentCode={editorCode}
          currentLang={lang}
          open={aiOpen}
          onClose={() => setAiOpen(false)}
        />
      </div>
    </div>
  );
}
