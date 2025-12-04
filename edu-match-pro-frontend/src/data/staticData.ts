/**
 * 靜態數據文件
 * 僅保留必要的演示數據和統計數據
 * 其他數據統一使用後端 API
 */

import type { CompanyDashboardStats, SchoolDashboardStats } from '../types';

// 公司儀表板統計數據（演示用）
export const companyDashboardStats: CompanyDashboardStats = {
  completedProjects: 12,
  studentsHelped: 450,
  volunteerHours: 180,
  totalDonation: 850000,
  avgProjectDuration: 3,
  successRate: 95,
  sdgContributions: {}
};

// 學校儀表板統計數據（演示用）
export const schoolDashboardStats: SchoolDashboardStats = {
  totalNeeds: 8,
  activeNeeds: 5,
  completedNeeds: 3,
  studentsBenefited: 120,
  avgResponseTime: 5,
  successRate: 88
};

// 地圖展示用的學校數據（演示用）
export const mapSchoolData = [
  { 
    id: 1, 
    name: '台東縣太麻里國小', 
    needs: ['電腦設備', '圖書資源'],
    students: 45,
    status: 'urgent' as const
  },
  { 
    id: 2, 
    name: '花蓮縣秀林國中', 
    needs: ['體育器材', '音樂設備'],
    students: 78,
    status: 'active' as const
  },
  { 
    id: 3, 
    name: '屏東縣霧台國小', 
    needs: ['教學設備', '圖書資源'],
    students: 32,
    status: 'urgent' as const
  },
  { 
    id: 4, 
    name: '南投縣信義國中', 
    needs: ['電腦設備', '實驗器材'],
    students: 156,
    status: 'active' as const
  },
  { 
    id: 5, 
    name: '嘉義縣阿里山國小', 
    needs: ['圖書資源', '教學設備'],
    students: 28,
    status: 'urgent' as const
  },
  { 
    id: 6, 
    name: '新竹縣尖石國中', 
    needs: ['體育器材', '電腦設備'],
    students: 89,
    status: 'active' as const
  },
  { 
    id: 7, 
    name: '苗栗縣泰安國小', 
    needs: ['音樂設備', '圖書資源'],
    students: 41,
    status: 'urgent' as const
  },
  { 
    id: 8, 
    name: '宜蘭縣大同國中', 
    needs: ['實驗器材', '體育器材'],
    students: 134,
    status: 'active' as const
  },
];