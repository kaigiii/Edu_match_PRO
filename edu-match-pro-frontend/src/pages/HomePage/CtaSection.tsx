import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

// 註冊 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger);

const CtaSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const button1Ref = useRef<HTMLAnchorElement>(null);
  const button2Ref = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !backgroundRef.current || !contentRef.current || !titleRef.current || !button1Ref.current || !button2Ref.current) return;

    // 設置初始狀態
    gsap.set(contentRef.current, { opacity: 0, y: 30 });
    gsap.set(titleRef.current, { opacity: 0, y: 20 });

    // 創建滾動動畫時間軸
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 95%",
        end: "bottom center",
        scrub: 0.3
      }
    });

    // 背景模糊效果 - 更快清除模糊
    tl.to(backgroundRef.current, {
      filter: "blur(0px)",
      duration: 0.4,
      ease: "power2.out"
    }, 0);

    // 內容淡入 - 立即開始
    tl.to(contentRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    }, 0);

    // 標題淡入 - 緊接著開始
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.25,
      ease: "power2.out"
    }, 0.1);

    // 按鈕跳動動畫
    gsap.to([button1Ref.current, button2Ref.current], {
      y: -10,
      duration: 1.5,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

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
    <section ref={sectionRef} className="h-screen relative flex items-center justify-center">
      {/* 背景圖片牆 */}
      <div
        ref={backgroundRef}
        className="absolute inset-0"
        style={{ filter: "blur(8px)" }}
      >
        <div className="grid grid-cols-4 gap-2 h-full">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-brand-blue to-brand-orange rounded-lg overflow-hidden relative group"
            >
              <img
                src={`/images/impact-stories/background-wall/${String(i + 1).padStart(2, '0')}.jpg`}
                alt={`影響力故事 ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  // 如果圖片載入失敗，顯示漸變背景
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = 'linear-gradient(135deg, #2A4D8C, #FF8C42)';
                  }
                }}
              />
              {/* 懸停效果覆蓋層 */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* 內容 */}
      <div
        ref={contentRef}
        className="relative z-10 text-center text-white max-w-4xl mx-auto px-8"
      >
        <h2
          ref={titleRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 drop-shadow-2xl"
          style={{
            textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'
          }}
        >
          加入我們，
          <br />
          點亮台灣的每一個角落
        </h2>

        <p
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-8 sm:mb-12 text-white font-bold drop-shadow-2xl"
          style={{
            textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'
          }}
        >
          無論是學校、企業，還是關心教育的每一個人，
          <br />
          都能在這裡找到屬於自己的位置
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <Link
            to="/for-schools"
            ref={button1Ref}
            className="group relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white px-10 sm:px-12 py-5 sm:py-6 rounded-2xl text-xl sm:text-2xl font-black hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 transition-all duration-500 shadow-2xl hover:shadow-4xl hover:scale-110 transform animate-pulse border-2 border-emerald-300 hover:border-emerald-200"
          >
            {/* 發光效果 */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>

            {/* 閃爍效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:animate-pulse rounded-2xl"></div>

            <span className="relative z-10 flex items-center justify-center space-x-3">
              <span className="drop-shadow-lg">學校註冊</span>
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>

            {/* 邊框光效 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-200 to-emerald-300 opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
          </Link>

          <Link
            to="/for-companies"
            ref={button2Ref}
            className="group relative bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 text-white px-10 sm:px-12 py-5 sm:py-6 rounded-2xl text-xl sm:text-2xl font-black hover:from-indigo-500 hover:via-indigo-600 hover:to-indigo-700 transition-all duration-500 shadow-2xl hover:shadow-4xl hover:scale-110 transform animate-pulse border-2 border-indigo-300 hover:border-indigo-200"
          >
            {/* 發光效果 */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 to-indigo-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>

            {/* 閃爍效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:animate-pulse rounded-2xl"></div>

            <span className="relative z-10 flex items-center justify-center space-x-3">
              <span className="drop-shadow-lg">企業加入</span>
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>

            {/* 邊框光效 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-200 to-indigo-300 opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;