import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "本草內經・體質調養",
        short_name: "體質調養",
        description: "根據傳統中醫經典整理的體質與養生參考工具",
        theme_color: "#173f35",
        background_color: "#f7f2e8",
        display: "standalone",
        start_url: "./",
        icons: [
          { "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
          { "src": "pwa-512x512.png", "sizes": "512x512", "type": "image/png" },
          { "src": "pwa-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
        ]
      },
      workbox: {
        cacheId: "app-shell-v2",
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: { cacheName: "app-shell-v2", networkTimeoutSeconds: 4 }
          },
          {
            urlPattern: /\/knowledge\/(catalog|indexes)\/.+\.json$|\/knowledge\/catalog\.json$/,
            handler: "NetworkFirst",
            options: { cacheName: "knowledge-indexes-v2", networkTimeoutSeconds: 5 }
          },
          {
            urlPattern: /\/knowledge\/books\/.+\.json$/,
            handler: "CacheFirst",
            options: { cacheName: "knowledge-chunks-v2", expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          }
        ]
      }
    })
  ]
});
