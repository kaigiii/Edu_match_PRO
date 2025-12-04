// TODO: Go to index.css and import Google Fonts: 'Noto Sans TC' for Chinese and 'Poppins' for English/numbers. Poppins is modern and friendly.

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 品牌主色 - 沉穩、專業的深藍色
        'brand-blue': {
          'DEFAULT': '#2A4D8C', // 主按鈕、標題
          'dark': '#1E3A6E',   // Hover 狀態
          'light': '#EAF0FF',  // 淺色背景、標籤
        },
        
        // 輔助色 - 溫暖、充滿希望的橘色
        'brand-orange': {
          'DEFAULT': '#FF8C42', // CTA按鈕、高亮
          'dark': '#E87A3A',
          'light': '#FFF3E0',
        },

        // 輔助色 - 代表永續與成長的綠色 (更鮮豔)
        'brand-green': {
          'DEFAULT': '#22C55E', // 更鮮豔的綠色
          'light': '#DCFCE7',   // 更鮮豔的淺綠色
        },

        // 中性色/背景 - 建立溫暖、乾淨的基調
        'neutral': {
          'white': '#FFFFFF',
          'background': '#F9F9F9', // 米白色背景
          '100': '#E9ECEF',      // 淺灰色邊框
          '300': '#ADB5BD',      // 次要提示文字
          '500': '#6C757D',      // 段落文字
          '900': '#212529',      // 主要標題文字
        },

        // 系統色
        'system-red': '#DC3545', // 錯誤/緊急
      },
      borderRadius: {
        'lg': '1rem',
      },
      boxShadow: {
        'soft-lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'brand-blue': '0 4px 14px 0 rgba(42, 77, 140, 0.25)',
        'brand-orange': '0 4px 14px 0 rgba(255, 140, 66, 0.25)',
        'brand-green': '0 4px 14px 0 rgba(34, 197, 94, 0.25)',
        'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'sans': ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'texture-wood-dark': 'url("/images/textures/texture-wood-dark.png")',
        'texture-wood-dark-overlay': 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("/images/textures/texture-wood-dark.png")',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }
    },
  },
  plugins: [],
}

