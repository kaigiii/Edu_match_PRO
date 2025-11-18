import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // 標題文字，以詞為單位分割
  const titleText = "每個孩子，都值得最好的教育";
  const titleWords = ["每個", "孩子", "，", "都", "值得", "最好", "的", "教育"];

  // 優化的影片載入處理
  const handleVideoLoad = useCallback(() => {
    setVideoLoaded(true);
    console.log('影片載入完成');
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    console.error('影片載入失敗');
  }, []);

  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsVideoPlaying(false);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 添加事件監聽器
    video.addEventListener('loadeddata', handleVideoLoad);
    video.addEventListener('error', handleVideoError);
    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('pause', handleVideoPause);
    
    // 嘗試播放影片
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('影片開始播放');
        })
        .catch((error) => {
          console.log('影片自動播放被阻止，這是正常的:', error);
        });
    }

    // 清理函數
    return () => {
      video.removeEventListener('loadeddata', handleVideoLoad);
      video.removeEventListener('error', handleVideoError);
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('pause', handleVideoPause);
    };
  }, [handleVideoLoad, handleVideoError, handleVideoPlay, handleVideoPause]);

  return (
    <section 
      ref={sectionRef} 
      className="h-[120vh] relative flex items-center justify-center overflow-hidden"
    >
      {/* 背景影片 */}
      {!videoError && (
        <motion.video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`${import.meta.env.PROD ? '/Edu_match_PRO' : ''}/videos/taiwan-education-poster.jpg`}
          initial={{ opacity: 0 }}
          animate={{ opacity: videoLoaded ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <source src={`${import.meta.env.PROD ? '/Edu_match_PRO' : ''}/videos/taiwan-education.mp4`} type="video/mp4" />
          您的瀏覽器不支援影片播放。
        </motion.video>
      )}

      {/* 影片載入指示器 */}
      {!videoLoaded && !videoError && (
        <motion.div 
          className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center text-white">
            <motion.div
              className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-lg font-medium">載入影片中...</p>
          </div>
        </motion.div>
      )}

      {/* 影片錯誤備用背景 */}
      {videoError && (
        <motion.div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* 備用背景 - 當影片載入失敗或未載入時顯示 */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 z-0 transition-opacity duration-1000 ${
          videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* 影片載入遮罩 */}
      {!videoLoaded && !videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 z-10 flex items-center justify-center">
          <motion.div
            className="flex flex-col items-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-sm text-gray-600">載入影片中...</span>
          </motion.div>
        </div>
      )}
      
      {/* 詞組動畫的標題 */}
      <motion.h1
        className="relative z-20 text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold w-full flex flex-wrap justify-center items-center px-4"
        style={{
          textShadow: '0 6px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05, delayChildren: 0.05 }}
          className="flex flex-wrap justify-center items-center"
        >
          {titleWords.map((word, index) => (
            <motion.span
              key={index}
              className="inline-block text-center mx-1"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              {word === ' ' ? '\u00A0' : word}
            </motion.span>
          ))}
        </motion.div>
      </motion.h1>
      
      {/* 向下箭頭 */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.1 }}
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        <motion.svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={{ y: [0, 10, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </motion.svg>
      </motion.div>
    </section>
  );
};

export default HeroSection;