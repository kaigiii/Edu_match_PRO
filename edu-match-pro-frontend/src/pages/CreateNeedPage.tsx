import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { SchoolNeed } from '../types';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../config/api';

interface FormData {
  title: string;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  studentCount: number;
  location: string;
  sdgs: number[];
  description: string;
}

const CreateNeedPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const navigate = useNavigate();
  const [isShaking, setIsShaking] = useState(false);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // 構造請求資料
      const newNeed = {
        title: data.title,
        description: data.description || "",
        category: data.category,
        location: data.location,
        student_count: data.studentCount,
        image_url: "https://images.unsplash.com/photo-1517420532572-4b6a6c57f2f4?q=80&w=1287", // 預設圖片
        urgency: data.urgency,
        sdgs: data.sdgs
      };

      const result = await apiService.createSchoolNeed(newNeed as any);
      
      toast.success('需求已成功提交！');
      navigate('/dashboard/school'); // 跳轉回儀表板
    } catch (error) {
      console.error('提交需求時發生錯誤:', error);
      toast.error(`提交失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  // 表單驗證失敗時的搖動動畫
  const handleFormError = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.h1 
        className="text-3xl font-bold text-gray-900 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        刊登新的資源需求
      </motion.h1>
      
      <motion.form 
        onSubmit={handleSubmit(onSubmit, handleFormError)} 
        className="space-y-6"
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* 1. 需求標題 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            需求標題 *
          </label>
          <input
            type="text"
            id="title"
            {...register("title", { required: "標題為必填項" })}
            className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue ${
              errors.title 
                ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-brand-blue'
            }`}
            placeholder="請輸入需求標題"
          />
          {errors.title && (
            <motion.span 
              className="text-red-500 text-sm flex items-center mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.title.message}
            </motion.span>
          )}
        </motion.div>

        {/* 2. 需求分類 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            需求分類 *
          </label>
          <select
            id="category"
            {...register("category", { required: "請選擇需求分類" })}
            className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue ${
              errors.category 
                ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-brand-blue'
            }`}
          >
            <option value="">請選擇分類</option>
            <option value="硬體設備">硬體設備</option>
            <option value="師資/技能">師資/技能</option>
            <option value="體育器材">體育器材</option>
            <option value="書籍教材">書籍教材</option>
            <option value="其他">其他</option>
          </select>
          {errors.category && (
            <motion.span 
              className="text-red-500 text-sm flex items-center mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.category.message}
            </motion.span>
          )}
        </motion.div>

        {/* 3. 緊急程度 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
            緊急程度 *
          </label>
          <select
            id="urgency"
            {...register("urgency", { required: "請選擇緊急程度" })}
            className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue ${
              errors.urgency 
                ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-brand-blue'
            }`}
          >
            <option value="">請選擇緊急程度</option>
            <option value="high">高緊急</option>
            <option value="medium">中等</option>
            <option value="low">一般</option>
          </select>
          {errors.urgency && (
            <motion.span 
              className="text-red-500 text-sm flex items-center mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.urgency.message}
            </motion.span>
          )}
        </motion.div>

        {/* 4. 受惠學生數 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-2">
            受惠學生數 *
          </label>
          <input
            type="number"
            id="studentCount"
            {...register("studentCount", { 
              required: "受惠學生數為必填項",
              min: { value: 1, message: "受惠學生數至少為1人" }
            })}
            className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue ${
              errors.studentCount 
                ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-brand-blue'
            }`}
            placeholder="請輸入受惠學生數"
          />
          {errors.studentCount && (
            <motion.span 
              className="text-red-500 text-sm flex items-center mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.studentCount.message}
            </motion.span>
          )}
        </motion.div>

        {/* 5. 學校地點 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            學校地點 *
          </label>
          <input
            type="text"
            id="location"
            {...register("location", { required: "學校地點為必填項" })}
            className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue ${
              errors.location 
                ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-brand-blue'
            }`}
            placeholder="例如：花蓮縣、南投縣、台東縣"
          />
          {errors.location && (
            <motion.span 
              className="text-red-500 text-sm flex items-center mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.location.message}
            </motion.span>
          )}
        </motion.div>

        {/* 6. SDGs 永續發展目標 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SDGs 永續發展目標 *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                value={0}
                {...register("sdgs", { required: "請至少選擇一個 SDG 目標" })}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              <span className="text-sm text-gray-700">無</span>
            </label>
            {[
              { value: 1, label: "SDG 1: 消除貧窮" },
              { value: 2, label: "SDG 2: 消除飢餓" },
              { value: 3, label: "SDG 3: 健康與福祉" },
              { value: 4, label: "SDG 4: 優質教育" },
              { value: 5, label: "SDG 5: 性別平等" },
              { value: 6, label: "SDG 6: 潔淨水資源" },
              { value: 7, label: "SDG 7: 可負擔能源" },
              { value: 8, label: "SDG 8: 就業與經濟成長" },
              { value: 9, label: "SDG 9: 工業創新" },
              { value: 10, label: "SDG 10: 減少不平等" },
              { value: 11, label: "SDG 11: 永續城市" },
              { value: 12, label: "SDG 12: 責任消費" },
              { value: 13, label: "SDG 13: 氣候行動" },
              { value: 14, label: "SDG 14: 海洋生態" },
              { value: 15, label: "SDG 15: 陸地生態" },
              { value: 16, label: "SDG 16: 和平正義" },
              { value: 17, label: "SDG 17: 夥伴關係" }
            ].map((sdg) => (
              <label key={sdg.value} className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={sdg.value}
                  {...register("sdgs", { required: "請至少選擇一個 SDG 目標" })}
                  className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-sm text-gray-700">{sdg.label}</span>
              </label>
            ))}
          </div>
          {errors.sdgs && (
            <motion.span 
              className="text-red-500 text-sm flex items-center mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.sdgs.message}
            </motion.span>
          )}
        </motion.div>

        {/* 7. 詳細說明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            詳細說明
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-200 resize-none"
            placeholder="請詳細描述您的需求，包括具體用途、期望效果等..."
          />
        </motion.div>

        {/* 提交按鈕 */}
        <motion.div 
          className="pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 transition-all duration-200 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-brand-blue text-white hover:bg-brand-blue-dark hover:shadow-lg'
            }`}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>提交中...</span>
              </div>
            ) : (
              '提交需求'
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default CreateNeedPage;
