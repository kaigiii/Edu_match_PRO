/**
 * API 配置常數
 * 統一管理 API 端點和認證配置
 */

// 需要認證的端點配置
export const PROTECTED_ENDPOINTS = {
  // 學校用戶專用端點
  school: [
    '/my_needs',
    '/school_dashboard_stats',
    '/school_needs'
  ],
  // 企業用戶專用端點
  company: [
    '/company_dashboard_stats',
    '/company_donations',
    '/recent_activity',
    '/company_needs',
    '/company_ai_recommended_needs',
    '/sponsor_need'
  ]
} as const;

// API 端點映射
export const API_ENDPOINT_MAP = {
  '/school_needs': 'getSchoolNeeds',
  '/company_needs': 'getCompanyNeeds',
  '/company_dashboard_stats': 'getCompanyDashboardStats',
  '/school_dashboard_stats': 'getSchoolDashboardStats',
  '/ai_recommended_needs': 'getRecommendedNeeds',
  '/company_ai_recommended_needs': 'getCompanyRecommendedNeeds',
  '/recent_projects': 'getRecentProjects',
  '/impact_stories': 'getImpactStories',
  '/my_needs': 'getMyNeeds',
  '/company_donations': 'getCompanyDonations',
  '/recent_activity': 'getRecentActivity'
} as const;

// 錯誤處理配置
export const ERROR_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 10000
} as const;

// 認證配置
export const AUTH_CONFIG = {
  TOKEN_STORAGE_KEY: 'authToken',
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5分鐘
  DEMO_ROLES: ['school', 'company', 'rural_school'] as const
} as const;
