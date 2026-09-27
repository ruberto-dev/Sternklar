/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base bleibt konfigurierbar: GitHub Pages braucht '/<repo>/', Vercel '/'
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Sternklar',
        short_name: 'Sternklar',
        description: 'Persönliche Lern-App für Astronomie',
        lang: 'de',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b0e1a',
        theme_color: '#0b0e1a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // JSON mit precachen, damit die Fragen offline verfuegbar sind
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
