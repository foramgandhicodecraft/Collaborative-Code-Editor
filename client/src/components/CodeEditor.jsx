import React, { useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

const LANG_MAP = {
  python: "python", javascript: "javascript", typescript: "typescript",
  java: "java", cpp: "cpp", c: "c", go: "go", rust: "rust",
};

export default function CodeEditor({ lang, theme, onMount, onChange, onCursorChange }) {
  const editorRef = useRef(null);

  function handleMount(editor, monaco) {
    editorRef.current = editor;

    // Monaco editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontLigatures: true,
      lineNumbers: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: "line",
      smoothScrolling: true,
      cursorSmoothCaretAnimation: "on",
      padding: { top: 12, bottom: 12 },
      tabSize: 4,
      wordWrap: "off",
      automaticLayout: true,
    });

    // Track cursor for awareness
    editor.onDidChangeCursorPosition(e => onCursorChange?.(e.position));

    onMount?.(editor, monaco);
  }

  return (
    <MonacoEditor
      height="100%"
      language={LANG_MAP[lang] || "plaintext"}
      theme={theme === "dark" ? "vs-dark" : "vs"}
      onChange={value => onChange?.(value || "")}
      onMount={handleMount}
      options={{
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
}
