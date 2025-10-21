# Edu-Match-Pro Frontend

> 教育資源配對平台前端應用 - 連接學校需求與企業資源的現代化 Web 應用

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.4-38B2AC.svg)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-10.18.0-0055FF.svg)](https://www.framer.com/motion/)

## 📋 目錄

- [項目概述](#項目概述)
- [技術架構](#技術架構)
- [快速開始](#快速開始)
- [項目結構](#項目結構)
- [核心功能](#核心功能)
- [組件設計](#組件設計)
- [狀態管理](#狀態管理)
- [API 集成](#api-集成)
- [動畫系統](#動畫系統)
- [性能優化](#性能優化)
- [部署指南](#部署指南)
- [開發指南](#開發指南)
- [故障排除](#故障排除)
- [貢獻指南](#貢獻指南)

## 🎯 項目概述

Edu-Match-Pro Frontend 是一個現代化的教育資源配對平台前端應用，旨在連接學校的教育需求與企業的資源支持。平台採用 React + TypeScript + Vite 的現代技術棧，提供流暢的用戶體驗和高效的資源配對功能。

### 核心價值

- **🎓 教育公平**：為偏鄉學校提供平等的教育資源
- **🤝 資源配對**：智能匹配學校需求與企業支持
- **📊 數據透明**：實時追蹤項目進度和影響力
- **🌱 可持續發展**：支持 SDG 目標，促進社會責任

### 目標用戶

- **學校用戶**：發布教育需求，追蹤項目進度
- **企業用戶**：瀏覽需求，提供資源支持
- **平台管理員**：監控平台運營，優化配對算法

## 🏗️ 技術架構

### 核心技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| **React** | 18.3.1 | UI 框架 |
| **TypeScript** | 5.8.3 | 類型安全 |
| **Vite** | 7.1.7 | 構建工具 |
| **Tailwind CSS** | 3.4.4 | 樣式框架 |
| **Framer Motion** | 10.18.0 | 動畫庫 |
| **React Router** | 6.23.1 | 路由管理 |
| **React Hook Form** | 7.51.5 | 表單處理 |

### 輔助技術

| 技術 | 版本 | 用途 |
|------|------|------|
| **Recharts** | 3.3.0 | 數據可視化 |
| **React Simple Maps** | 3.0.0 | 地圖組件 |
| **D3.js** | 7.9.0 | 數據處理 |
| **React Toastify** | 10.0.5 | 通知系統 |
| **Headless UI** | 2.1.0 | 無頭組件 |
| **Heroicons** | 2.2.0 | 圖標庫 |

### 開發工具

| 工具 | 版本 | 用途 |
|------|------|------|
| **ESLint** | 9.36.0 | 代碼檢查 |
| **PostCSS** | 8.4.38 | CSS 處理 |
| **Autoprefixer** | 10.4.19 | CSS 前綴 |

## 🚀 快速開始

### 環境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0
- **Git**: >= 2.30.0

### 安裝步驟

1. **克隆項目**
```bash
git clone https://github.com/your-org/edu-match-pro.git
cd edu-match-pro/edu-match-pro-frontend
```

2. **安裝依賴**
```bash
npm install
# 或
yarn install
```

3. **環境配置**
```bash
# 複製環境變量文件
cp .env.example .env.local

# 編輯環境變量
nano .env.local
```

4. **啟動開發服務器**
```bash
npm run dev
# 或
yarn dev
```

5. **訪問應用**
```
http://localhost:5173
```

### 構建部署

```bash
# 構建生產版本
npm run build

# 預覽構建結果
npm run preview

# 代碼檢查
npm run lint
```

## 📁 項目結構

```
edu-match-pro-frontend/
├── public/                     # 靜態資源
│   ├── images/                 # 圖片資源
│   │   ├── impact-stories/     # 影響力故事圖片
│   │   └── taiwan-map.png      # 台灣地圖
│   ├── videos/                 # 影片資源
│   └── taiwan-map.svg          # SVG 地圖
├── src/                        # 源代碼
│   ├── components/             # 可重用組件
│   │   ├── common/            # 通用組件
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── Header.tsx         # 頁面頭部
│   │   ├── NeedCard.tsx       # 需求卡片
│   │   ├── StatsCard.tsx      # 統計卡片
│   │   ├── StoryCard.tsx      # 故事卡片
│   │   ├── TaiwanMap.tsx      # 台灣地圖
│   │   └── SponsorModal.tsx    # 贊助模態框
│   ├── config/                 # 配置文件
│   │   ├── api.ts             # API 配置
│   │   ├── apiConfig.ts       # API 常數
│   │   └── animations.ts      # 動畫配置
│   ├── contexts/              # React Context
│   │   └── AuthContext.tsx    # 認證上下文
│   ├── data/                  # 靜態數據
│   │   └── staticData.ts      # 演示數據
│   ├── hooks/                 # 自定義 Hooks
│   │   ├── useApiState.tsx    # API 狀態管理
│   │   └── useStats.ts        # 統計數據 Hook
│   ├── layouts/               # 布局組件
│   │   ├── DashboardLayout.tsx # 儀表板布局
│   │   └── MainLayout.tsx     # 主布局
│   ├── pages/                 # 頁面組件
│   │   ├── HomePage/          # 首頁組件
│   │   │   ├── HeroSection.tsx
│   │   │   ├── SolutionSection.tsx
│   │   │   ├── MapSection.tsx
│   │   │   ├── NeedsCarousel.tsx
│   │   │   ├── CtaSection.tsx
│   │   │   ├── ValueSection.tsx
│   │   │   └── animation.config.ts
│   │   ├── AllNeedsPage.tsx   # 所有需求頁面
│   │   ├── CompanyDashboardPage.tsx # 企業儀表板
│   │   ├── SchoolDashboardPage.tsx # 學校儀表板
│   │   ├── LoginPage.tsx      # 登入頁面
│   │   ├── RegisterPage.tsx   # 註冊頁面
│   │   └── ...                # 其他頁面
│   ├── services/              # 服務層
│   │   ├── apiService.ts      # API 服務
│   │   └── demoAuthService.ts # 演示認證
│   ├── types/                 # 類型定義
│   │   ├── index.ts          # 主要類型
│   │   └── common.ts         # 通用類型
│   ├── utils/                # 工具函數
│   │   ├── imageUtils.ts     # 圖片處理
│   │   └── stats.ts          # 統計計算
│   ├── App.tsx               # 應用根組件
│   ├── main.tsx              # 應用入口
│   └── index.css             # 全局樣式
├── dist/                      # 構建輸出
├── node_modules/              # 依賴包
├── package.json               # 項目配置
├── vite.config.ts             # Vite 配置
├── tailwind.config.js         # Tailwind 配置
├── tsconfig.json              # TypeScript 配置
└── README.md                  # 項目文檔
```

## 🎨 核心功能

### 1. 用戶認證系統

#### 認證流程
```typescript
// 演示用戶登入
const demoLogin = async (role: 'school' | 'company') => {
  const response = await demoAuthService.demoLogin(role);
  setAuthToken(response.token);
  setUser(response.user);
};

// 真實用戶登入
const realLogin = async (email: string, password: string) => {
  const response = await demoAuthService.realLogin(email, password);
  setAuthToken(response.token);
  setUser(response.user);
};
```

#### 權限控制
- **學校用戶**：發布需求、管理需求、查看儀表板
- **企業用戶**：瀏覽需求、贊助項目、查看儀表板
- **演示用戶**：體驗完整功能流程

### 2. 需求管理系統

#### 需求發布
```typescript
interface SchoolNeed {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  student_count: number;
  urgency: 'high' | 'medium' | 'low';
  sdgs: number[];
  status: 'active' | 'in_progress' | 'completed';
}
```

#### 需求瀏覽
- **智能篩選**：按類別、地區、緊急程度篩選
- **地圖視圖**：在地圖上查看需求分布
- **詳細信息**：查看需求詳情和進度

### 3. 配對系統

#### 智能推薦
```typescript
// 基於 SDG 目標的推薦算法
const getRecommendedNeeds = async (companyId: string) => {
  const needs = await apiService.getCompanyRecommendedNeeds();
  return needs.filter(need => 
    need.sdgs.some(sdg => companyPreferences.includes(sdg))
  );
};
```

#### 配對流程
1. **需求分析**：分析學校需求特徵
2. **企業匹配**：根據企業偏好匹配
3. **智能推薦**：推薦最適合的配對
4. **確認配對**：雙方確認配對關係

### 4. 儀表板系統

#### 學校儀表板
```typescript
interface SchoolDashboardStats {
  totalNeeds: number;        // 總需求數
  activeNeeds: number;       // 活躍需求數
  completedNeeds: number;    // 完成需求數
  studentsBenefited: number;  // 受惠學生數
  avgResponseTime: number;    // 平均響應時間
  successRate: number;       // 成功率
}
```

#### 企業儀表板
```typescript
interface CompanyDashboardStats {
  completedProjects: number;    // 完成項目數
  studentsHelped: number;       // 幫助學生數
  volunteerHours: number;       // 志工時數
  totalDonation: number;        // 總捐贈金額
  avgProjectDuration: number;   // 平均項目時長
  successRate: number;          // 成功率
  sdgContributions: Record<string, number>; // SDG 貢獻
}
```

## 🧩 組件設計

### 1. 通用組件

#### ErrorBoundary
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

#### LoadingSpinner
```typescript
const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-2 border-${color}-200 border-t-${color}-600 rounded-full animate-spin`} />
    </div>
  );
};
```

### 2. 業務組件

#### NeedCard
```typescript
interface NeedCardProps {
  need: SchoolNeed;
  variant?: 'public' | 'admin';
  onDelete?: (id: string) => void;
  onSponsor?: (need: SchoolNeed) => void;
  progress?: number;
}

const NeedCard = ({ need, variant = 'public', onDelete, onSponsor, progress = 75 }: NeedCardProps) => {
  // 組件實現
};
```

#### StatsCard
```typescript
interface StatsCardProps {
  title: string;
  value: number;
  unit?: string;
  isCurrency?: boolean;
  percentage?: number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}
```

### 3. 布局組件

#### MainLayout
```typescript
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};
```

#### DashboardLayout
```typescript
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

## 🔄 狀態管理

### 1. 認證狀態

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  demoLogin: (role: 'school' | 'company') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 2. API 狀態管理

#### useApiState Hook
```typescript
interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isUsingFallback: boolean;
  refetch: () => void;
  updateData: (newData: T | ((prev: T | null) => T)) => void;
}

export const useApiState = <T>({
  url,
  apiFunction,
  onSuccess,
  onError
}: ApiStateProps<T>): ApiState<T> => {
  // Hook 實現
};
```

### 3. 統計數據管理

#### useStats Hook
```typescript
export const useSchoolStats = (needs: SchoolNeed[]) => {
  const stats = useMemo(() => calculateSchoolStats(needs), [needs]);
  
  return {
    stats,
    isLoading: needs.length === 0,
    isEmpty: needs.length === 0
  };
};
```

## 🌐 API 集成

### 1. API 服務架構

#### ApiService 類
```typescript
class ApiService {
  private apiAvailable: boolean | null = null;
  private fallbackData: any = {};
  private schoolToken?: string;
  private companyToken?: string;

  // 通用請求方法
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // 實現請求邏輯
  }

  // 學校需求相關 API
  async getSchoolNeeds(): Promise<SchoolNeed[]> {
    return this.request<SchoolNeed[]>('/school_needs');
  }

  // 企業需求相關 API
  async getCompanyNeeds(): Promise<SchoolNeed[]> {
    return this.request<SchoolNeed[]>('/company_needs');
  }
}
```

### 2. 認證處理

#### 自動認證
```typescript
// 自動為需認證端點附加 Authorization header
const schoolProtected = new Set(PROTECTED_ENDPOINTS.school);
const companyProtected = new Set(PROTECTED_ENDPOINTS.company);

if (schoolProtected.has(endpoint)) {
  const token = await this.ensureToken('school');
  authHeaders = { Authorization: `Bearer ${token}` };
}
```

### 3. 錯誤處理

#### 降級策略
```typescript
// 如果 API 失敗且允許降級，使用本地數據
if (currentConfig.useLocalFallback) {
  return this.getFallbackData<T>(endpoint);
}
```

## 🎬 動畫系統

### 1. 動畫配置

#### 統一動畫配置
```typescript
export const ANIMATIONS = {
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  button: {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2 }
  }
} as const;
```

### 2. 頁面動畫

#### 首頁動畫
```typescript
// 滾動觸發動畫
const { scrollYProgress } = useScroll({
  target: mainRef,
  offset: ["start end", "end start"]
});

const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
const y = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -50]);
```

### 3. 組件動畫

#### 卡片動畫
```typescript
<motion.div
  className="rounded-2xl border border-neutral-100 shadow-soft-lg bg-white overflow-hidden"
  whileHover={{ 
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  }}
  transition={ANIMATIONS.button.transition}
  initial={ANIMATIONS.card.initial}
  animate={ANIMATIONS.card.animate}
>
```

## ⚡ 性能優化

### 1. 代碼分割

#### Vite 配置
```typescript
export default defineConfig({
  build: {
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
});
```

### 2. 圖片優化

#### 圖片路徑處理
```typescript
export const getImagePath = (path: string): string => {
  const basePath = import.meta.env.PROD ? '/Edu_macth_PRO' : '';
  return `${basePath}${path}`;
};

export const getFallbackImageByCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    '硬體設備': '/images/impact-stories/background-wall/01.jpg',
    '師資/技能': '/images/impact-stories/background-wall/05.jpg',
    // ... 其他類別
  };
  
  const imagePath = categoryMap[category] || '/images/impact-stories/background-wall/01.jpg';
  return getImagePath(imagePath);
};
```

### 3. 狀態優化

#### React.memo 優化
```typescript
const NeedCard = React.memo(({ need, variant, onDelete, onSponsor }: NeedCardProps) => {
  // 組件實現
});

const StatsCard = React.memo(({ title, value, icon, color }: StatsCardProps) => {
  // 組件實現
});
```

### 4. 懶加載

#### 路由懶加載
```typescript
const HomePage = lazy(() => import('./pages/HomePage'));
const AllNeedsPage = lazy(() => import('./pages/AllNeedsPage'));
const CompanyDashboardPage = lazy(() => import('./pages/CompanyDashboardPage'));
```

## 🚀 部署指南

### 1. 環境配置

#### 生產環境變量
```bash
# .env.production
VITE_API_BASE_URL=https://api.edu-match-pro.com
VITE_USE_LOCAL_FALLBACK=false
VITE_APP_VERSION=1.0.0
```

### 2. 構建配置

#### Vite 生產配置
```typescript
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Edu_macth_PRO/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // 代碼分割配置
        }
      }
    }
  }
}));
```

### 3. 部署步驟

#### GitHub Pages 部署
```bash
# 構建項目
npm run build

# 部署到 GitHub Pages
npm run deploy
```

#### Docker 部署
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4. 性能監控

#### 性能指標
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

## 🛠️ 開發指南

### 1. 開發環境設置

#### 必要工具
```bash
# 安裝 Node.js 18+
nvm install 18
nvm use 18

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

#### VS Code 擴展
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **Prettier - Code formatter**
- **ESLint**

### 2. 代碼規範

#### ESLint 配置
```javascript
export default [
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-unused-vars': 'error'
    }
  }
];
```

#### 代碼風格
- 使用 TypeScript 嚴格模式
- 遵循 React Hooks 最佳實踐
- 使用 Tailwind CSS 進行樣式設計
- 保持組件單一職責原則

### 3. 測試策略

#### 單元測試
```typescript
import { render, screen } from '@testing-library/react';
import { NeedCard } from '../components/NeedCard';

describe('NeedCard', () => {
  it('renders need information correctly', () => {
    const mockNeed = {
      id: '1',
      title: 'Test Need',
      description: 'Test Description',
      // ... 其他屬性
    };

    render(<NeedCard need={mockNeed} />);
    expect(screen.getByText('Test Need')).toBeInTheDocument();
  });
});
```

### 4. Git 工作流

#### 分支策略
- **main**: 生產環境分支
- **develop**: 開發環境分支
- **feature/**: 功能分支
- **hotfix/**: 緊急修復分支

#### 提交規範
```bash
# 功能提交
git commit -m "feat: add need card component"

# 修復提交
git commit -m "fix: resolve image loading issue"

# 文檔提交
git commit -m "docs: update README.md"
```

## 🔧 故障排除

### 1. 常見問題

#### 依賴安裝問題
```bash
# 清除緩存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 構建問題
```bash
# 檢查 TypeScript 錯誤
npx tsc --noEmit

# 檢查 ESLint 錯誤
npm run lint
```

#### 運行時錯誤
```bash
# 檢查控制台錯誤
# 檢查網絡請求
# 檢查環境變量配置
```

### 2. 性能問題

#### Bundle 大小分析
```bash
# 分析 Bundle 大小
npm run build -- --analyze

# 檢查重複依賴
npx duplicate-package-checker
```

#### 內存洩漏
```typescript
// 清理事件監聽器
useEffect(() => {
  const handleResize = () => {
    // 處理邏輯
  };

  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

### 3. 調試技巧

#### React DevTools
- 使用 React DevTools 檢查組件狀態
- 使用 Profiler 分析性能瓶頸
- 使用 Redux DevTools 調試狀態

#### 網絡調試
- 使用瀏覽器開發者工具
- 檢查 API 請求和響應
- 監控網絡性能

## 🤝 貢獻指南

### 1. 貢獻流程

#### 提交 Issue
1. 檢查現有 Issue 是否已存在
2. 提供詳細的問題描述
3. 附上復現步驟和環境信息

#### 提交 Pull Request
1. Fork 項目到個人倉庫
2. 創建功能分支
3. 提交代碼變更
4. 創建 Pull Request

### 2. 代碼貢獻

#### 新功能開發
```bash
# 創建功能分支
git checkout -b feature/new-feature

# 開發功能
# 提交變更
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/new-feature
```

#### Bug 修復
```bash
# 創建修復分支
git checkout -b fix/bug-description

# 修復問題
# 提交變更
git add .
git commit -m "fix: resolve bug description"

# 推送分支
git push origin fix/bug-description
```

### 3. 文檔貢獻

#### 更新文檔
- 保持文檔與代碼同步
- 使用清晰的語言和格式
- 提供代碼示例和截圖

#### 翻譯貢獻
- 提供多語言支持
- 保持術語一致性
- 遵循本地化最佳實踐

## 📞 支持與聯繫

### 技術支持
- **GitHub Issues**: [項目 Issues 頁面](https://github.com/your-org/edu-match-pro/issues)
- **文檔**: [項目文檔](https://docs.edu-match-pro.com)
- **API 文檔**: [API 參考](https://api.edu-match-pro.com/docs)

### 社區
- **討論區**: [GitHub Discussions](https://github.com/your-org/edu-match-pro/discussions)
- **Discord**: [開發者社區](https://discord.gg/edu-match-pro)
- **Twitter**: [@EduMatchPro](https://twitter.com/EduMatchPro)

### 商業支持
- **企業支持**: support@edu-match-pro.com
- **合作夥伴**: partners@edu-match-pro.com
- **媒體聯繫**: media@edu-match-pro.com

---

## 📄 許可證

本項目採用 [MIT 許可證](LICENSE) - 查看 LICENSE 文件了解詳情。

## 🙏 致謝

感謝所有為這個項目做出貢獻的開發者、設計師和用戶。

特別感謝：
- React 團隊提供的優秀框架
- Tailwind CSS 團隊提供的樣式解決方案
- Framer Motion 團隊提供的動畫庫
- 所有開源項目的貢獻者

---

**Edu-Match-Pro Frontend** - 連接教育需求與企業資源的橋樑 🌉
