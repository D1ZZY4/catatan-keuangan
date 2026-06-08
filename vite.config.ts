import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      injectRegister: null,
      includeAssets: ["icons/**"],
      manifest: {
        name: "Catatan Keuangan",
        short_name: "CatatKeu",
        description: "Buku kas digital untuk keluarga",
        theme_color: "#8CC0EB",
        background_color: "#FFF9D2",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.frankfurter\.app\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "exchange-rates",
              expiration: { maxAgeSeconds: 14400 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "crypto-prices",
              expiration: { maxAgeSeconds: 900 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-webfonts" },
          },
        ],
      },
    }),
  ],
  build: {
    target: "es2022",
    sourcemap: mode === "development",
  },
}));
