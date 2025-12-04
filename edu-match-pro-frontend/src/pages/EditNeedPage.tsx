import React, { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useApiState, ApiStateRenderer } from '../hooks/useApiState';
import { API_ENDPOINTS } from '../config/api';
import apiService from '../services/apiService';
import type { SchoolNeed } from '../types';

interface FormData {
  title: string;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  studentCount: number;
  location: string;
  sdgs: number[];
  description: string;
}

const EditNeedPage: React.FC = () => {
  const { needId } = useParams<{ needId: string }>();
  const navigate = useNavigate();
  
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
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control } = useForm<FormData>();

  // 當資料載入完成後，使用 reset 函式填充表單
  useEffect(() => {
    if (state.data) {
      reset({
        title: state.data.title,
        category: state.data.category,
        urgency: state.data.urgency,
        studentCount: state.data.student_count,
        location: state.data.location,
        sdgs: state.data.sdgs || [],
        description: state.data.description,
      });
      
      // 特別處理 SDGs 複選框的默認值
      if (state.data.sdgs && state.data.sdgs.length > 0) {
        setValue('sdgs', state.data.sdgs);
      }
    }
  }, [state.data, reset, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const updateData = {
        title: data.title,
        category: data.category,
        urgency: data.urgency,
        student_count: data.studentCount,
        location: data.location,
        sdgs: data.sdgs,
        description: data.description,
      };

      const response = await apiService.updateSchoolNeed(String(needId), updateData);
      if (response) {
        toast.success('需求更新成功！');
        navigate('/dashboard/my-needs');
      } else {
        throw new Error('更新失敗');
      }
    } catch (error) {
      console.error('更新需求時發生錯誤:', error);
      toast.error('更新需求失敗，請稍後再試');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">編輯需求</h1>
        <p className="text-gray-600">修改您的學校需求資訊</p>
      </div>

      <ApiStateRenderer state={state}>
        {(need) => (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 1. 需求標題 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  需求標題 *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: '請輸入需求標題' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="請輸入需求標題"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* 2. 需求類別 */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  需求類別 *
                </label>
                <select
                  id="category"
                  {...register('category', { required: '請選擇需求類別' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">請選擇類別</option>
                  <option value="硬體設備">硬體設備</option>
                  <option value="師資/技能">師資/技能</option>
                  <option value="體育器材">體育器材</option>
                  <option value="教學用品">教學用品</option>
                  <option value="圖書資源">圖書資源</option>
                  <option value="實驗器材">實驗器材</option>
                  <option value="音樂設備">音樂設備</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* 3. 緊急程度 */}
              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                  緊急程度 *
                </label>
                <select
                  id="urgency"
                  {...register('urgency', { required: '請選擇緊急程度' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">請選擇緊急程度</option>
                  <option value="high">高緊急</option>
                  <option value="medium">中等</option>
                  <option value="low">一般</option>
                </select>
                {errors.urgency && (
                  <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>
                )}
              </div>

              {/* 4. 受惠學生數 */}
              <div>
                <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-2">
                  受惠學生數 *
                </label>
                <input
                  type="number"
                  id="studentCount"
                  {...register('studentCount', { 
                    required: '請輸入學生數量',
                    min: { value: 1, message: '學生數量必須大於 0' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="請輸入受惠學生數"
                />
                {errors.studentCount && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentCount.message}</p>
                )}
              </div>

              {/* 5. 學校地點 */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  學校地點 *
                </label>
                <input
                  type="text"
                  id="location"
                  {...register('location', { required: '請輸入學校地點' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：花蓮縣、南投縣、台東縣"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* 6. SDGs 永續發展目標 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SDGs 永續發展目標 *
                </label>
                <Controller
                  name="sdgs"
                  control={control}
                  rules={{ required: '請至少選擇一個 SDG 目標' }}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={0}
                          checked={field.value?.includes(0) || false}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            const currentValues = field.value || [];
                            if (e.target.checked) {
                              field.onChange([...currentValues, value]);
                            } else {
                              field.onChange(currentValues.filter((v: number) => v !== value));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                            checked={field.value?.includes(sdg.value) || false}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              const currentValues = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...currentValues, value]);
                              } else {
                                field.onChange(currentValues.filter((v: number) => v !== value));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{sdg.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.sdgs && (
                  <p className="mt-1 text-sm text-red-600">{errors.sdgs.message}</p>
                )}
              </div>

              {/* 7. 詳細說明 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  詳細說明
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="請詳細描述您的需求，包括具體用途、期望效果等..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* 按鈕 */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  更新需求
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/my-needs')}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}
      </ApiStateRenderer>
    </div>
  );
};

export default EditNeedPage;