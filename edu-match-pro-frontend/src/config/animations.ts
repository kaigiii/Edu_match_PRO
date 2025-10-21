/**
 * 動畫配置常數
 * 統一管理組件動畫效果
 */

// 通用動畫配置
export const ANIMATIONS = {
  // 卡片動畫
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  
  // 按鈕動畫
  button: {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  
  // 列表項動畫
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2 }
  },
  
  // 頁面轉場動畫
  page: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.4, ease: "easeInOut" }
  },
  
  // 載入動畫
  loading: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  // 錯誤動畫
  error: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 }
  }
} as const;

// 動畫延遲配置
export const ANIMATION_DELAYS = {
  stagger: 0.1,
  card: 0.2,
  content: 0.3,
  footer: 0.4
} as const;

// 動畫緩動函數
export const EASING = {
  easeInOut: "easeInOut",
  easeOut: "easeOut",
  easeIn: "easeIn",
  spring: "spring"
} as const;
