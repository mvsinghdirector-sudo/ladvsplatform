import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/auth-api': {
        target: 'http://20.84.30.112',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, ''),
      },
      '/app-api': {
        target: 'http://20.242.154.139',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app-api/, ''),
      },
    },
  },
})
