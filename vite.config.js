import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
  optimizeDeps: {
    include: ["pixi.js"],
  },
});
