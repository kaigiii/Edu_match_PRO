import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useApi } from '../hooks/useApi';
import type { SchoolNeed } from '../types';

interface FormData {
  title: string;
  category: string;
  studentCount: number;
  location: string;
  description: string;
}

const EditNeedPage: React.FC = () => {
  const { needId } = useParams<{ needId: string }>();
  const navigate = useNavigate();
  const { data: need, isLoading, error, isUsingFallback } = useApi<SchoolNeed>(`http://localhost:3001/school_needs/${needId}`);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  // 當資料載入完成後，使用 reset 函式填充表單
  useEffect(() => {
    if (need) {
      reset({
        title: need.title,
        category: need.category,
        studentCount: need.studentCount,
        location: need.location,
        description: ''
      });
    }
  }, [need, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const { updateNeed } = await import('../utils/api');
      await updateNeed(needId!, data);
      
      toast.success('需求更新成功！');
      navigate('/dashboard/my-needs');
    } catch (error) {
      console.error('更新需求時發生錯誤:', error);
      toast.error('更新失敗，請稍後再試');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="text-lg">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">編輯資源需求</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 需求標題 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            需求標題 *
          </label>
          <input
            type="text"
            id="title"
            {...register("title", { required: "標題為必填項" })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入需求標題"
          />
          {errors.title && (
            <span className="text-red-500 text-sm">{errors.title.message}</span>
          )}
        </div>

        {/* 需求分類 */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            需求分類 *
          </label>
          <select
            id="category"
            {...register("category", { required: "請選擇需求分類" })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">請選擇分類</option>
            <option value="硬體設備">硬體設備</option>
            <option value="師資/技能">師資/技能</option>
            <option value="體育器材">體育器材</option>
            <option value="書籍教材">書籍教材</option>
            <option value="其他">其他</option>
          </select>
          {errors.category && (
            <span className="text-red-500 text-sm">{errors.category.message}</span>
          )}
        </div>

        {/* 受惠學生數 */}
        <div>
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請輸入受惠學生數"
          />
          {errors.studentCount && (
            <span className="text-red-500 text-sm">{errors.studentCount.message}</span>
          )}
        </div>

        {/* 學校地點 */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            學校地點 *
          </label>
          <input
            type="text"
            id="location"
            {...register("location", { required: "學校地點為必填項" })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="例如：花蓮縣、南投縣、台東縣"
          />
          {errors.location && (
            <span className="text-red-500 text-sm">{errors.location.message}</span>
          )}
        </div>

        {/* 詳細說明 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            詳細說明
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="請詳細描述您的需求，包括具體用途、期望效果等..."
          />
        </div>

        {/* 提交按鈕 */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            更新需求
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditNeedPage;
