import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NeedCard from '../components/NeedCard';
import SponsorModal from '../components/SponsorModal';
import { useApiState, ApiStateRenderer } from '../hooks/useApiState';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import type { SchoolNeed } from '../types';

const ExploreNeedsPage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sponsorModal, setSponsorModal] = useState<{ isOpen: boolean; need: SchoolNeed | null }>({
    isOpen: false,
    need: null
  });
  
  // 根據用戶角色選擇不同的端點
  const endpoint = userRole === 'company' ? API_ENDPOINTS.COMPANY_NEEDS : API_ENDPOINTS.SCHOOL_NEEDS;
  
  const state = useApiState<SchoolNeed[]>({
    url: endpoint
  });

  // 創建篩選後的列表
  const filteredNeeds = state.data?.filter((need) => {
    // 第一層過濾 (分類)
    const categoryMatch = selectedCategory === '' || need.category === selectedCategory;
    
    // 第二層過濾 (搜尋)
    const searchMatch = searchTerm === '' || 
      need.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      need.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  }) || [];

  // 處理贊助功能
  const handleSponsor = (need: SchoolNeed) => {
    setSponsorModal({ isOpen: true, need });
  };

  const handleSponsorConfirm = async (sponsorData: { donation_type: string; description: string }) => {
    if (!sponsorModal.need) return;

    try {
      await apiService.sponsorNeed(sponsorModal.need.id, sponsorData);
      console.log('贊助成功！');
      setSponsorModal({ isOpen: false, need: null });
      
      // 跳轉到我的捐贈頁面
      navigate('/dashboard/my-donations');
    } catch (error) {
      console.error('贊助失敗:', error);
      // 可以在這裡添加錯誤提示
    }
  };

  const handleSponsorClose = () => {
    setSponsorModal({ isOpen: false, need: null });
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">讀取中...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-red-600">資料載入失敗...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {userRole === 'company' ? '探索所有需求（包括模擬需求）' : '探索所有需求'}
      </h1>
      
      {/* 搜尋和篩選控制區 */}
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="搜尋學校名稱或需求標題..."
          className="flex-grow border rounded-md px-4 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border rounded-md px-4 py-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">全部分類</option>
          <option value="硬體設備">硬體設備</option>
          <option value="師資/技能">師資/技能</option>
          <option value="體育器材">體育器材</option>
        </select>
      </div>

      {/* 結果顯示 */}
      {filteredNeeds.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">找不到符合條件的需求。</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNeeds.map((need) => (
            <NeedCard 
              key={need.id} 
              need={need} 
              onSponsor={handleSponsor}
            />
          ))}
        </div>
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

export default ExploreNeedsPage;
