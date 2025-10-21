import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/Edu_macth_PRO/' : '/',
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
}))
