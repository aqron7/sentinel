import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const API = "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/health": { target: API, changeOrigin: true },
      "/awards": { target: API, changeOrigin: true },
      "/solicitations": { target: API, changeOrigin: true },
      "/patents": { target: API, changeOrigin: true },
      "/aggregates": { target: API, changeOrigin: true },
    },
  },
});
