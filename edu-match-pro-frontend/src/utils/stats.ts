/**
 * 統計計算工具函數
 * 集中處理前端統計數據計算，避免重複邏輯
 */

import type { SchoolNeed, CompanyDonation, ImpactStory } from '../types';

// ==================== 學校需求統計 ====================

export interface SchoolStats {
  totalNeeds: number;
  activeNeeds: number;
  completedNeeds: number;
  studentsBenefited: number;
  avgStudentsPerNeed: number;
  categoryDistribution: Record<string, number>;
  urgencyDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
}

export const calculateSchoolStats = (needs: SchoolNeed[]): SchoolStats => {
  const totalNeeds = needs.length;
  const activeNeeds = needs.filter(need => 
    need.status === 'active' || need.status === 'in_progress'
  ).length;
  const completedNeeds = needs.filter(need => 
    need.status === 'completed'
  ).length;
  const studentsBenefited = needs.reduce((sum, need) => sum + need.student_count, 0);
  const avgStudentsPerNeed = totalNeeds > 0 ? studentsBenefited / totalNeeds : 0;

  // 分類分布
  const categoryDistribution = needs.reduce((acc, need) => {
    acc[need.category] = (acc[need.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 緊急度分布
  const urgencyDistribution = needs.reduce((acc, need) => {
    acc[need.urgency] = (acc[need.urgency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 地區分布
  const locationDistribution = needs.reduce((acc, need) => {
    acc[need.location] = (acc[need.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalNeeds,
    activeNeeds,
    completedNeeds,
    studentsBenefited,
    avgStudentsPerNeed,
    categoryDistribution,
    urgencyDistribution,
    locationDistribution
  };
};

// ==================== 企業捐贈統計 ====================

export interface CompanyStats {
  totalDonations: number;
  completedDonations: number;
  studentsHelped: number;
  totalDonationAmount: number;
  avgProjectDuration: number;
  successRate: number;
  sdgContributions: Record<string, number>;
  categoryDistribution: Record<string, number>;
}

export const calculateCompanyStats = (
  donations: CompanyDonation[], 
  needs: SchoolNeed[] = []
): CompanyStats => {
  const totalDonations = donations.length;
  const completedDonations = donations.filter(d => d.status === 'completed').length;
  
  // 計算受惠學生數（需要連接需求數據）
  const studentsHelped = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, donation) => {
      const need = needs.find(n => n.id === donation.need_id);
      return sum + (need?.student_count || 0);
    }, 0);

  // 計算總捐贈金額（目前沒有 amount 字段，設為 0）
  const totalDonationAmount = 0;

  // 計算平均專案天數
  const completedWithDates = donations.filter(d => 
    d.status === 'completed' && d.completion_date && d.created_at
  );
  const avgProjectDuration = completedWithDates.length > 0 
    ? completedWithDates.reduce((sum, d) => {
        const duration = new Date(d.completion_date!).getTime() - new Date(d.created_at!).getTime();
        return sum + Math.ceil(duration / (1000 * 60 * 60 * 24)); // 轉換為天數
      }, 0) / completedWithDates.length
    : 0;

  // 計算成功率
  const successRate = totalDonations > 0 ? (completedDonations / totalDonations) * 100 : 0;

  // 計算 SDG 貢獻
  const sdgContributions: Record<string, number> = {};
  donations.forEach(donation => {
    const need = needs.find(n => n.id === donation.need_id);
    if (need?.sdgs) {
      need.sdgs.forEach(sdg => {
        sdgContributions[sdg.toString()] = (sdgContributions[sdg.toString()] || 0) + 1;
      });
    }
  });

  // 捐贈類型分布
  const categoryDistribution = donations.reduce((acc, d) => {
    acc[d.donation_type] = (acc[d.donation_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalDonations,
    completedDonations,
    studentsHelped,
    totalDonationAmount,
    avgProjectDuration: Math.round(avgProjectDuration),
    successRate: Math.round(successRate * 100) / 100,
    sdgContributions,
    categoryDistribution
  };
};

// ==================== 影響力故事統計 ====================

export interface ImpactStats {
  totalStories: number;
  totalStudentsImpacted: number;
  avgStudentsPerStory: number;
  schoolDistribution: Record<string, number>;
  companyDistribution: Record<string, number>;
}

export const calculateImpactStats = (stories: ImpactStory[]): ImpactStats => {
  const totalStories = stories.length;
  const totalStudentsImpacted = stories.reduce((sum, story) => 
    sum + (story.impact?.studentsBenefited || 0), 0
  );
  const avgStudentsPerStory = totalStories > 0 ? totalStudentsImpacted / totalStories : 0;

  // 學校分布
  const schoolDistribution = stories.reduce((acc, story) => {
    acc[story.schoolName] = (acc[story.schoolName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 企業分布
  const companyDistribution = stories.reduce((acc, story) => {
    acc[story.companyName] = (acc[story.companyName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalStories,
    totalStudentsImpacted,
    avgStudentsPerStory,
    schoolDistribution,
    companyDistribution
  };
};

// ==================== 地圖數據統計 ====================

export interface MapStats {
  totalSchools: number;
  totalStudents: number;
  avgStudentsPerSchool: number;
  regionDistribution: Record<string, number>;
}

export const calculateMapStats = (schoolData: Array<{
  name: string;
  location: string;
  students: number;
  region?: string;
}>): MapStats => {
  const totalSchools = schoolData.length;
  const totalStudents = schoolData.reduce((sum, school) => sum + school.students, 0);
  const avgStudentsPerSchool = totalSchools > 0 ? totalStudents / totalSchools : 0;

  // 地區分布
  const regionDistribution = schoolData.reduce((acc, school) => {
    const region = school.region || school.location.split('縣')[0] || school.location.split('市')[0];
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalSchools,
    totalStudents,
    avgStudentsPerSchool,
    regionDistribution
  };
};

// ==================== 通用統計工具 ====================

export const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? Math.round((value / total) * 100 * 100) / 100 : 0;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount);
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-red-100 text-red-800',
    'pending': 'bg-gray-100 text-gray-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getUrgencyColor = (urgency: string): string => {
  const urgencyColors: Record<string, string> = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800'
  };
  return urgencyColors[urgency] || 'bg-gray-100 text-gray-800';
};
