import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

interface TaiwanMapProps {
  highlightCounties?: string[];
  onCountyClick?: (countyId: string) => void;
  showAnimations?: boolean;
  countyRefs?: React.RefObject<SVGGElement>[];
}

export interface TaiwanMapRef {
  getCountyElements: () => SVGGElement[];
  getCenterLightElement: () => SVGGElement | null;
}

export const TaiwanMap = forwardRef<TaiwanMapRef, TaiwanMapProps>(({ 
  highlightCounties = [], 
  onCountyClick,
  showAnimations = true,
  countyRefs = []
}, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 優化的縣市元素獲取 - 現在返回圖片元素
  const getCountyElements = useCallback(() => {
    if (!mapRef.current) return [];
    
    const img = mapRef.current.querySelector('img');
    if (img) {
      console.log('找到地圖圖片元素');
      return [img as unknown as SVGGElement];
    }
    
    console.log('未找到地圖圖片元素');
    return [];
  }, []);

  const getCenterLightElement = useCallback(() => {
    if (!mapRef.current) return null;
    return mapRef.current.querySelector('#center-light') as SVGGElement | null;
  }, []);

  // 優化的樣式設置函數 - 處理 JPG 圖片
  const setupMapStyles = useCallback(() => {
    if (!mapRef.current) return;
    
    const img = mapRef.current.querySelector('img');
    if (!img) {
      console.error('找不到圖片元素');
      return;
    }

    // 設置圖片樣式
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.position = 'relative';
    img.style.cursor = 'pointer';
    img.style.transition = 'all 0.3s ease';
    img.style.filter = 'brightness(1.1) contrast(1.1)';
    
    console.log('地圖圖片樣式設置完成');
  }, []);

  // 暴露方法給父組件
  useImperativeHandle(ref, () => ({
    getCountyElements,
    getCenterLightElement
  }), [getCountyElements, getCenterLightElement]);

  // 優化的地圖載入邏輯 - 使用 JPG 圖片
  const loadMap = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!mapRef.current) return;

      console.log('開始載入地圖...');

      // 創建圖片元素
      const img = new Image();
      
      img.onload = () => {
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
          mapRef.current.appendChild(img);
          setupMapStyles();
          console.log('地圖圖片載入成功');
        }
        setIsLoading(false);
      };
      
      img.onerror = () => {
        console.error('地圖圖片載入失敗');
        setError('地圖載入失敗，請重新整理頁面');
        setIsLoading(false);
      };
      
      // 設置圖片屬性
      img.src = `${import.meta.env.PROD ? '/Edu_match_PRO' : ''}/images/taiwan-map.png`;
      img.alt = '台灣地圖';
      img.className = 'w-full h-full object-contain';
      img.style.cursor = 'pointer';

    } catch (err) {
      console.error('載入地圖時發生錯誤:', err);
      setError('地圖載入失敗，請重新整理頁面');
      setIsLoading(false);
    }
  }, [setupMapStyles]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-transparent rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <motion.div
            className="flex flex-col items-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-sm text-gray-600">載入地圖中...</span>
          </motion.div>
        </div>
      )}
      
      <motion.div
        ref={mapRef}
        className="w-full h-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
    </div>
  );
});

TaiwanMap.displayName = 'TaiwanMap';

export default TaiwanMap;