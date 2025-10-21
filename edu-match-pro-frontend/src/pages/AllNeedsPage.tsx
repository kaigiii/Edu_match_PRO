import { useState } from 'react';
import { motion } from 'framer-motion';
import NeedCard from '../components/NeedCard';
import { useApiState, ApiStateRenderer } from '../hooks/useApiState';
import { API_ENDPOINTS } from '../config/api';
import type { SchoolNeed } from '../types';

const AllNeedsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 使用統一的 API Hook
  const state = useApiState<SchoolNeed[]>({
    url: API_ENDPOINTS.SCHOOL_NEEDS
  });

  // 過濾數據
  const filteredNeeds = state.data?.filter(need => {
    const matchesSearch = need.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         need.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         need.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || need.category === selectedCategory;
    const matchesUrgency = !selectedUrgency || need.urgency === selectedUrgency;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  }) || [];

  const categories = ['硬體設備', '師資/技能', '體育器材', '教學用品', '圖書資源', '實驗器材', '音樂設備'];
  const urgencyLevels = ['high', 'medium', 'low'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              學校需求列表
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
              探索全台學校的實際需求，幫助資源更有效率地被媒合與運用
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white mt-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-medium">📚 教育資源</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-medium">🤝 資源媒合</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-medium">💡 創新教育</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">立即探索</h2>
          <p className="text-gray-600">用搜尋與篩選快速找到你關注的需求</p>
        </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜尋框 */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋需求、學校名稱或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 篩選按鈕 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showFilters ? '隱藏篩選' : '顯示篩選'}
          </button>
        </div>

        {/* 篩選選項 */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">類別</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">所有類別</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">緊急程度</label>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">所有程度</option>
                {urgencyLevels.map(level => (
                  <option key={level} value={level}>
                    {level === 'high' ? '高' : level === 'medium' ? '中' : '低'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 結果統計 */}
      <div className="mb-6">
        <p className="text-gray-600">
          找到 <span className="font-semibold text-blue-600">{filteredNeeds.length}</span> 個需求
        </p>
      </div>

      {/* 需求列表 */}
      <ApiStateRenderer state={state}>
        {(needs) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeeds.map((need) => (
              <NeedCard key={need.id} need={need} />
            ))}
          </div>
        )}
      </ApiStateRenderer>

      {/* 無結果提示 */}
      {state.data && filteredNeeds.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到符合條件的需求</h3>
          <p className="text-gray-500">請嘗試調整搜尋條件或篩選選項</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default AllNeedsPage;