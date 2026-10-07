import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/bibliographies': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/citations': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/search': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/export': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
