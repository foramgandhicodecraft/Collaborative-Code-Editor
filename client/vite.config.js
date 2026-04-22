// // import { defineConfig } from "vite";
// // import react from "@vitejs/plugin-react";

// // export default defineConfig({
// //   plugins: [react()],
// //   server: { port: 5173 },
// //   optimizeDeps: {
// //     include: ["monaco-editor"],
// //   },
// // });

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     host: true, // 🔥 allow other machines too
//     proxy: {
//       "/api": {
//         target: "http://192.168.1.103:3001",
//         changeOrigin: true,
//       },
//     },
//   },
//   optimizeDeps: {
//     include: ["monaco-editor"],
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // allow other machines too
    proxy: {
      "/api": {
        target: "http://192.168.1.103:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // 🔥 FIX: removes /api before sending to backend
      },
    },
  },
  optimizeDeps: {
    include: ["monaco-editor"],
  },
});