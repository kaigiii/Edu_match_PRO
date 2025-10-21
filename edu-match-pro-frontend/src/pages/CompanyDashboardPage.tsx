import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon,
  EyeIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useApiState, ApiStateRenderer } from '../hooks/useApiState';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import NeedCard from '../components/NeedCard';
import SponsorModal from '../components/SponsorModal';
import { calculateCompanyStats, formatNumber, formatCurrency, calculatePercentage } from '../utils/stats';
import type { SchoolNeed, ImpactStory, CompanyDashboardStats } from '../types';

// 使用全域型別定義的 CompanyDashboardStats

interface RecentProject {
  id: string;
  title: string;
  school: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number;
  studentsBenefited: number;
  completionDate?: string;
}

// 使用統一的 ImpactStory 類型定義

const CompanyDashboardPage = () => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'impact' | 'analytics'>('overview');
  const [companyStats, setCompanyStats] = useState<CompanyDashboardStats | null>(null);
  const [sponsorModal, setSponsorModal] = useState<{ isOpen: boolean; need: SchoolNeed | null }>({
    isOpen: false,
    need: null
  });
  
  // 根據用戶角色選擇不同的推薦端點
  const recommendedEndpoint = userRole === 'company' ? API_ENDPOINTS.COMPANY_AI_RECOMMENDED_NEEDS : API_ENDPOINTS.AI_RECOMMENDED_NEEDS;
  
  const recommendedNeedsState = useApiState<SchoolNeed[]>({
    url: recommendedEndpoint
  });
  const recentProjectsState = useApiState<RecentProject[]>({
    url: API_ENDPOINTS.RECENT_PROJECTS
  });
  const impactStoriesState = useApiState<ImpactStory[]>({
    url: API_ENDPOINTS.IMPACT_STORIES
  });

  // 獲取企業儀表板統計數據
  const fetchCompanyStats = async () => {
    try {
      const data = await apiService.getCompanyDashboardStats();
      setCompanyStats(data as any);
    } catch (err) {
      console.error('獲取企業統計數據時發生錯誤:', err);
    }
  };

  useEffect(() => {
    fetchCompanyStats();
  }, []);

  // 處理贊助功能
  const handleSponsor = (need: SchoolNeed) => {
    setSponsorModal({ isOpen: true, need });
  };

  const handleSponsorConfirm = async (sponsorData: { donation_type: string; description: string }) => {
    if (!sponsorModal.need) return;

    try {
      await apiService.sponsorNeed(sponsorModal.need.id, sponsorData);
      // 可以在這裡添加成功提示
      console.log('贊助成功！');
      setSponsorModal({ isOpen: false, need: null });
    } catch (error) {
      console.error('贊助失敗:', error);
      // 可以在這裡添加錯誤提示
    }
  };

  const handleSponsorClose = () => {
    setSponsorModal({ isOpen: false, need: null });
  };

  // 檢查是否有任何狀態正在載入
  const isLoading = !companyStats || recommendedNeedsState.isLoading || recentProjectsState.isLoading || impactStoriesState.isLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">載入中...</div>
      </div>
    );
  }

  // 轉換 SDG 數據為圖表格式
  const chartData = companyStats?.sdgContributions ? Object.entries(companyStats.sdgContributions).map(([sdg, count]) => ({
    name: `SDG ${sdg}`,
    專案數: count
  })) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '進行中';
      case 'pending':
        return '待開始';
      default:
        return '未知';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 歡迎標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">歡迎回來，陳經理！</h1>
        <p className="text-gray-600 mt-2">以下是您的企業公益貢獻總覽</p>
      </div>

      {/* 標籤頁導航 */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: '總覽', icon: ChartBarIcon },
            { id: 'projects', label: '我的專案', icon: UserGroupIcon },
            { id: 'impact', label: '影響力故事', icon: HeartIcon },
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
              <p className="text-sm font-medium text-blue-700">已完成專案數</p>
              <motion.p 
                className="text-3xl font-bold text-blue-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                {companyStats?.completedProjects || 0}
              </motion.p>
            </div>
            <div className="text-blue-600">
              <motion.svg 
                className="w-10 h-10" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </motion.svg>
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
              <p className="text-sm font-medium text-green-700">總幫助學生人次</p>
              <motion.p 
                className="text-3xl font-bold text-green-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                {companyStats?.studentsHelped || 0}
              </motion.p>
            </div>
            <div className="text-green-600">
              <motion.svg 
                className="w-10 h-10" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </motion.svg>
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
              <p className="text-sm font-medium text-purple-700">累積公益時數</p>
              <motion.p 
                className="text-3xl font-bold text-purple-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                {companyStats?.volunteerHours || 0}
              </motion.p>
            </div>
            <div className="text-purple-600">
              <motion.svg 
                className="w-10 h-10" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </motion.svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 新增數據卡片 */}
      <motion.div 
        className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-indigo-200 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.02, y: -5 }}
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="flex items-center relative z-10">
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-700">總捐贈金額</p>
            <motion.p 
              className="text-3xl font-bold text-indigo-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              NT$ {companyStats?.totalDonation?.toLocaleString() || 0}
            </motion.p>
          </div>
          <div className="text-indigo-600">
            <ChartBarIcon className="w-10 h-10" />
          </div>
        </div>
      </motion.div>

      {/* SDG 貢獻分佈圖表 */}
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">SDG 貢獻分佈</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
            <span>永續發展目標</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              />
              <Legend />
              <Bar 
                dataKey="專案數" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* AI 智慧推薦專案 */}
      <motion.div 
        className="bg-gradient-to-br from-brand-orange/5 to-brand-orange/10 rounded-xl shadow-lg p-6 mt-8 border border-brand-orange/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 智慧推薦專案</h2>
            <p className="text-gray-600">基於您的 ESG 目標和歷史貢獻，為您精選的專案</p>
          </div>
          <div className="flex items-center space-x-2 bg-brand-orange/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-brand-orange">AI 推薦</span>
          </div>
        </div>
        
          {recommendedNeedsState.isLoading ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-flex items-center space-x-3">
              <motion.div
                className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-lg text-gray-600">AI 正在分析您的偏好...</span>
            </div>
          </motion.div>
        ) : recommendedNeedsState.error ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-lg text-red-600">推薦載入失敗，請稍後再試</div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {recommendedNeedsState.data?.map((need, index) => (
              <motion.div
                key={need.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NeedCard 
                  need={need} 
                  progress={Math.floor(Math.random() * 40) + 60} 
                  onSponsor={handleSponsor}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
        </motion.div>
      )}

      {/* 我的專案標籤頁 */}
      {activeTab === 'projects' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">我的專案</h2>
          
          {recentProjectsState.isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">載入專案中...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentProjectsState.data?.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                      <p className="text-gray-600">{project.school}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">進度</span>
                      <span className="text-sm font-semibold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-brand-blue to-brand-orange h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{project.studentsBenefited} 位學生受惠</span>
                    {project.completionDate && (
                      <span>完成於 {project.completionDate}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* 影響力故事標籤頁 */}
      {activeTab === 'impact' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">影響力故事</h2>
          
          {impactStoriesState.isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">載入故事中...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {impactStoriesState.data?.map((story, index) => (
                <motion.div
                  key={story.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={story.imageUrl} 
                      alt={story.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{story.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{story.summary}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{story.schoolName}</span>
                      <span className="text-brand-blue font-semibold">{story.impact?.studentsBenefited || 0} 位學生受惠</span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{story.storyDate}</span>
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
            {/* 效能指標 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">效能指標</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">平均專案時長</span>
                  <span className="font-bold text-lg text-blue-600">{companyStats?.avgProjectDuration || 0} 天</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">專案成功率</span>
                  <span className="font-bold text-lg text-green-600">{companyStats?.successRate || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">總幫助學生</span>
                  <span className="font-bold text-lg text-purple-600">{companyStats?.studentsHelped || 0} 人</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">累積時數</span>
                  <span className="font-bold text-lg text-orange-600">{companyStats?.volunteerHours || 0} 小時</span>
                </div>
              </div>
            </div>

            {/* 快速統計 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">快速統計</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">已完成專案</p>
                      <p className="text-sm text-gray-600">本月完成</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{companyStats?.completedProjects || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">受益學生</p>
                      <p className="text-sm text-gray-600">累積幫助</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{companyStats?.studentsHelped || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StarIcon className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">總捐贈金額</p>
                      <p className="text-sm text-gray-600">累積貢獻</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">NT$ {companyStats?.totalDonation?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 贊助彈窗 */}
      <SponsorModal
        isOpen={sponsorModal.isOpen}
        onClose={handleSponsorClose}
        need={sponsorModal.need}
        onConfirm={handleSponsorConfirm}
      />
    </div>
  );
};

export default CompanyDashboardPage;
