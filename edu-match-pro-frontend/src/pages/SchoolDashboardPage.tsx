import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useApiState, ApiStateRenderer } from '../hooks/useApiState';
import { API_ENDPOINTS } from '../config/api';
import apiService from '../services/apiService';
import NeedCard from '../components/NeedCard';
import { calculateSchoolStats, formatNumber, calculatePercentage } from '../utils/stats';
import type { SchoolNeed, SchoolDashboardStats, RecentActivity } from '../types';

const SchoolDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'needs' | 'analytics'>('overview');
  const [myNeeds, setMyNeeds] = useState<SchoolNeed[]>([]);
  
  const statsState = useApiState<SchoolDashboardStats>({
    url: API_ENDPOINTS.SCHOOL_DASHBOARD_STATS
  });
  const activityState = useApiState<RecentActivity[]>({
    url: API_ENDPOINTS.RECENT_ACTIVITY
  });

  // 獲取我的需求
  const fetchMyNeeds = async () => {
    try {
      const data = await apiService.getMyNeeds();
      setMyNeeds(data as any);
    } catch (err) {
      console.error('獲取我的需求時發生錯誤:', err);
    }
  };

  useEffect(() => {
    fetchMyNeeds();
  }, []);

  // 處理按鈕點擊事件
  const handleCreateNeed = () => {
    navigate('/dashboard/create-need');
  };

  const handleViewNeed = (needId: string) => {
    navigate(`/needs/${needId}`);
  };

  const handleEditNeed = (needId: string) => {
    navigate(`/dashboard/edit-need/${needId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">學校儀表板</h1>
          <p className="mt-2 text-gray-600">管理您的學校需求和查看統計資料</p>
        </div>

        {/* 快速操作按鈕 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCreateNeed}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新增需求
            </button>
            <button
              onClick={() => navigate('/dashboard/my-needs')}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              查看所有需求
            </button>
          </div>
        </div>

        {/* 標籤頁導航 */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: '總覽', count: null },
              { id: 'needs', name: '我的需求', count: myNeeds.length },
              { id: 'analytics', name: '分析', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* 標籤頁內容 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 統計卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ApiStateRenderer state={statsState}>
                  {(stats) => (
                    <>
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">總需求數</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalNeeds}</p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-full">
                            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">進行中</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeNeeds}</p>
                          </div>
                          <div className="p-3 bg-yellow-100 rounded-full">
                            <ClockIcon className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">已完成</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completedNeeds}</p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">受益學生</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.studentsBenefited}</p>
                          </div>
                          <div className="p-3 bg-purple-100 rounded-full">
                            <UserGroupIcon className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </ApiStateRenderer>
              </div>

              {/* 最近活動 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">最近活動</h3>
                </div>
                <div className="p-6">
                  <ApiStateRenderer state={activityState}>
                    {(activities) => (
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.status === 'success' ? 'bg-green-500' :
                              activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{activity.title}</p>
                              <p className="text-xs text-gray-500">{activity.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ApiStateRenderer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'needs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">我的需求</h3>
                <button
                  onClick={handleCreateNeed}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  新增需求
                </button>
              </div>

              {myNeeds.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有發布任何需求</h3>
                  <p className="text-gray-500 mb-4">開始為您的學校發布第一個需求吧！</p>
                  <button
                    onClick={handleCreateNeed}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    發布需求
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myNeeds.map((need) => (
                    <NeedCard 
                      key={need.id} 
                      need={need} 
                      variant="admin" 
                      onDelete={(id) => {
                        if (window.confirm('確定要刪除這個需求嗎？')) {
                          // 這裡可以添加刪除邏輯
                          console.log('刪除需求:', id);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">需求分析</h3>
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">分析功能開發中</h4>
                  <p className="text-gray-500">我們正在開發詳細的分析功能，敬請期待！</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SchoolDashboardPage;