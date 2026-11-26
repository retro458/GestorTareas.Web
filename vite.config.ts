import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Demo publica (build con VITE_DEMO=true): agrega <meta name="robots" content="noindex">
// para que los buscadores no la indexen. El build de produccion no cambia.
function noIndexEnDemo(): Plugin {
  return {
    name: 'taskflow-noindex-demo',
    transformIndexHtml(html) {
      if (process.env.VITE_DEMO !== 'true') return html
      return html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n  </head>')
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    noIndexEnDemo(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'TaskFlow',
        short_name: 'TaskFlow',
        description: 'Sistema de gestión de tareas',
        theme_color: '#3B82F6',
        background_color: '#14171A',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Sin caché offline por ahora: no precachear assets ni interceptar
        // navegaciones, solo instalar el SW para poder auto-actualizar la app
        // cuando se despliegue una nueva versión.
        globPatterns: [],
        navigateFallback: undefined,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173
  }
})