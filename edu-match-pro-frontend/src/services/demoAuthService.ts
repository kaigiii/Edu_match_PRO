/**
 * 模擬認證服務
 * 統一處理模擬登入和真實登入
 */

import { createApiUrl } from '../config/api';

interface DemoLoginResponse {
  access_token: string;
  token_type: string;
}

interface DemoUserInfo {
  id: string;
  email: string;
  role: 'school' | 'company';
  is_demo: boolean;
  display_name: string;
  exp?: number;
}

class DemoAuthService {
  private demoCredentials = {
    school: {
      username: 'demo.school@edu.tw',
      password: 'demo_school_2024'
    },
    rural_school: {
      username: 'demo.rural.school@edu.tw', 
      password: 'demo_rural_2024'
    },
    company: {
      username: 'demo.company@tech.com',
      password: 'demo_company_2024'
    }
  };

  /**
   * 模擬登入 - 使用預設的演示帳號
   */
  async demoLogin(role: 'school' | 'company' | 'rural_school'): Promise<{
    token: string;
    user: DemoUserInfo;
  }> {
    const credentials = this.demoCredentials[role];
    if (!credentials) {
      throw new Error(`Invalid demo role: ${role}`);
    }

    try {
      // 使用後端模擬登入API
      const response = await fetch(createApiUrl('/demo/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}`,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Demo login failed: ${response.status}`);
      }

      const data: DemoLoginResponse = await response.json();
      
      // 解析token獲取用戶信息
      const userInfo = this.parseTokenPayload(data.access_token);
      
      return {
        token: data.access_token,
        user: userInfo
      };
    } catch (error) {
      console.error('Demo login error:', error);
      throw new Error(`模擬登入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 真實登入 - 使用用戶提供的憑證
   */
  async realLogin(email: string, password: string): Promise<{
    token: string;
    user: DemoUserInfo;
  }> {
    try {
      const response = await fetch(createApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed: ${response.status}`);
      }

      const data: DemoLoginResponse = await response.json();
      
      // 解析token獲取用戶信息
      const userInfo = this.parseTokenPayload(data.access_token);
      
      return {
        token: data.access_token,
        user: userInfo
      };
    } catch (error) {
      console.error('Real login error:', error);
      throw new Error(`登入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 解析JWT token獲取用戶信息
   */
  private parseTokenPayload(token: string): DemoUserInfo {
    try {
      // 簡單的JWT解析（僅用於獲取payload，不驗證簽名）
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      return {
        id: payload.sub,
        email: payload.email || '', // 如果token中沒有email，需要額外API調用
        role: payload.role,
        is_demo: payload.is_demo || false,
        display_name: payload.display_name || ''
      };
    } catch (error) {
      console.error('Token parsing error:', error);
      throw new Error('無效的認證令牌');
    }
  }

  /**
   * 檢查token是否過期
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseTokenPayload(token);
      const exp = payload.exp;
      if (!exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * 獲取可用的演示角色
   */
  getAvailableDemoRoles(): Array<{
    key: 'school' | 'company' | 'rural_school';
    label: string;
    description: string;
  }> {
    return [
      {
        key: 'school',
        label: '城市學校',
        description: '台北市立建國中學（演示）'
      },
      {
        key: 'rural_school', 
        label: '偏鄉學校',
        description: '台東縣太麻里國小（演示）'
      },
      {
        key: 'company',
        label: '企業',
        description: '科技創新股份有限公司（演示）'
      }
    ];
  }
}

// 導出單例
export const demoAuthService = new DemoAuthService();
export default demoAuthService;
