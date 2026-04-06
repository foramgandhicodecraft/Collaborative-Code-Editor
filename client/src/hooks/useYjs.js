import { useRef, useCallback } from "react";
import * as Y from "yjs";

// One Y.Doc per language, keyed by language name
const globalDocs = {};

export function useYjs() {
  const docsRef = useRef(globalDocs);

  const getDoc = useCallback((lang) => {
    if (!docsRef.current[lang]) {
      docsRef.current[lang] = new Y.Doc();
    }
    return docsRef.current[lang];
  }, []);

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
    doc.transact(() => {
      text.delete(0, text.length);
      text.insert(0, content);
    });
  }, [getDoc]);

  const getContent = useCallback((lang) => {
    return getDoc(lang).getText("code").toString();
  }, [getDoc]);

  return { getDoc, getText, applyUpdate, encodeUpdate, encodeStateVector, encodeFullState, setContent, getContent };
}
