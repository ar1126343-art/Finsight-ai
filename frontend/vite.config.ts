import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://finsight-ai-nxsm.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://finsight-ai-nxsm.onrender.com',
        ws: true,
      }
    }
  }
})