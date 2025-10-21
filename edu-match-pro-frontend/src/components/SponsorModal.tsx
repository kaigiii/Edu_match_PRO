import { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import type { SchoolNeed } from '../types';

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  need: SchoolNeed | null;
  onConfirm: (sponsorData: SponsorData) => void;
}

interface SponsorData {
  donation_type: string;
  description: string;
}

const SponsorModal = ({ isOpen, onClose, need, onConfirm }: SponsorModalProps) => {
  const [donationType, setDonationType] = useState('經費');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const donationTypes = [
    { value: '經費', label: '💰 經費贊助', description: '提供資金支持' },
    { value: '物資', label: '📦 物資捐贈', description: '提供實體物品' },
    { value: '師資', label: '👨‍🏫 師資支援', description: '提供專業指導' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!need) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        donation_type: donationType,
        description: description || `${donationType}贊助：${need.title}`
      });
      onClose();
    } catch (error) {
      console.error('贊助失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!need) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleClose}
          />
          
          {/* 彈窗內容 */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* 關閉按鈕 */}
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* 標題區域 */}
            <div className="p-6 pb-4">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">加入計劃</h2>
                  <p className="text-sm text-gray-600">將此專案加入您的企業計劃中</p>
                </div>
              </div>
              
              {/* 需求資訊 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{need.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{need.schoolName} - {need.location}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">
                    {need.category}
                  </span>
                  <span>受益學生 {need.student_count} 人</span>
                </div>
              </div>
            </div>

            {/* 表單內容 */}
            <form onSubmit={handleSubmit} className="px-6 pb-6">
              {/* 計劃類型選擇 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  選擇計劃類型
                </label>
                <div className="space-y-2">
                  {donationTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        donationType === type.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="donationType"
                        value={type.value}
                        checked={donationType === type.value}
                        onChange={(e) => setDonationType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                      {donationType === type.value && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* 計劃說明 */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  計劃說明（選填）
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="請描述您的計劃內容或特殊要求..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {description.length}/200 字
                </div>
              </div>

              {/* 按鈕區域 */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      處理中...
                    </div>
                  ) : (
                    '加入計劃'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default SponsorModal;
