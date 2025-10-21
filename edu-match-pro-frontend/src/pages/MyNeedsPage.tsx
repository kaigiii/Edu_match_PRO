import { useState, useEffect } from 'react';
import NeedCard from '../components/NeedCard';
import { toast } from 'react-toastify';
import type { SchoolNeed } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../config/api';

const MyNeedsPage = () => {
  const [needs, setNeeds] = useState<SchoolNeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMyNeeds = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await apiService.getMyNeeds();
      setNeeds(data as SchoolNeed[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('獲取需求失敗');
      setError(error);
      console.error('獲取我的需求時發生錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNeeds();
  }, []);

  const executeDelete = async (needId: string) => {
    try {
      await apiService.deleteSchoolNeed(needId);
      {
        setNeeds(needs.filter(need => need.id !== needId));
        toast.success('需求已刪除');
      }
    } catch (error) {
      console.error('刪除需求時發生錯誤:', error);
      toast.error('刪除需求失敗，請稍後再試');
    }
  };

  const handleDelete = (needId: string) => {
    if (window.confirm('確定要刪除這個需求嗎？')) {
      executeDelete(needId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">我的需求</h1>
        <p className="text-gray-600">管理您發布的學校需求</p>
      </div>

      <div className="space-y-6">
        {needs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有發布任何需求</h3>
            <p className="text-gray-500 mb-4">開始為您的學校發布第一個需求吧！</p>
            <button
              onClick={() => window.location.href = '/dashboard/create-need'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              發布需求
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {needs.map((need) => (
              <NeedCard 
                key={need.id} 
                need={need} 
                variant="admin" 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNeedsPage;