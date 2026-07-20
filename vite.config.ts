import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Jarvis AI Work Assistant',
        short_name: 'Jarvis',
        description: 'AI Project Intelligence System',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
      }
    })
  ],
})
