import React, { useRef, useEffect, useState } from "react";
import clsx from "clsx";

export default function OutputPanel({ output, onClear }) {
  const bottomRef  = useRef();
  const headerRef  = useRef();
  const panelRef   = useRef();
  const [height, setHeight]       = useState(180);
  const [collapsed, setCollapsed] = useState(false);
  const resizing   = useRef(false);
  const startY     = useRef(0);
  const startH     = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  function onMouseDown(e) {
    if (e.target === headerRef.current || headerRef.current.contains(e.target)) {
      resizing.current = true;
      startY.current   = e.clientY;
      startH.current   = height;
      document.body.style.cursor    = "ns-resize";
      document.body.style.userSelect= "none";
    }
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (!resizing.current) return;
      const delta = startY.current - e.clientY;
      setHeight(Math.max(60, Math.min(500, startH.current + delta)));
    }
    function onMouseUp() {
      resizing.current = false;
      document.body.style.cursor    = "";
      document.body.style.userSelect= "";
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className="flex flex-col border-t border-gray-800 bg-gray-950 flex-shrink-0"
      style={{ height: collapsed ? 36 : height }}
    >
      {/* Header — drag to resize */}
      <div
        ref={headerRef}
        onMouseDown={onMouseDown}
        className="flex items-center gap-2 px-3 h-9 bg-gray-900 border-b border-gray-800 flex-shrink-0 cursor-ns-resize select-none"
      >
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Output</span>
        {output.length > 0 && (
          <span className="text-xs text-gray-500">{output.length} line{output.length !== 1 ? "s" : ""}</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-300 px-2 py-0.5 rounded transition-colors"
          >
            Clear
          </button>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={() => setCollapsed(c => !c)}
            className="text-gray-500 hover:text-gray-300 px-1"
          >
            {collapsed ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
          {output.length === 0 ? (
            <span className="text-gray-600 italic">No output yet. Click Run to execute your code.</span>
          ) : (
            output.map((line, i) => (
              <div
                key={i}
                className={clsx(
                  "whitespace-pre-wrap break-all",
                  line.type === "out"  && "text-green-400",
                  line.type === "err"  && "text-red-400",
                  line.type === "info" && "text-gray-500 italic",
                )}
              >
                {line.text}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
