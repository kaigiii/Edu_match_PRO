import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApiState, ApiStateRenderer } from '../hooks/useApiState';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import SponsorModal from '../components/SponsorModal';
import apiService from '../services/apiService';
import type { SchoolNeed } from '../types';

const NeedDetailPage = () => {
  const { needId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [sponsorModal, setSponsorModal] = useState<{ isOpen: boolean; need: SchoolNeed | null }>({
    isOpen: false,
    need: null
  });
  
  // 檢查 needId 是否存在
  if (!needId || needId === 'undefined') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">無效的需求 ID</div>
          <div className="text-sm text-gray-500 mb-4">請檢查 URL 是否正確</div>
        </div>
      </div>
    );
  }
  
  const state = useApiState<SchoolNeed>({
    url: API_ENDPOINTS.SCHOOL_NEEDS_BY_ID(needId)
  });

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
    }
  };

  const handleSponsorClose = () => {
    setSponsorModal({ isOpen: false, need: null });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ApiStateRenderer state={state}>
        {(need) => (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* 圖片區域 */}
            <div className="relative h-64 md:h-80 bg-gray-100">
              {need.image_url ? (
                <img
                  src={need.image_url}
                  alt={need.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>暫無圖片</p>
                  </div>
                </div>
              )}
              
              {/* 緊急程度標籤 */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  need.urgency === 'high' ? 'bg-red-100 text-red-800' :
                  need.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {need.urgency === 'high' ? '高緊急' : need.urgency === 'medium' ? '中緊急' : '低緊急'}
                </span>
              </div>
            </div>

            {/* 內容區域 */}
            <div className="p-6 md:p-8">
              {/* 標題和學校 */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {need.title}
                </h1>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">{need.schoolName}</span>
                  <span className="mx-2">•</span>
                  <span>{need.location}</span>
                </div>
              </div>

              {/* 基本資訊 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="font-medium text-gray-900">受益學生</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{need.student_count} 人</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium text-gray-900">需求類別</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">{need.category}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-900">SDGs 目標</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {need.sdgs.map((sdg) => (
                      <span key={sdg} className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">
                        SDG {sdg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 詳細描述 */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">需求描述</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {need.description}
                  </p>
                </div>
              </div>

              {/* 行動按鈕 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {userRole === 'company' ? (
                  <button 
                    onClick={() => handleSponsor(need)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      加入計劃
                    </span>
                  </button>
                ) : (
                  <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    立即捐助
                  </button>
                )}
                <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  分享需求
                </button>
                <button className="flex-1 bg-green-100 text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors">
                  聯繫學校
                </button>
              </div>
            </div>
          </div>
        )}
      </ApiStateRenderer>

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

export default NeedDetailPage;