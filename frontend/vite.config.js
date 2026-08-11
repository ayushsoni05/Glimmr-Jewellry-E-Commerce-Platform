import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Use 127.0.0.1 instead of localhost to force IPv4
  const target = env.VITE_BACKEND_URL || 'http://127.0.0.1:5002'
  return {
    plugins: [react()],
      build: {
        outDir: 'dist',
      },
    server: {
      host: '127.0.0.1', // Force IPv4
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target,
          changeOrigin: false,
          secure: false,
        },
      },
    },
  }
})
