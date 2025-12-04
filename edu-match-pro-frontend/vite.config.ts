import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',

  // 開發伺服器配置
  server: {
    // 允許局域網訪問
    host: '0.0.0.0',
    // 開發伺服器端口
    port: 5173,
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          motion: ['framer-motion'],
          charts: ['recharts'],
          ui: ['@headlessui/react', '@heroicons/react'],
          utils: ['d3', 'topojson-client'],
          forms: ['react-hook-form'],
          notifications: ['react-toastify']
        }
      }
    }
  }
})
