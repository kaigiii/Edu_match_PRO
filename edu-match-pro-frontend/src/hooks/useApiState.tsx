import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../config/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isUsingFallback: boolean;
  refetch: () => void;
  updateData: (newData: T | ((prev: T | null) => T)) => void;
}

interface ApiStateProps<T> {
  url: string;
  apiFunction?: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApiState<T>({ 
  url, 
  apiFunction, 
  onSuccess, 
  onError 
}: ApiStateProps<T>): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsUsingFallback(false);

      let result: T;
      
      if (apiFunction) {
        result = await apiFunction();
      } else {
        // 使用 URL 獲取數據
        const endpoint = url;
        
        // 檢查是否為空端點
        if (!endpoint || endpoint === '') {
          throw new Error(`Empty endpoint: ${endpoint}`);
        }
        
        // 處理動態端點（如 /school_needs/:id）
        if (endpoint.startsWith('/school_needs/') && endpoint !== '/school_needs') {
          const needId = endpoint.split('/').pop();
          if (needId && needId !== 'undefined' && needId !== '') {
            result = await apiService.getSchoolNeedById(needId) as T;
          } else {
            // 提供更友好的錯誤訊息
            console.warn(`Invalid need ID in endpoint: ${endpoint}. This may be due to missing route parameters.`);
            throw new Error(`Invalid need ID in endpoint: ${endpoint}`);
          }
        } else {
          const apiFunction = getApiFunction(endpoint);
          if (!apiFunction) {
            throw new Error(`Unknown API endpoint: ${endpoint}`);
          }
          result = await apiFunction() as T;
        }
      }

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      setIsUsingFallback(true);
      onError?.(error);
      console.warn('API request failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [url, apiFunction, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const updateData = useCallback((newData: T | ((prev: T | null) => T)) => {
    setData(newData);
  }, []);

  return {
    data,
    isLoading,
    error,
    isUsingFallback,
    refetch,
    updateData,
  };
}

// API 端點映射
const API_ENDPOINT_MAP: Record<string, () => Promise<any>> = {
  [API_ENDPOINTS.SCHOOL_NEEDS]: () => apiService.getSchoolNeeds(),
  [API_ENDPOINTS.COMPANY_NEEDS]: () => apiService.getCompanyNeeds(),
  // 支援動態詳情端點，這裡由頁面直接呼叫 apiService.getSchoolNeedById(id)
  [API_ENDPOINTS.COMPANY_DASHBOARD_STATS]: () => apiService.getCompanyDashboardStats(),
  [API_ENDPOINTS.SCHOOL_DASHBOARD_STATS]: () => apiService.getSchoolDashboardStats(),
  [API_ENDPOINTS.AI_RECOMMENDED_NEEDS]: () => apiService.getRecommendedNeeds(),
  [API_ENDPOINTS.COMPANY_AI_RECOMMENDED_NEEDS]: () => apiService.getCompanyRecommendedNeeds(),
  [API_ENDPOINTS.RECENT_PROJECTS]: () => apiService.getRecentProjects(),
  [API_ENDPOINTS.IMPACT_STORIES]: () => apiService.getImpactStories(),
  [API_ENDPOINTS.MY_NEEDS]: () => apiService.getMyNeeds(),
  [API_ENDPOINTS.COMPANY_DONATIONS]: () => apiService.getCompanyDonations(),
  [API_ENDPOINTS.RECENT_ACTIVITY]: () => apiService.getRecentActivity(),
};

function getApiFunction(endpoint: string) {
  return API_ENDPOINT_MAP[endpoint];
}

// 統一的載入和錯誤處理組件
interface ApiStateRendererProps<T> {
  state: ApiState<T>;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode;
}

export function ApiStateRenderer<T>({ 
  state, 
  children, 
  loadingComponent,
  errorComponent 
}: ApiStateRendererProps<T>) {
  if (state.isLoading) {
    return loadingComponent || <LoadingSpinner />;
  }

  if (state.error) {
    return errorComponent ? 
      errorComponent(state.error, state.refetch) : 
      <ErrorMessage error={state.error} isUsingFallback={state.isUsingFallback} onRetry={state.refetch} />;
  }

  if (!state.data) {
    return <div className="text-center text-gray-500">沒有數據</div>;
  }

  return <>{children(state.data)}</>;
}
