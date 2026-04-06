import * as Y from "yjs";
import { getRoom, getLangDoc } from "../state/rooms.js";

export function registerYjsHandlers(io, socket, ctx) {
  socket.on("yjs:update", ({ lang, update }) => {
    if (!ctx.currentRoom) return;
    const doc = getLangDoc(getRoom(ctx.currentRoom), lang);
    Y.applyUpdate(doc, new Uint8Array(update));
    socket.to(ctx.currentRoom).emit("yjs:update", { lang, update });
  });

  socket.on("yjs:request-state", ({ lang }) => {
    if (!ctx.currentRoom) return;
    const doc   = getLangDoc(getRoom(ctx.currentRoom), lang);
    const state = Y.encodeStateAsUpdate(doc);
    socket.emit("yjs:state", { lang, state: Array.from(state) });
  });
}
