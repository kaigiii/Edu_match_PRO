import { useLayoutEffect, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import NeedCard from '../../components/NeedCard';
import type { SchoolNeed } from '../../types';

// 註冊 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger);

interface NeedsCarouselProps {
  needs: SchoolNeed[] | null;
}

const NeedsCarousel = ({ needs }: NeedsCarouselProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !scrollContainerRef.current || !titleRef.current || !cardsRef.current) return;

    // 設置初始狀態
    gsap.set(titleRef.current, { opacity: 0, y: 50 });
    gsap.set(cardsRef.current, { opacity: 0, x: 100 });

    // 創建滾動動畫時間軸
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
        onEnter: () => {
          gsap.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          });
          gsap.to(cardsRef.current, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.2
          });
        }
      }
    });

    // 水平滾動動畫 - 計算正確的滾動距離
    const containerWidth = scrollContainerRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollDistance = containerWidth - viewportWidth;

    const horizontalTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(scrollContainerRef.current, {
            x: -scrollDistance * progress
          });
        }
      }
    });

    // 清理函數
    return () => {
      tl.kill();
      horizontalTl.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === sectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, [needs]);

  // 當 needs 改變時重新初始化動畫
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [needs]);

  if (!needs || needs.length === 0) {
    return (
      <section 
        ref={sectionRef} 
        className="min-h-[80vh] relative py-16 overflow-hidden"
        style={{
          backgroundImage: `url("${import.meta.env.PROD ? '/Edu_match_PRO' : ''}/images/bg-4.jpg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="text-gray-900 text-xl font-medium drop-shadow-lg">暫無需求資料</div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef} 
      className="min-h-[80vh] relative py-16 overflow-hidden"
      style={{
        backgroundImage: `url("${import.meta.env.PROD ? '/Edu_match_PRO' : ''}/images/bg-4.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      <div className="flex flex-col items-center justify-center h-full relative z-20 px-4">
        <div className="text-center text-white max-w-6xl mx-auto w-full">
          <h2 
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 drop-shadow-2xl"
            style={{
              textShadow: '0 4px 8px rgba(0,0,0,0.6)'
            }}
          >
            這些真實的需求，
            <br />
            正在等待被看見
          </h2>
          
          <div 
            ref={cardsRef}
            className="relative w-full"
          >
            <div 
              ref={scrollContainerRef}
              className="flex space-x-6"
              style={{ 
                width: `${needs.length * 384}px`,
                transform: 'translateX(0)'
              }}
            >
              {needs.map((need) => (
                <div key={need.id} className="flex-shrink-0 w-96">
                  <NeedCard need={need} />
                </div>
              ))}
            </div>
          </div>
          
          {/* 查看更多按鈕 */}
          <div className="mt-8 sm:mt-12">
            <Link 
              to="/needs" 
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              <span>點擊查看更多</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NeedsCarousel;