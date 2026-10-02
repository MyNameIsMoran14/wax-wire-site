import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5183,
    // Fail loudly instead of silently drifting to 5184/5185/etc. — a drifted
    // port still works (backend's CORS matches any localhost/127.0.0.1 port),
    // but it's confusing to have the dev server land somewhere unexpected
    // when another local project (e.g. a Telegram Mini App) is also running.
    strictPort: true,
  },
})
