import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
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
      workbox: { navigateFallback: "index.html" }
    })
  ]
});
