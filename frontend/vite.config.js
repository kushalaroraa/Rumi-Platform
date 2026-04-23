import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    outDir: "dist",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:9090",
        changeOrigin: true,
        // keep the /api prefix when proxying so backend routes mounted at /api/* continue to match
      },
      "/user": {
        target: "http://localhost:9090",
        changeOrigin: true,
      },
      "/chat": {
        target: "http://localhost:9090",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:9090",
        changeOrigin: true,
        // Proxy uploaded files to the backend so <img src="/uploads/..."> works in dev
      }
    },
  },
});
