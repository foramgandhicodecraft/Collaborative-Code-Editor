import { useRef, useCallback } from "react";
import * as Y from "yjs";

// One Y.Doc per room and language, keyed by room id then language name.
const globalDocs = {};

export function useYjs(roomId = "default") {
  const docsRef = useRef(globalDocs);

  const getRoomDocs = useCallback(() => {
    if (!docsRef.current[roomId]) {
      docsRef.current[roomId] = {};
    }
    return docsRef.current[roomId];
  }, [roomId]);

  const getDoc = useCallback((lang) => {
    const roomDocs = getRoomDocs();
    if (!roomDocs[lang]) {
      roomDocs[lang] = new Y.Doc();
    }
    return roomDocs[lang];
  }, [getRoomDocs]);

  const getText = useCallback((lang) => {
    return getDoc(lang).getText("code");
  }, [getDoc]);

  const applyUpdate = useCallback((lang, update) => {
    const doc = getDoc(lang);
    Y.applyUpdate(doc, new Uint8Array(update));
  }, [getDoc]);

  const encodeUpdate = useCallback((lang, beforeVector) => {
    const doc = getDoc(lang);
    return Array.from(Y.encodeStateAsUpdate(doc, beforeVector));
  }, [getDoc]);

  const encodeStateVector = useCallback((lang) => {
    return Y.encodeStateVector(getDoc(lang));
  }, [getDoc]);

  const encodeFullState = useCallback((lang) => {
    return Array.from(Y.encodeStateAsUpdate(getDoc(lang)));
  }, [getDoc]);

  const setContent = useCallback((lang, content) => {
    const doc  = getDoc(lang);
    const text = doc.getText("code");
    const prev = text.toString();
    if (prev === content) return;

    // Apply a minimal contiguous diff so concurrent edits can merge cleanly.
    let start = 0;
    while (
      start < prev.length &&
      start < content.length &&
      prev[start] === content[start]
    ) {
      start++;
    }

    let prevEnd = prev.length - 1;
    let nextEnd = content.length - 1;
    while (
      prevEnd >= start &&
      nextEnd >= start &&
      prev[prevEnd] === content[nextEnd]
    ) {
      prevEnd--;
      nextEnd--;
    }

    const deleteCount = prevEnd >= start ? (prevEnd - start + 1) : 0;
    const insertText = nextEnd >= start ? content.slice(start, nextEnd + 1) : "";

    doc.transact(() => {
      if (deleteCount > 0) text.delete(start, deleteCount);
      if (insertText) text.insert(start, insertText);
    });
  }, [getDoc]);

  const getContent = useCallback((lang) => {
    return getDoc(lang).getText("code").toString();
  }, [getDoc]);

  const clearRoomDocs = useCallback(() => {
    delete docsRef.current[roomId];
  }, [roomId]);

  return { getDoc, getText, applyUpdate, encodeUpdate, encodeStateVector, encodeFullState, setContent, getContent, clearRoomDocs };
}