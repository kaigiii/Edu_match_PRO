/**
 * API 配置
 * 支持前後端連結，同時保留本地載入作為備用方案
 */

// 檢查是否為開發環境
const isDevelopment = import.meta.env.DEV;

// 檢查是否在 GitHub Pages 上運行
const isGitHubPages = window.location.hostname === 'kaigiii.github.io';

// 獲取 API 基礎 URL（優先使用環境變數）
const getBaseURL = (): string => {
  // 1. 優先使用環境變數
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 2. GitHub Pages 生產環境使用 ngrok 後端
  if (isGitHubPages) {
    return 'https://charlesetta-indignant-horacio.ngrok-free.dev';
  }
  
  // 3. 本地開發環境使用 localhost 後端
  if (isDevelopment) {
    return 'http://localhost:3001';
  }
  
  // 4. 其他情況默認使用 localhost（安全起見）
  return 'http://localhost:3001';
};

// API 基礎 URL 配置
export const API_CONFIG = {
  // 開發環境：使用後端 API
  development: {
    baseURL: getBaseURL(),
    timeout: 10000,
    useLocalFallback: false, // 最佳實踐：開發環境也直接走後端 API
  },
  // 生產環境：使用環境變數配置
  production: {
    baseURL: getBaseURL(),
    timeout: 10000,
    useLocalFallback: false,
  }
};

// 當前配置
export const currentConfig = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// 打印當前 API 配置（便於調試）
console.log('🔧 API Configuration:', {
  mode: isDevelopment ? 'development' : 'production',
  baseURL: currentConfig.baseURL,
  env: import.meta.env.VITE_API_BASE_URL || 'not set'
});

// API 端點配置
export const API_ENDPOINTS = {
  // 學校需求相關
  SCHOOL_NEEDS: '/school_needs',
  COMPANY_NEEDS: '/company_needs',
  SCHOOL_NEEDS_BY_ID: (id: string) => {
    if (!id || id === 'undefined') {
      return '';
    }
    return `/school_needs/${id}`;
  },
  
  // 儀表板統計
  COMPANY_DASHBOARD_STATS: '/company_dashboard_stats',
  SCHOOL_DASHBOARD_STATS: '/school_dashboard_stats',
  PLATFORM_STATS: '/platform_stats',
  
  // 推薦和項目
  AI_RECOMMENDED_NEEDS: '/ai_recommended_needs',
  COMPANY_AI_RECOMMENDED_NEEDS: '/company_ai_recommended_needs',
  RECENT_PROJECTS: '/recent_projects',
  
  // 影響力故事
  IMPACT_STORIES: '/impact_stories',
  
  // 用戶相關
  MY_NEEDS: '/my_needs',
  COMPANY_DONATIONS: '/company_donations',
  RECENT_ACTIVITY: '/recent_activity',
  
  // 認證相關
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
};

// 創建完整的 API URL
export const createApiUrl = (endpoint: string): string => {
  return `${currentConfig.baseURL}${endpoint}`;
};

// 檢查 API 是否可用
export const checkApiHealth = async (): Promise<boolean> => {
  if (!isDevelopment) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(createApiUrl('/health'), {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
};
