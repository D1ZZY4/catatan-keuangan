import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as { version: string };

export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
    "import.meta.env.VITE_BUILD_DATE": JSON.stringify(
      new Date().toISOString().split("T")[0],
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
    watch: {
      ignored: ["**/android/**", "**/build-release/**", "**/.git/**"],
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
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
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
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
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes("node_modules/lucide-react")) return "vendor-lucide";
          if (id.includes("node_modules/iconsax-react")) return "vendor-iconsax";
          if (id.includes("node_modules/react-dom")) return "vendor-react-dom";
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-router")) return "vendor-react";
          if (id.includes("node_modules/dexie")) return "vendor-dexie";
          if (id.includes("node_modules/mathjs") || id.includes("node_modules/fraction.js") || id.includes("node_modules/complex.js") || id.includes("node_modules/decimal.js")) return "vendor-math";
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) return "vendor-recharts";
          if (id.includes("node_modules/tesseract")) return "vendor-tesseract";
          if (id.includes("node_modules")) return "vendor-misc";
          return undefined;
        },
      },
    },
  },
}));
