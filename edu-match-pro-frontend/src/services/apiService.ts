/**
 * API 服務類
 * 支持前後端連結，自動降級到本地數據
 */

import { currentConfig, createApiUrl, checkApiHealth } from '../config/api';
import { PROTECTED_ENDPOINTS, API_ENDPOINT_MAP, ERROR_CONFIG, AUTH_CONFIG } from '../config/apiConfig';
import { demoAuthService } from './demoAuthService';
import type { 
  SchoolNeed, 
  CompanyDashboardStats, 
  SchoolDashboardStats, 
  PlatformStats,
  RecentProject, 
  ImpactStory, 
  CompanyDonation, 
  RecentActivity 
} from '../types';

class ApiService {
  private apiAvailable: boolean | null = null;
  private fallbackData: any = {};
  private schoolToken?: string;
  private companyToken?: string;

  constructor() {
    this.initializeFallbackData();
  }

  // 初始化備用數據
  private async initializeFallbackData() {
    try {
      const staticData = await import('../data/staticData');
      this.fallbackData = {
        companyDashboardStats: staticData.companyDashboardStats,
        schoolDashboardStats: staticData.schoolDashboardStats,
        // 其他數據統一使用後端 API，不再使用靜態備用數據
        schoolNeeds: [],
        recentProjects: [],
        impactStories: [],
        myNeeds: [],
        companyDonations: [],
        recentActivity: [],
      };
    } catch (error) {
      console.error('Failed to load fallback data:', error);
    }
  }

  // 檢查 API 可用性
  private async isApiAvailable(): Promise<boolean> {
    if (this.apiAvailable !== null) {
      return this.apiAvailable;
    }

    if (!currentConfig.useLocalFallback) {
      // 最佳實踐：關閉本地降級時，不做健康檢查，直接使用後端 API
      this.apiAvailable = true;
      return true;
    }

    try {
      this.apiAvailable = await checkApiHealth();
      return this.apiAvailable;
    } catch (error) {
      console.warn('API not available, using local data:', error);
      this.apiAvailable = false;
      return false;
    }
  }

  // 通用請求方法
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const isApiReady = await this.isApiAvailable();
    
    if (isApiReady) {
      try {
        // 使用配置化的端點保護邏輯
        const schoolProtected = new Set(PROTECTED_ENDPOINTS.school);
        const companyProtected = new Set(PROTECTED_ENDPOINTS.company);

        let authHeaders: Record<string, string> = {};
        
        // 檢查是否有存儲的認證 token
        const storedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
        if (storedToken && (schoolProtected.has(endpoint) || companyProtected.has(endpoint))) {
          authHeaders = { Authorization: `Bearer ${storedToken}` };
        } else if (schoolProtected.has(endpoint)) {
          const token = await this.ensureToken('school');
          authHeaders = { Authorization: `Bearer ${token}` };
        } else if (companyProtected.has(endpoint)) {
          const token = await this.ensureToken('company');
          authHeaders = { Authorization: `Bearer ${token}` };
        }

        const response = await fetch(createApiUrl(endpoint), {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.warn(`API request failed for ${endpoint}, using fallback:`, error);
        // 如果 API 失敗且允許降級，使用本地數據
        if (currentConfig.useLocalFallback) {
          return this.getFallbackData<T>(endpoint);
        }
        throw error;
      }
    } else {
      // 直接使用本地數據
      return this.getFallbackData<T>(endpoint);
    }
  }

  // 取得並快取模擬用戶 token
  private async ensureToken(role: 'school' | 'company'): Promise<string> {
    if (role === 'school' && this.schoolToken) return this.schoolToken;
    if (role === 'company' && this.companyToken) return this.companyToken;

    try {
      // 使用新的模擬登入服務
      const response = await demoAuthService.demoLogin(role);
      const token = response.token;
      
      if (role === 'school') this.schoolToken = token;
      else this.companyToken = token;
      return token;
    } catch (error) {
      console.error(`Failed to get demo token for ${role}:`, error);
      throw new Error(`Demo authentication failed for ${role}`);
    }
  }

  // 獲取備用數據
  private getFallbackData<T>(endpoint: string): T {
    console.log('ApiService: getFallbackData called for endpoint:', endpoint);
    console.log('ApiService: fallbackData keys:', Object.keys(this.fallbackData));
    
    // 處理單個資源請求（如 /school_needs/need-001）
    if (endpoint.startsWith('/school_needs/')) {
      const needId = endpoint.split('/').pop();
      console.log('ApiService: looking for single need with id:', needId);
      
      if (this.fallbackData.schoolNeeds && Array.isArray(this.fallbackData.schoolNeeds)) {
        const need = this.fallbackData.schoolNeeds.find((n: any) => n.id === needId);
        if (need) {
          console.log('ApiService: found single need:', need);
          return need as T;
        }
      }
      throw new Error(`No fallback data available for single need: ${endpoint}`);
    }
    
    const fallbackMap: Record<string, string> = {
      '/school_needs': 'schoolNeeds',
      '/company_dashboard_stats': 'companyDashboardStats',
      '/school_dashboard_stats': 'schoolDashboardStats',
      '/ai_recommended_needs': 'schoolNeeds', // 使用相同的數據
      '/recent_projects': 'recentProjects',
      '/impact_stories': 'impactStories',
      '/my_needs': 'myNeeds',
      '/company_donations': 'companyDonations',
      '/recent_activity': 'recentActivity',
    };

    const dataKey = fallbackMap[endpoint];
    console.log('ApiService: dataKey for endpoint:', dataKey);
    
    if (dataKey && this.fallbackData[dataKey]) {
      console.log('ApiService: returning fallback data for', dataKey, 'length:', this.fallbackData[dataKey]?.length);
      return this.fallbackData[dataKey];
    }

    console.error('ApiService: No fallback data available for', endpoint);
    throw new Error(`No fallback data available for ${endpoint}`);
  }

  // 學校需求相關 API
  async getSchoolNeeds(): Promise<SchoolNeed[]> {
    return this.request<SchoolNeed[]>('/school_needs');
  }

  // 企業需求相關 API（包括模擬用戶需求）
  async getCompanyNeeds(): Promise<SchoolNeed[]> {
    return this.request<SchoolNeed[]>('/company_needs');
  }

  async getSchoolNeedById(id: string): Promise<SchoolNeed> {
    console.log('ApiService: getSchoolNeedById called with id:', id);
    const result = await this.request<SchoolNeed>(`/school_needs/${id}`);
    console.log('ApiService: getSchoolNeedById result:', result);
    return result;
  }

  async createSchoolNeed(need: Omit<SchoolNeed, 'id'>): Promise<SchoolNeed> {
    return this.request<SchoolNeed>('/school_needs', {
      method: 'POST',
      body: JSON.stringify(need),
    });
  }

  async updateSchoolNeed(id: string, need: Partial<SchoolNeed>): Promise<SchoolNeed> {
    return this.request<SchoolNeed>(`/school_needs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(need),
    });
  }

  async deleteSchoolNeed(id: string): Promise<void> {
    return this.request<void>(`/school_needs/${id}`, {
      method: 'DELETE',
    });
  }

  // 儀表板統計 API
  async getCompanyDashboardStats(): Promise<CompanyDashboardStats> {
    return this.request<CompanyDashboardStats>('/company_dashboard_stats');
  }

  async getSchoolDashboardStats(): Promise<SchoolDashboardStats> {
    return this.request<SchoolDashboardStats>('/school_dashboard_stats');
  }

  async getPlatformStats(): Promise<PlatformStats> {
    return this.request<PlatformStats>('/platform_stats');
  }

  // 推薦和項目 API
  async getRecommendedNeeds(): Promise<SchoolNeed[]> {
    return this.request<SchoolNeed[]>('/ai_recommended_needs');
  }

  async getCompanyRecommendedNeeds(): Promise<SchoolNeed[]> {
    return this.request<SchoolNeed[]>('/company_ai_recommended_needs');
  }

  // 贊助專案 API
  async sponsorNeed(needId: string, sponsorData: { donation_type: string; description: string }): Promise<any> {
    return this.request<any>(`/sponsor_need/${needId}`, {
      method: 'POST',
      body: JSON.stringify(sponsorData),
    });
  }

  async getRecentProjects(): Promise<RecentProject[]> {
    return this.request<RecentProject[]>('/recent_projects');
  }

  // 影響力故事 API
  async getImpactStories(): Promise<ImpactStory[]> {
    console.log('ApiService: getImpactStories called');
    const result = await this.request<ImpactStory[]>('/impact_stories');
    console.log('ApiService: getImpactStories result:', result);
    return result;
  }

  // 用戶相關 API
  async getMyNeeds(): Promise<SchoolNeed[]> {
    return this.request<SchoolNeed[]>('/my_needs');
  }

  async getCompanyDonations(): Promise<CompanyDonation[]> {
    return this.request<CompanyDonation[]>('/company_donations');
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    return this.request<RecentActivity[]>('/recent_activity');
  }

  // 認證相關 API
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any): Promise<{ token: string; user: any }> {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<any> {
    return this.request<any>('/auth/profile');
  }
}

// 導出單例實例
export const apiService = new ApiService();
export default apiService;
