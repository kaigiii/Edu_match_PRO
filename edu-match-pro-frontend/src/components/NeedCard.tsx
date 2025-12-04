import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFallbackImageByCategory } from '../utils/imageUtils';
import { ANIMATIONS, ANIMATION_DELAYS } from '../config/animations';
import type { SchoolNeed } from '../types';

interface NeedCardProps {
  need: SchoolNeed;
  variant?: 'public' | 'admin';
  onDelete?: (id: string) => void;
  onSponsor?: (need: SchoolNeed) => void; // 新增贊助回調
  progress?: number; // 新增進度 prop
}

const NeedCard = ({ need, variant = 'public', onDelete, onSponsor, progress = 75 }: NeedCardProps) => {
  const { userRole } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 檢查 need.id 是否存在
  if (!need.id || need.id === 'undefined') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
        <div className="text-red-600 text-center">
          <p className="text-sm">無效的需求數據</p>
          <p className="text-xs text-gray-500 mt-1">缺少有效的 ID</p>
        </div>
      </div>
    );
  }

  // 處理圖片載入錯誤
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // 使用統一的圖片路徑處理
  const getFallbackImage = (category: string) => {
    return getFallbackImageByCategory(category);
  };

  // 緊急程度樣式配置
  const getUrgencyConfig = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high':
        return {
          color: 'bg-system-red',
          textColor: 'text-system-red',
          bgColor: 'bg-red-50',
          label: '緊急'
        };
      case 'medium':
        return {
          color: 'bg-brand-orange',
          textColor: 'text-brand-orange',
          bgColor: 'bg-[#FFF3E0]',
          label: '中等'
        };
      case 'low':
        return {
          color: 'bg-brand-green',
          textColor: 'text-brand-green',
          bgColor: 'bg-[#E9F7EA]',
          label: '一般'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(need.urgency);

  return (
    <motion.div 
      className="rounded-2xl border border-neutral-100 shadow-soft-lg bg-white overflow-hidden"
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={ANIMATIONS.button.transition}
      initial={ANIMATIONS.card.initial}
      animate={ANIMATIONS.card.animate}
    >
      {/* Image */}
      <div className="h-56 overflow-hidden relative">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {!imageError ? (
          <img 
            src={need.image_url} 
            alt={need.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        ) : (
          <img 
            src={getFallbackImage(need.category)} 
            alt={need.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={() => {
              // 如果備用圖片也載入失敗，顯示預設背景
              setImageError(true);
            }}
          />
        )}
        
        {/* 如果所有圖片都載入失敗，顯示預設背景 */}
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-sm font-medium">{need.category}</div>
            </div>
          </div>
        )}
        
        {/* 緊急程度標籤 */}
        <motion.div 
          className={`absolute top-4 right-4 ${urgencyConfig.bgColor} ${urgencyConfig.textColor} px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: ANIMATION_DELAYS.card, duration: 0.3 }}
        >
          {urgencyConfig.label}
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Category Tag */}
        <motion.span 
          className="inline-block bg-brand-blue-light text-brand-blue text-sm px-3 py-1 rounded-full font-medium"
          initial={ANIMATIONS.listItem.initial}
          animate={ANIMATIONS.listItem.animate}
          transition={{ delay: ANIMATION_DELAYS.content, duration: 0.3 }}
        >
          {need.category}
        </motion.span>

        {/* Title */}
        <motion.h3 
          className="font-bold text-lg sm:text-xl line-clamp-2 text-neutral-900 leading-tight drop-shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ANIMATION_DELAYS.content + 0.1, duration: 0.3 }}
        >
          {need.title}
        </motion.h3>

        {/* School Name and Location */}
        <motion.div 
          className="flex items-center text-neutral-500"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ANIMATION_DELAYS.content + 0.2, duration: 0.3 }}
        >
          <svg className="w-5 h-5 mr-2 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold text-neutral-700">{need.schoolName || '學校'} - {need.location}</span>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-neutral-700">進度</span>
            <span className="text-sm font-bold text-brand-orange">{progress}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-brand-blue via-brand-blue/90 to-brand-orange h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* SDG Indicators */}
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ANIMATION_DELAYS.content + 0.3, duration: 0.3 }}
        >
          <span className="text-sm font-semibold text-neutral-700 mr-2">SDG 指標:</span>
          <div className="flex space-x-1">
            {need.sdgs.map((sdg, index) => (
              <motion.span 
                key={sdg} 
                className="bg-brand-green text-white text-xs px-2 py-1 rounded-full font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: ANIMATION_DELAYS.content + 0.4 + index * ANIMATION_DELAYS.stagger, duration: 0.2 }}
              >
                SDG {sdg}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="pt-2 border-t border-neutral-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ANIMATION_DELAYS.footer, duration: 0.3 }}
        >
          {variant === 'public' ? (
            <div className="flex items-center justify-between">
              {/* 學生受惠數量 */}
              <div className="text-sm text-neutral-600">
                <span className="font-bold text-neutral-900">{need.student_count}</span> 位學生受惠
              </div>
              
              {/* 按鈕區域 */}
              <div className="flex items-center space-x-4">
                <motion.div whileHover={ANIMATIONS.button.hover} whileTap={ANIMATIONS.button.tap}>
                  <Link 
                    to={`/needs/${need.id}`}
                    className="text-sm text-brand-blue font-bold hover:text-brand-blue-dark hover:underline transition-colors inline-flex items-center"
                  >
                    查看詳情
                    <span className="ml-1">→</span>
                  </Link>
                </motion.div>

                {userRole === 'company' && (
                  <motion.div whileHover={ANIMATIONS.button.hover} whileTap={ANIMATIONS.button.tap}>
                    <button
                      onClick={() => onSponsor?.(need)}
                      className="text-sm text-brand-blue font-bold hover:text-brand-blue-dark hover:underline transition-colors inline-flex items-center"
                    >
                      加入計劃
                      <span className="ml-1">+</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end">
              <div className="flex space-x-3">
                <motion.div whileHover={ANIMATIONS.button.hover} whileTap={ANIMATIONS.button.tap}>
                  <Link 
                    to={`/dashboard/edit-need/${need.id}`}
                    className="inline-flex items-center text-sm text-brand-blue font-medium hover:text-brand-blue-dark bg-brand-blue-light px-4 py-2 rounded-lg hover:bg-brand-blue-light/80 transition-colors"
                  >
                    編輯
                  </Link>
                </motion.div>
                <motion.div whileHover={ANIMATIONS.button.hover} whileTap={ANIMATIONS.button.tap}>
                  <button 
                    onClick={() => onDelete?.(need.id)}
                    className="inline-flex items-center text-sm text-red-600 font-medium hover:text-red-600/80 bg-red-100 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    刪除
                  </button>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NeedCard;
