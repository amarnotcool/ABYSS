import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.hdr", "**/*.glb"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1200,
    cssCodeSplit: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "three-core": ["three"],
          "three-fiber": ["@react-three/fiber", "@react-three/drei", "@react-three/postprocessing"],
          "motion-gsap": ["framer-motion", "gsap"],
          "react-vendor": ["react", "react-dom", "react-router-dom", "react-helmet-async"],
        },
      },
    },
  },
});
