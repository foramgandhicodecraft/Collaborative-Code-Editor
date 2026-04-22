// import * as Y from "yjs";
// import { getRoom, getLangDoc } from "../state/rooms.js";

// export function registerYjsHandlers(io, socket, ctx) {
//   socket.on("yjs:update", ({ lang, update }) => {
//     if (!ctx.currentRoom) return;
//     const doc = getLangDoc(getRoom(ctx.currentRoom), lang);
//     Y.applyUpdate(doc, new Uint8Array(update));
//     socket.to(ctx.currentRoom).emit("yjs:update", { lang, update });
//   });

//   socket.on("yjs:request-state", ({ lang }) => {
//     if (!ctx.currentRoom) return;
//     const doc   = getLangDoc(getRoom(ctx.currentRoom), lang);
//     const state = Y.encodeStateAsUpdate(doc);
//     socket.emit("yjs:state", { lang, state: Array.from(state) });
//   });
// }

import * as Y from "yjs";
import { getRoom, getLangDoc } from "../state/rooms.js";

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

function seedLanguageIfEmpty(room, lang) {
  const doc = getLangDoc(room, lang);
  const current = doc.getText("code").toString();
  if (current) return false;

  const snippet = SNIPPETS[lang] || `// Start coding in ${lang}...`;
  doc.getText("code").insert(0, snippet);
  return true;
}

export function registerYjsHandlers(io, socket, ctx) {
  socket.on("yjs:update", ({ lang, update }) => {
    if (!ctx.currentRoom) return;
    const doc = getLangDoc(getRoom(ctx.currentRoom), lang);
    Y.applyUpdate(doc, new Uint8Array(update));
    socket.to(ctx.currentRoom).emit("yjs:update", { lang, update });
  });

  socket.on("yjs:request-state", ({ lang }) => {
    if (!ctx.currentRoom) return;
    const room = getRoom(ctx.currentRoom);
    seedLanguageIfEmpty(room, lang);
    const doc   = getLangDoc(room, lang);
    const state = Y.encodeStateAsUpdate(doc);
    socket.emit("yjs:state", { lang, state: Array.from(state) });
  });
}