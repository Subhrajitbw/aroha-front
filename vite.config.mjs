import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "build",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          gsap: ["gsap"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: true,
  },

  plugins: [react()],

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },

  server: {
    host: true, // listen on all IPs (needed for ngrok)
    port: 5173,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "55451c0ffcde.ngrok-free.app", // ✅ add your ngrok hostname here
    ],
  },
  preview: {
    host: true,
    port: 5173,
  },
});
