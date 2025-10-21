import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useApiState, ApiStateRenderer } from '../hooks/useApiState';
import { API_ENDPOINTS } from '../config/api';
import type { CompanyDonation } from '../types';

const MyDonationsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const state = useApiState<CompanyDonation[]>({
    url: API_ENDPOINTS.COMPANY_DONATIONS
  });

  // 計算統計數據
  const calculateStats = (donations: CompanyDonation[]) => {
    const total = donations.length;
    const completed = donations.filter(d => d.status === 'completed').length;
    const inProgress = donations.filter(d => d.status === 'in_progress').length;
    const pending = donations.filter(d => d.status === 'pending').length;
    const totalStudents = donations.reduce((sum, d) => sum + (d.need?.student_count || 0), 0);
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, inProgress, pending, totalStudents, completionRate };
  };

  // 過濾捐贈數據
  const filteredDonations = state.data?.filter(donation => {
    if (activeTab === 'all') return true;
    return donation.status === activeTab;
  }) || [];

  const stats = calculateStats(state.data || []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { text: '待處理', class: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      'in_progress': { text: '進行中', class: 'bg-blue-100 text-blue-800', icon: ChartBarIcon },
      'completed': { text: '已完成', class: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      'cancelled': { text: '已取消', class: 'bg-red-100 text-red-800', icon: 'X' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      text: status, 
      class: 'bg-gray-100 text-gray-800', 
      icon: 'X' 
    };
    
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {IconComponent !== 'X' && <IconComponent className="w-3 h-3 mr-1" />}
        {config.text}
      </span>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的捐贈計劃</h1>
          <p className="text-gray-600">管理您的企業社會責任計劃，追蹤影響力成果</p>
        </motion.div>

        {/* 統計卡片 */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總計劃數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">進行中</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">受益學生</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 標籤頁 */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: '全部', count: stats.total },
                { key: 'pending', label: '待處理', count: stats.pending },
                { key: 'in_progress', label: '進行中', count: stats.inProgress },
                { key: 'completed', label: '已完成', count: stats.completed }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* 捐贈列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {state.isLoading ? (
            <div className="flex justify-center items-center min-h-64">
              <div className="text-lg text-gray-600">載入中...</div>
            </div>
          ) : state.error ? (
            <div className="flex justify-center items-center min-h-64">
              <div className="text-lg text-red-600">資料載入失敗...</div>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-12">
              <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">尚無捐贈記錄</h3>
              <p className="mt-1 text-sm text-gray-500">開始您的第一個企業社會責任計劃吧！</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredDonations.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {donation.need?.title || donation.description || '捐贈專案'}
                          </h3>
                          {getStatusBadge(donation.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <AcademicCapIcon className="w-4 h-4 mr-2" />
                            <span>{donation.need?.student_count || 0} 位學生受惠</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            <span>{donation.need?.location || '未知地點'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            <span>{formatDate(donation.created_at)}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">進度</span>
                            <span className="text-sm font-medium text-gray-900">{donation.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(donation.progress)}`}
                              style={{ width: `${donation.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {donation.donation_type}
                            </span>
                            {donation.description && (
                              <span className="text-sm text-gray-600 truncate max-w-xs">
                                {donation.description}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/needs/${donation.need_id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              查看詳情
                            </Link>
                            {donation.status === 'completed' && (
                              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                <StarIcon className="w-4 h-4 mr-1" />
                                影響力報告
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyDonationsPage;
