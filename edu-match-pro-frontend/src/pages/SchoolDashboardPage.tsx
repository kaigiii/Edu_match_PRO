import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';
import NeedCard from '../components/NeedCard';
import type { SchoolNeed } from '../types';

interface SchoolDashboardStats {
  totalNeeds: number;
  activeNeeds: number;
  completedNeeds: number;
  studentsBenefited: number;
  avgResponseTime: number;
  successRate: number;
}

interface RecentActivity {
  id: string;
  type: 'created' | 'matched' | 'completed';
  title: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

const SchoolDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'needs' | 'analytics'>('overview');
  
  const { data: stats, isLoading: statsLoading, error: statsError, isUsingFallback: statsFallback } = useApi<SchoolDashboardStats>('http://localhost:3001/school_dashboard_stats');
  const { data: myNeeds, isLoading: needsLoading, error: needsError, isUsingFallback: needsFallback } = useApi<SchoolNeed[]>('http://localhost:3001/my_needs');
  const { data: recentActivity, isLoading: activityLoading, isUsingFallback: activityFallback } = useApi<RecentActivity[]>('http://localhost:3001/recent_activity');

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

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">載入中...</div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-red-600">資料載入失敗...</div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <PlusIcon className="w-5 h-5 text-blue-600" />;
      case 'matched':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 歡迎標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">歡迎回來，王校長！</h1>
        <p className="text-gray-600 mt-2">以下是您的學校需求管理總覽</p>
      </div>

      {/* 標籤頁導航 */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: '總覽', icon: ChartBarIcon },
            { id: 'needs', label: '我的需求', icon: UserGroupIcon },
            { id: 'analytics', label: '數據分析', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-brand-blue shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 總覽標籤頁 */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 數據卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="flex items-center relative z-10">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700">總需求數</p>
                  <motion.p 
                    className="text-3xl font-bold text-blue-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    {stats?.totalNeeds || 0}
                  </motion.p>
                </div>
                <div className="text-blue-600">
                  <UserGroupIcon className="w-10 h-10" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="flex items-center relative z-10">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700">進行中需求</p>
                  <motion.p 
                    className="text-3xl font-bold text-green-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    {stats?.activeNeeds || 0}
                  </motion.p>
                </div>
                <div className="text-green-600">
                  <ClockIcon className="w-10 h-10" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="flex items-center relative z-10">
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-700">已完成需求</p>
                  <motion.p 
                    className="text-3xl font-bold text-purple-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    {stats?.completedNeeds || 0}
                  </motion.p>
                </div>
                <div className="text-purple-600">
                  <CheckCircleIcon className="w-10 h-10" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="flex items-center relative z-10">
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-700">受益學生數</p>
                  <motion.p 
                    className="text-3xl font-bold text-orange-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  >
                    {stats?.studentsBenefited || 0}
                  </motion.p>
                </div>
                <div className="text-orange-600">
                  <UserGroupIcon className="w-10 h-10" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* 最近活動 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">最近活動</h3>
              <div className="space-y-4">
                {activityLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600">載入活動中...</div>
                  </div>
                ) : (
                  recentActivity?.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${getActivityColor(activity.status)}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm opacity-75">{activity.timestamp}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* 快速統計 */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">快速統計</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">平均回應時間</span>
                  <span className="font-bold text-lg text-blue-600">{stats?.avgResponseTime || 0} 天</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">成功率</span>
                  <span className="font-bold text-lg text-green-600">{stats?.successRate || 0}%</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <button 
                    onClick={handleCreateNeed}
                    className="w-full bg-brand-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-blue-dark transition-colors"
                  >
                    發布新需求
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* 我的需求標籤頁 */}
      {activeTab === 'needs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">我的需求</h2>
            <button 
              onClick={handleCreateNeed}
              className="bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-blue-dark transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>新增需求</span>
            </button>
          </div>

          {needsLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">載入需求中...</div>
            </div>
          ) : needsError ? (
            <div className="text-center py-12">
              <div className="text-lg text-red-600">載入失敗，請稍後再試</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myNeeds?.map((need, index) => (
                <motion.div
                  key={need.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="relative group">
                    <NeedCard need={need} variant="admin" />
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleViewNeed(need.id)}
                        className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
                        title="查看需求"
                      >
                        <EyeIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleEditNeed(need.id)}
                        className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
                        title="編輯需求"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* 數據分析標籤頁 */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">數據分析</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">需求狀態分佈</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">進行中</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats?.activeNeeds || 0) / (stats?.totalNeeds || 1) * 100}%` }}></div>
                    </div>
                    <span className="font-semibold">{stats?.activeNeeds || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">已完成</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats?.completedNeeds || 0) / (stats?.totalNeeds || 1) * 100}%` }}></div>
                    </div>
                    <span className="font-semibold">{stats?.completedNeeds || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">效能指標</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">平均回應時間</span>
                  <span className="font-bold text-blue-600">{stats?.avgResponseTime || 0} 天</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">成功率</span>
                  <span className="font-bold text-green-600">{stats?.successRate || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">受益學生</span>
                  <span className="font-bold text-purple-600">{stats?.studentsBenefited || 0} 人</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SchoolDashboardPage;
