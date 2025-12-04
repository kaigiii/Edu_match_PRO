import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import TaiwanMap, { TaiwanMapRef } from '../../components/TaiwanMap';
import { HomePageAnimations } from './animation.config';
import { apiService } from '../../services/apiService';
import { PlatformStats } from '../../types';

// 註冊 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger);

// 手動設定 10 個光點位置（使用比例定位，範圍 0-100%）
const lightPositions = [
  { id: 1, x: 65, y: 43, status: 'urgent' },   // 台東縣 (15%, 13%)
  { id: 2, x: 65, y: 40, status: 'normal' },   // 花蓮縣 (25%, 10%)
  { id: 3, x: 69, y: 53, status: 'urgent' },   // 屏東縣 (19%, 33%)
  { id: 4, x: 68, y: 65, status: 'normal' },   // 南投縣 (38%, 25%)
  { id: 5, x: 55, y: 70, status: 'normal' },   // 嘉義縣 (35%, 30%)
  { id: 6, x: 73, y: 77, status: 'urgent' },   // 新竹縣 (23%, 17%)
  { id: 7, x: 78, y: 40, status: 'normal' },   // 苗栗縣 (28%, 20%)
  { id: 8, x: 54, y: 53, status: 'normal' },   // 宜蘭縣 (44%, 13%)
  { id: 9, x: 81, y: 43, status: 'urgent' },   // 高雄市 (31%, 33%)
  { id: 10, x: 80, y: 70, status: 'normal' }   // 台中市 (40%, 20%)
];

const MapSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const taiwanMapRef = useRef<TaiwanMapRef>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  // 移除學校選擇功能，只顯示統計數據
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // 處理開始配對按鈕點擊
  const handleStartMatching = () => {
    navigate('/needs');
  };

  // 獲取平台統計數據
  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        setIsLoadingStats(true);
        const stats = await apiService.getPlatformStats();
        setPlatformStats(stats);
      } catch (error) {
        console.error('獲取平台統計數據失敗:', error);
        // 不設置任何默認值，保持為 null
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchPlatformStats();
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current || !titleRef.current || !descriptionRef.current || !mapRef.current || !statsRef.current) return;

    // 設置初始狀態
    gsap.set([titleRef.current, descriptionRef.current], { opacity: 0, y: 30 });
    gsap.set(mapRef.current, { opacity: 0, scale: 0.9 });
    gsap.set(statsRef.current, { opacity: 0, y: 20 });

    // 創建滾動動畫時間軸
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        // 提早觸發並在到達時立即播放動畫（移除 scrub 以避免隨滾動慢慢推進）
        start: "top 85%",
        end: "bottom 30%",
        scrub: false,
        toggleActions: "play none none reverse"
      }
    });

    // 標題和描述淡入（立即播放，減短時間讓視覺回饋更快）
    tl.to([titleRef.current, descriptionRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, 0);

    // 地圖淡入 - 提前開始以便視覺上更接近標題出現
    tl.to(mapRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "power2.out"
    }, 0.05);

    // 移除光點 GSAP 動畫，光點直接顯示

    // 統計數據淡入 - 與地圖幾乎同時出現，讓彈出元素不會延遲
    tl.to(statsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, 0.05);

    // 清理函數
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === sectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen relative py-20"
      style={{
        backgroundImage: `url("/images/bg-1.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* 標題區域 */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            連接台灣的
            <span className="text-white drop-shadow-2xl">
              每一個角落
            </span>
          </motion.h2>

          <motion.p
            ref={descriptionRef}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white max-w-3xl lg:max-w-4xl mx-auto leading-relaxed drop-shadow-lg px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            透過精準的資源配對，我們正在點亮台灣偏鄉教育的未來，
            <br />
            讓每一份善意都能到達最需要的地方。
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* 左側：台灣地圖 */}
          <div ref={mapRef} className="relative w-full order-2 lg:order-1">
            <div className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] w-full flex items-start justify-center overflow-hidden pt-4 sm:pt-6 lg:pt-8">
              <div className="w-full h-full relative flex items-center justify-center">
                <TaiwanMap
                  ref={taiwanMapRef}
                  showAnimations={true}
                  highlightCounties={['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市']}
                  onCountyClick={(countyId) => {
                    console.log('點擊縣市:', countyId);
                  }}
                />

                {/* 光點標記 */}
                {lightPositions.map((light) => (
                  <div
                    key={light.id}
                    id={`light-marker-${light.id}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                    style={{
                      left: `${light.x}%`,
                      top: `${light.y}%`,
                    }}
                  >
                    {/* 閃爍的光點 */}
                    <div className="relative group">
                      <div className={`w-4 h-4 rounded-full shadow-xl ${light.status === 'urgent'
                          ? 'bg-red-500 animate-pulse shadow-red-500/70'
                          : 'bg-orange-500 animate-pulse shadow-orange-500/70'
                        }`}></div>
                      <div className={`absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-75 ${light.status === 'urgent' ? 'bg-red-500' : 'bg-orange-500'
                        }`}></div>
                      {/* 外圈光暈 */}
                      <div className={`absolute inset-0 w-8 h-8 -translate-x-2 -translate-y-2 rounded-full animate-pulse ${light.status === 'urgent' ? 'bg-red-500/30' : 'bg-orange-500/30'
                        }`}></div>
                      {/* 內圈光暈 */}
                      <div className={`absolute inset-0 w-6 h-6 -translate-x-1 -translate-y-1 rounded-full animate-pulse ${light.status === 'urgent' ? 'bg-red-500/50' : 'bg-orange-500/50'
                        }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 行動呼籲（行動版） - 顯示在地圖下方 */}
            <div className="pt-6 lg:hidden">
              <motion.button
                onClick={handleStartMatching}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                開始配對 →
              </motion.button>
            </div>
          </div>

          {/* 右側：統計數據和學校資訊 */}
          <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
            {/* 統計數據 */}
            <div ref={statsRef} className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center border border-white/50 shadow-2xl">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                  {isLoadingStats ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    platformStats?.schoolsWithNeeds || 0
                  )}
                </div>
                <div className="text-white text-xs sm:text-sm font-semibold drop-shadow-md">需要幫助的學校</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center border border-white/50 shadow-2xl">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                  {isLoadingStats ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    platformStats?.completedMatches || 0
                  )}
                </div>
                <div className="text-white text-xs sm:text-sm font-semibold drop-shadow-md">已配對成功</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center border border-white/50 shadow-2xl">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                  {isLoadingStats ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    platformStats?.studentsBenefited || 0
                  )}
                </div>
                <div className="text-white text-xs sm:text-sm font-semibold drop-shadow-md">受益學生</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center border border-white/50 shadow-2xl">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                  {isLoadingStats ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    `${platformStats?.successRate || 0}%`
                  )}
                </div>
                <div className="text-white text-xs sm:text-sm font-semibold drop-shadow-md">配對成功率</div>
              </div>
            </div>

            {/* 移除選中學校資訊顯示，只顯示統計數據 */}

            {/* 特色說明 */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg">我們的特色</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold drop-shadow-md">精準配對</div>
                    <div className="text-white text-sm font-medium drop-shadow-md">AI 演算法確保資源與需求完美匹配</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold drop-shadow-md">即時追蹤</div>
                    <div className="text-white text-sm font-medium drop-shadow-md">全程透明化，讓您了解資源使用狀況</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold drop-shadow-md">社群支持</div>
                    <div className="text-white text-sm font-medium drop-shadow-md">建立企業與學校的長期合作關係</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 行動呼籲（桌面版） */}
            <div className="pt-6 hidden lg:block">
              <motion.button
                onClick={handleStartMatching}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                開始配對 →
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
