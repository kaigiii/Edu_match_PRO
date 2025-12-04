/**
 * 統計數據 Hook
 * 提供統一的統計數據計算和狀態管理
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  calculateSchoolStats, 
  calculateCompanyStats, 
  calculateImpactStats,
  calculateMapStats,
  type SchoolStats,
  type CompanyStats,
  type ImpactStats,
  type MapStats
} from '../utils/stats';
import type { SchoolNeed, CompanyDonation, ImpactStory } from '../types';

// 學校統計 Hook
export const useSchoolStats = (needs: SchoolNeed[]) => {
  const stats = useMemo(() => calculateSchoolStats(needs), [needs]);
  
  return {
    stats,
    isLoading: needs.length === 0,
    isEmpty: needs.length === 0
  };
};

// 企業統計 Hook
export const useCompanyStats = (donations: CompanyDonation[], needs: SchoolNeed[] = []) => {
  const stats = useMemo(() => calculateCompanyStats(donations, needs), [donations, needs]);
  
  return {
    stats,
    isLoading: donations.length === 0,
    isEmpty: donations.length === 0
  };
};

// 影響力統計 Hook
export const useImpactStats = (stories: ImpactStory[]) => {
  const stats = useMemo(() => calculateImpactStats(stories), [stories]);
  
  return {
    stats,
    isLoading: stories.length === 0,
    isEmpty: stories.length === 0
  };
};

// 地圖統計 Hook
export const useMapStats = (schoolData: Array<{
  name: string;
  location: string;
  students: number;
  region?: string;
}>) => {
  const stats = useMemo(() => calculateMapStats(schoolData), [schoolData]);
  
  return {
    stats,
    isLoading: schoolData.length === 0,
    isEmpty: schoolData.length === 0
  };
};

// 通用統計 Hook
export const useStats = <T>(
  data: T[],
  calculator: (data: T[]) => any
) => {
  const stats = useMemo(() => calculator(data), [data, calculator]);
  
  return {
    stats,
    isLoading: data.length === 0,
    isEmpty: data.length === 0
  };
};
