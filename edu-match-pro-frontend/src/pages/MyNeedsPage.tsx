import { useApi } from '../hooks/useApi';
import NeedCard from '../components/NeedCard';
import { toast } from 'react-toastify';
import type { SchoolNeed } from '../types';

const MyNeedsPage = () => {
  const { data: needs, isLoading, error, updateData: setNeeds } = useApi<SchoolNeed[]>('http://localhost:3001/school_needs');

  const executeDelete = async (needId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/school_needs/${needId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 更新前端 state 來立即反映刪除操作
        setNeeds(needs?.filter(need => need.id !== needId) || []);
        toast.success('刪除成功！');
      } else {
        toast.error('刪除失敗，請稍後再試');
      }
    } catch (error) {
      console.error('刪除需求時發生錯誤:', error);
      toast.error('刪除失敗，請稍後再試');
    }
  };

  const handleDelete = (needId: string) => {
    toast.warn(
      ({ closeToast }) => (
        <div className="flex flex-col space-y-3">
          <div className="text-sm font-medium text-gray-900">
            您確定要刪除這項需求嗎？
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                closeToast();
                executeDelete(needId);
              }}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              確定
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center"
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">讀取中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-red-600">資料載入失敗...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">管理我的需求</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {needs?.map((need) => (
          <NeedCard 
            key={need.id} 
            need={need} 
            variant="admin"
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MyNeedsPage;
