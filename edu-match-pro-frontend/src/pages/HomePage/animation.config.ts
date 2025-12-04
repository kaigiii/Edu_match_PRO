// src/pages/HomePage/animation.config.ts


export const HomePageAnimations = {
  // 區塊 3: 解決方案區塊的動畫節奏
  solutionSection: {
    // 總滾動高度，數字越大，滾動時間越長，節奏越慢
    totalDuration: '250vh', 
    
    // 每個階段的起點和終點 (在 0 到 1 的進度中)
    stages: {
      stage1: { start: 0.0, end: 0.167 },    // 問題描述
      stage2: { start: 0.167, end: 0.333 },  // 解法1: 智慧配對系統
      stage3: { start: 0.333, end: 0.5 },    // 解法2: 即時通知系統
      stage4: { start: 0.5, end: 0.667 },    // 解法3: 社群互動平台
      stage5: { start: 0.667, end: 0.833 },  // 解法4: 數據分析與追蹤
      stage6: { start: 0.833, end: 1.0 },    // 空白頁面
    },

    // 淡入淡出的過渡持續時間 (佔總進度的百分比)
    fadeDuration: 0.02,
  },
  
  // 地圖區塊的動畫參數
  mapSection: {
    // 地圖光點動畫的持續時間
    highlightDuration: 0.3,
    // 光點變色的持續時間
    colorChangeDuration: 0.5,
    // 光點之間的間隔時間
    highlightInterval: 0.2,
  },
  
  // 需求輪播區塊的動畫參數
  needsCarousel: {
    // 水平滾動的緩動類型
    ease: 'power2.out',
    // 卡片淡入的延遲時間
    cardDelay: 0.2,
    // 標題淡入的持續時間
    titleDuration: 0.8,
  },
  
  // 其他區塊的動畫參數也可以加在這裡
  // ...
};
