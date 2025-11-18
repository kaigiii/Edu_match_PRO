/**
 * 圖片載入和優化工具
 */

// 獲取基礎路徑
const getBasePath = (): string => {
  return import.meta.env.PROD ? '/Edu_match_PRO' : '';
};

/**
 * 生成完整的圖片路徑
 */
export const getImagePath = (path: string): string => {
  const basePath = getBasePath();
  return `${basePath}${path}`;
};

/**
 * 獲取影片路徑
 */
export const getVideoPath = (path: string): string => {
  return getImagePath(path);
};

/**
 * 獲取 SVG 路徑
 */
export const getSvgPath = (path: string): string => {
  return getImagePath(path);
};

/**
 * 生成影響力故事背景牆圖片路徑
 */
export const getImpactStoryImagePath = (index: number): string => {
  const paddedIndex = String(index).padStart(2, '0');
  return getImagePath(`/images/impact-stories/background-wall/${paddedIndex}.jpg`);
};

/**
 * 生成精選故事圖片路徑
 */
export const getFeaturedStoryImagePath = (index: number): string => {
  const paddedIndex = String(index).padStart(2, '0');
  return getImagePath(`/images/impact-stories/featured/featured-${paddedIndex}.jpg`);
};

/**
 * 根據類別獲取備用圖片路徑
 */
export const getFallbackImageByCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    '硬體設備': '/images/impact-stories/background-wall/01.jpg',
    '師資/技能': '/images/impact-stories/background-wall/05.jpg',
    '體育器材': '/images/impact-stories/background-wall/09.jpg',
    '教學用品': '/images/impact-stories/background-wall/02.jpg',
    '圖書資源': '/images/impact-stories/background-wall/03.jpg',
    '音樂器材': '/images/impact-stories/background-wall/04.jpg',
    '科學器材': '/images/impact-stories/background-wall/06.jpg',
    '經費需求': '/images/impact-stories/background-wall/07.jpg',
  };
  
  const imagePath = categoryMap[category] || '/images/impact-stories/background-wall/01.jpg';
  return getImagePath(imagePath);
};



// 預設的影響力故事圖片配置
export const IMPACT_STORY_IMAGES = {
  BACKGROUND_WALL_COUNT: 16,
  FEATURED_COUNT: 5,
  BACKGROUND_WALL_PATH: getImagePath('/images/impact-stories/background-wall'),
  FEATURED_PATH: getImagePath('/images/impact-stories/featured')
} as const;
