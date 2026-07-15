import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev convenience: proxy /api to the Fastify server so the browser sees
      // one origin. In production nginx does this (see infra/nginx).
      "/api": { target: process.env.VITE_API_URL ?? "http://localhost:4000", changeOrigin: true },
    },
  },
  build: { outDir: "dist", sourcemap: true },
});
