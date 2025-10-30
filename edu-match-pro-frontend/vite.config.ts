import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/Edu_macth_PRO/' : '/',
  
  // 👇 新增這個 'server' 配置區塊
  server: {
    // 允許外部 IP 連線，這對 ngrok 來說是必要的
    host: '0.0.0.0', 
    // 您的專案運行 Port 是 5173，建議也明確設定
    port: 5173, 
    allowedHosts: [
      'localhost', 
      '127.0.0.1', 
      // 必須加入 ngrok 當前的網址
      'charlesetta-indignant-horacio.ngrok-free.dev',
      'pedigreed-uncompulsively-reece.ngrok-free.dev' //後端（這列可刪除）
    ],
  },
  // 👆 結束新增

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // ... (其他 build 設定不變)
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

