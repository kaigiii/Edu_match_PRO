import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  HeartIcon,
  UsersIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useApiState, ApiStateRenderer } from '../hooks/useApiState';
import { API_ENDPOINTS } from '../config/api';
import StoryCard from '../components/StoryCard';
import type { ImpactStory } from '../types';

const ImpactStoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStory, setSelectedStory] = useState<ImpactStory | null>(null);

  const state = useApiState<ImpactStory[]>({
  url: API_ENDPOINTS.IMPACT_STORIES
  });

  // 篩選和搜索邏輯
  const filteredStories = useMemo(() => {
    if (!state.data) return [];
    
    return state.data.filter((story) => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           story.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           story.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           story.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCompany = !selectedCompany || story.companyName === selectedCompany;
      const matchesSchool = !selectedSchool || story.schoolName === selectedSchool;
      
      return matchesSearch && matchesCompany && matchesSchool;
    });
  }, [state.data, searchTerm, selectedCompany, selectedSchool]);

  // 獲取唯一的公司和學校列表
  const companies = useMemo(() => {
    if (!state.data) return [];
    return [...new Set(state.data.map(story => story.companyName))].sort();
  }, [state.data]);

  const schools = useMemo(() => {
    if (!state.data) return [];
    return [...new Set(state.data.map(story => story.schoolName))].sort();
  }, [state.data]);

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-rose-500">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-amber-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              影響力故事牆
            </h1>
            <p className="text-xl sm:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto">
              見證企業與學校攜手創造的溫暖故事，每一個善舉都點亮了教育的未來
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <HeartIcon className="h-5 w-5" />
                <span className="text-sm font-medium">溫暖故事</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <UsersIcon className="h-5 w-5" />
                <span className="text-sm font-medium">愛心企業</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <AcademicCapIcon className="h-5 w-5" />
                <span className="text-sm font-medium">教育夥伴</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋故事、學校或企業..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="font-medium">篩選</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                    企業
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">全部企業</option>
                    {companies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                    學校
                  </label>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">全部學校</option>
                    {schools.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCompany('');
                    setSelectedSchool('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  清除篩選
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            找到 <span className="font-semibold text-blue-600">{filteredStories.length}</span> 個故事
            {searchTerm && (
              <span className="ml-2 text-sm">
                (搜尋: "{searchTerm}")
              </span>
            )}
          </p>
        </motion.div>

        {/* Stories Grid */}
        <ApiStateRenderer state={state}>
          {(stories) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StoryCard story={story} onView={(s) => setSelectedStory(s)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </ApiStateRenderer>

        {/* Empty State */}
        {filteredStories.length === 0 && state.data && state.data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">沒有找到相關故事</h3>
            <p className="text-gray-500 mb-6">請嘗試調整搜尋條件或篩選器</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCompany('');
                setSelectedSchool('');
                setShowFilters(false);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              清除所有篩選
            </button>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedStory(null)} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white max-w-3xl w-[90%] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative h-56 bg-gray-100">
              <img
                src={selectedStory.imageUrl}
                alt={selectedStory.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 bg-black/40 text-white rounded-full px-3 py-1 text-sm hover:bg-black/50"
              >
                關閉
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedStory.title}</h3>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {selectedStory.summary}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">企業</div>
                  <div className="font-medium text-gray-800">{selectedStory.companyName}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">學校</div>
                  <div className="font-medium text-gray-800">{selectedStory.schoolName}</div>
                </div>
              </div>

              {selectedStory.impact && (
                <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="text-sm text-gray-700">
                    受益學生：<span className="font-semibold">{selectedStory.impact.studentsBenefited}</span>
                  </div>
                  {selectedStory.impact.equipmentDonated && (
                    <div className="text-sm text-gray-700 mt-1">
                      捐贈設備：{selectedStory.impact.equipmentDonated}
                    </div>
                  )}
                  {selectedStory.impact.duration && (
                    <div className="text-sm text-gray-700 mt-1">
                      專案期間：{selectedStory.impact.duration}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ImpactStoriesPage;
