import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Pro F-Gps Cam",
        short_name: "F-Gps",
        description: "Pro F=Gps Cam For Gps Location",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/vite2.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/vite2.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
})
