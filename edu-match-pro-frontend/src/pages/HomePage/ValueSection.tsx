import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChartBarIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getImagePath } from '../../utils/imageUtils';

gsap.registerPlugin(ScrollTrigger);

const ValueSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // 處理按鈕點擊事件
  const handleLearnMore = (index: number) => {
    // 根據不同的價值卡片導航到不同頁面
    switch (index) {
      case 0: // 數據驅動的 ESG 報告
        navigate('/for-companies');
        break;
      case 1: // 提升品牌正面形象
        navigate('/stories');
        break;
      case 2: // 精準媒合與高效執行
        navigate('/needs');
        break;
      default:
        navigate('/for-companies');
    }
  };

  const handleGetStarted = () => {
    navigate('/for-companies');
  };

  const handleLearnMoreAbout = () => {
    navigate('/about');
  };

  const values = [
    {
      icon: ShieldCheckIcon,
      title: "數據驅動的 ESG 報告",
      description: "一鍵生成可追溯的影響力報告，具體量化您的社會貢獻，完美整合至永續報告書。",
      color: "blue",
      image: getImagePath('/images/impact-stories/background-wall/01.jpg'),
      stats: "95% 準確率",
      features: ["自動化報告生成", "數據可視化", "合規性檢查"]
    },
    {
      icon: SparklesIcon,
      title: "提升品牌正面形象",
      description: "每一次成功的媒合都是一個動人的品牌故事。透過我們的平台，將您的善舉化為溫暖的品牌資產。",
      color: "amber",
      image: getImagePath('/images/impact-stories/background-wall/05.jpg'),
      stats: "300+ 成功案例",
      features: ["品牌故事包裝", "媒體曝光", "社群影響力"]
    },
    {
      icon: ChartBarIcon,
      title: "精準媒合與高效執行",
      description: "告別傳統公益的耗時與不確定性。AI 引擎為您找到最契合的專案，確保每一份資源都發揮最大效益。",
      color: "emerald",
      image: getImagePath('/images/impact-stories/background-wall/09.jpg'),
      stats: "80% 效率提升",
      features: ["AI 智能匹配", "專案追蹤", "效果評估"]
    }
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 標題動畫
      gsap.from(titleRef.current, {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 90%",
          end: "bottom 10%",
          toggleActions: "play none none reverse"
        }
      });
      
      // 卡片動畫 - 提早觸發並加快節奏
      // 調整參數使卡片在捲動到更高的位置時就開始出現，並減少延遲與動作時間
      cardRefs.current.forEach((card, index) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          scale: 0.92,
          duration: 0.65,
          ease: 'power3.out',
          delay: index * 0.06, // 更短的逐項延遲
          scrollTrigger: {
            trigger: card,
            start: "top 85%", // 更早觸發
            end: "bottom 20%",
            toggleActions: "play none none reverse",
            // 開發時可打開 markers 幫助調整位置：markers: true
          }
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-24 relative overflow-hidden"
        style={{
        backgroundImage: `url("${getImagePath('/images/bg-2.jpg')}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 背景裝飾元素 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-amber-200 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 ref={titleRef} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white/90 mb-12 sm:mb-16 lg:mb-20 leading-tight drop-shadow-lg">
          將企業責任，轉化為<span className="text-white relative">
            永續價值
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-white/60 to-white/80 rounded-full"></div>
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {values.map((value, index) => (
            <div 
              key={index} 
              ref={el => { if (el) cardRefs.current[index] = el; }}
              className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 hover:scale-105"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* 卡片背景圖片 */}
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img 
                  src={value.image} 
                  alt={value.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* 圖片載入失敗的備用顯示 */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl"
                  style={{ display: 'none' }}
                >
                  📸
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* 圖標覆蓋層 */}
                <div className="absolute top-4 right-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm ${
                    value.color === 'blue' ? 'bg-blue-500/20' : 
                    value.color === 'amber' ? 'bg-amber-500/20' : 
                    'bg-emerald-500/20'
                  }`}>
                    <value.icon className={`w-6 h-6 ${
                      value.color === 'blue' ? 'text-blue-600' : 
                      value.color === 'amber' ? 'text-amber-600' : 
                      'text-emerald-600'
                    }`} />
                  </div>
                </div>

                {/* 統計數據 */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-gray-800">{value.stats}</span>
                  </div>
                </div>
              </div>

              {/* 卡片內容 */}
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  {value.description}
                </p>

                {/* 功能特色列表 */}
                <div className="space-y-1 sm:space-y-2">
                  {value.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-xs sm:text-sm text-gray-600">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        value.color === 'blue' ? 'bg-blue-500' : 
                        value.color === 'amber' ? 'bg-amber-500' : 
                        'bg-emerald-500'
                      }`}></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* 懸停時顯示的按鈕 */}
                <div className={`mt-4 sm:mt-6 transition-all duration-300 ${
                  hoveredCard === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <button 
                    onClick={() => handleLearnMore(index)}
                    className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                      value.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
                      value.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 
                      'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    了解更多
                  </button>
                </div>
              </div>

              {/* 卡片邊框光效 */}
              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                value.color === 'blue' ? 'bg-gradient-to-r from-blue-400/20 to-blue-600/20' : 
                value.color === 'amber' ? 'bg-gradient-to-r from-amber-400/20 to-amber-600/20' : 
                'bg-gradient-to-r from-emerald-400/20 to-emerald-600/20'
              }`}></div>
            </div>
          ))}
        </div>

        {/* 底部 CTA */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">準備開始您的永續之旅？</h3>
            <p className="text-sm sm:text-base text-white/90 mb-4 sm:mb-6">加入我們，讓每一次善舉都成為可量化的影響力</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button 
                onClick={handleGetStarted}
                className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors duration-300 shadow-lg"
              >
                立即開始
              </button>
              <button 
                onClick={handleLearnMoreAbout}
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueSection;


