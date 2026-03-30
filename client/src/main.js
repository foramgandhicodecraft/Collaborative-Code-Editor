import * as monaco from "monaco-editor";
import * as Y from "yjs";

const RELAY_WS = "ws://localhost:1234";
const ROOM_ID  = "room-1";

const editorContainer = document.getElementById("editor-container");
const languageSelect  = document.getElementById("language-select");
const runBtn          = document.getElementById("run-btn");
const statusEl        = document.getElementById("status");
const outputPanel     = document.getElementById("output-panel");

// ─── Yjs document ─────────────────────────────────────────────────────────────
const ydoc  = new Y.Doc();
const ytext = ydoc.getText("monaco");

// ─── Sync WebSocket (Yjs) ─────────────────────────────────────────────────────
const syncSocket = new WebSocket(`${RELAY_WS}/${ROOM_ID}`);
syncSocket.binaryType = "arraybuffer";

syncSocket.onopen = () => {
  statusEl.textContent = `Connected — Room: ${ROOM_ID}`;
};
syncSocket.onclose = () => {
  statusEl.textContent = "Disconnected. Refresh to reconnect.";
};
syncSocket.onerror = () => {
  statusEl.textContent = "Connection error.";
};

// Incoming binary message = Yjs update from another client via relay
syncSocket.onmessage = (event) => {
  try {
    isApplyingRemote = true;
    Y.applyUpdate(ydoc, new Uint8Array(event.data));
    isApplyingRemote = false;
  } catch (e) {
    isApplyingRemote = false;
    console.error("Failed to apply remote Yjs update", e);
  }
};

// ─── Monaco Editor ────────────────────────────────────────────────────────────
const editor = monaco.editor.create(editorContainer, {
  value: "",
  language: "python",
  theme: "vs-dark",
  fontSize: 14,
  minimap: { enabled: false },
  automaticLayout: true,
});

// ─── Monaco ↔ Yjs binding ─────────────────────────────────────────────────────
let isApplyingRemote = false;

// Remote change arrived → update Monaco
ytext.observe(() => {
  if (!isApplyingRemote) return;
  const model   = editor.getModel();
  const newText = ytext.toString();
  if (model.getValue() !== newText) {
    const pos = editor.getPosition();
    model.setValue(newText);
    if (pos) editor.setPosition(pos);
  }
});

// Local typing → update Yjs → send delta to relay
editor.onDidChangeModelContent(() => {
  if (isApplyingRemote) return;
  const newValue = editor.getModel().getValue();
  if (newValue === ytext.toString()) return;

  const beforeVector = Y.encodeStateVector(ydoc);

  ydoc.transact(() => {
    ytext.delete(0, ytext.length);
    ytext.insert(0, newValue);
  });

  // Only send the new delta (not the whole doc)
  const update = Y.encodeStateAsUpdate(ydoc, beforeVector);
  if (syncSocket.readyState === WebSocket.OPEN) {
    syncSocket.send(update);
  }
});

languageSelect.addEventListener("change", () => {
  monaco.editor.setModelLanguage(editor.getModel(), languageSelect.value);
});

// ─── Run WebSocket ────────────────────────────────────────────────────────────
let runSocket = null;

function connectRunSocket() {
  runSocket = new WebSocket(`${RELAY_WS}/${ROOM_ID}?type=run`);

  runSocket.onopen  = () => console.log("[Client] Run socket connected");
  runSocket.onclose = () => setTimeout(connectRunSocket, 2000);
  runSocket.onerror = (e) => console.error("[Client] Run socket error", e);

  runSocket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.status === "queued") {
      appendOutput(`Job queued (id: ${msg.jobId}). Waiting for worker...`, "info");
      return;
    }
    if (msg.type === "output") {
      if (msg.output) appendOutput(msg.output, "output");
      if (msg.done) {
        appendOutput("— Execution complete —", "info");
        runBtn.disabled    = false;
        runBtn.textContent = "▶ Run";
      }
    }
    if (msg.error) {
      appendOutput(`Error: ${msg.error}`, "error");
      runBtn.disabled    = false;
      runBtn.textContent = "▶ Run";
    }
  };
}

connectRunSocket();

runBtn.addEventListener("click", () => {
  const code     = ytext.toString();
  const language = languageSelect.value;

  if (!code.trim()) {
    appendOutput("Nothing to run — editor is empty.", "error");
    return;
  }
  if (!runSocket || runSocket.readyState !== WebSocket.OPEN) {
    appendOutput("Not connected to relay. Retrying...", "error");
    return;
  }

  outputPanel.innerHTML = "";
  appendOutput(`Running ${language} code...`, "info");
  runBtn.disabled    = true;
  runBtn.textContent = "Running...";

  runSocket.send(JSON.stringify({ code, language, roomId: ROOM_ID }));
});

function appendOutput(text, type = "output") {
  const line     = document.createElement("div");
  line.className = `${type}-line`;
  line.textContent = text;
  outputPanel.appendChild(line);
  outputPanel.scrollTop = outputPanel.scrollHeight;
}
