import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HomePageAnimations } from './animation.config';
import { getImagePath } from '../../utils/imageUtils';

const SolutionSection = () => {
  const mainRef = useRef<HTMLElement>(null);
  
  // 滾動進度追蹤
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end start"]
  });

  // 從配置中獲取動畫參數
  const { stages, fadeDuration } = HomePageAnimations.solutionSection;
  
  // 文字動畫 - 使用配置參數重構
  const text1Opacity = useTransform(scrollYProgress, [
    stages.stage1.start, 
    stages.stage1.start + fadeDuration, 
    stages.stage1.end
  ], [1, 1, 0]);
  
  const text2Opacity = useTransform(scrollYProgress, [
    stages.stage2.start, 
    stages.stage2.start + fadeDuration, 
    stages.stage2.end - fadeDuration, 
    stages.stage2.end
  ], [0, 1, 1, 0]);
  
  const text3Opacity = useTransform(scrollYProgress, [
    stages.stage3.start, 
    stages.stage3.start + fadeDuration, 
    stages.stage3.end - fadeDuration, 
    stages.stage3.end
  ], [0, 1, 1, 0]);
  
  const text4Opacity = useTransform(scrollYProgress, [
    stages.stage4.start, 
    stages.stage4.start + fadeDuration, 
    stages.stage4.end - fadeDuration, 
    stages.stage4.end
  ], [0, 1, 1, 0]);
  
  const text5Opacity = useTransform(scrollYProgress, [
    stages.stage5.start, 
    stages.stage5.start + fadeDuration, 
    stages.stage5.end - fadeDuration, 
    stages.stage5.end
  ], [0, 1, 1, 0]);
  
  // UI 卡片動畫 - 使用配置參數重構
  const ui1Opacity = useTransform(scrollYProgress, [
    stages.stage1.start, 
    stages.stage1.start + fadeDuration, 
    stages.stage1.end
  ], [1, 1, 0]);
  const ui1Y = useTransform(scrollYProgress, [stages.stage1.start, stages.stage1.end], [0, -50]);
  const ui1Scale = useTransform(scrollYProgress, [stages.stage1.start, stages.stage1.end], [1, 0.985]);
  
  const ui2Opacity = useTransform(scrollYProgress, [
    stages.stage2.start, 
    stages.stage2.start + fadeDuration * 0.5, 
    stages.stage2.end - fadeDuration * 0.5, 
    stages.stage2.end
  ], [0, 1, 1, 0]);
  const ui2Scale = useTransform(scrollYProgress, [
    stages.stage2.start, 
    stages.stage2.start + fadeDuration * 0.5, 
    stages.stage2.end - fadeDuration, 
    stages.stage2.end
  ], [0.98, 1, 1, 0.99]);
  
  const ui3Opacity = useTransform(scrollYProgress, [
    stages.stage3.start, 
    stages.stage3.start + fadeDuration * 0.5, 
    stages.stage3.end - fadeDuration * 0.5, 
    stages.stage3.end
  ], [0, 1, 1, 0]);
  const ui3Scale = useTransform(scrollYProgress, [
    stages.stage3.start, 
    stages.stage3.start + fadeDuration * 0.5, 
    stages.stage3.end - fadeDuration, 
    stages.stage3.end
  ], [0.98, 1, 1, 0.99]);
  
  const ui4Opacity = useTransform(scrollYProgress, [
    stages.stage4.start, 
    stages.stage4.start + fadeDuration * 0.5, 
    stages.stage4.end - fadeDuration * 0.5, 
    stages.stage4.end
  ], [0, 1, 1, 0]);
  const ui4Scale = useTransform(scrollYProgress, [
    stages.stage4.start, 
    stages.stage4.start + fadeDuration * 0.5, 
    stages.stage4.end - fadeDuration, 
    stages.stage4.end
  ], [0.98, 1, 1, 0.99]);
  
  const ui5Opacity = useTransform(scrollYProgress, [
    stages.stage5.start, 
    stages.stage5.start + fadeDuration * 0.5, 
    stages.stage5.end - fadeDuration * 0.5, 
    stages.stage5.end
  ], [0, 1, 1, 0]);
  const ui5Scale = useTransform(scrollYProgress, [
    stages.stage5.start, 
    stages.stage5.start + fadeDuration * 0.5, 
    stages.stage5.end - fadeDuration, 
    stages.stage5.end
  ], [0.98, 1, 1, 0.99]);

  return (
    <section ref={mainRef} className="h-[400vh] relative">
      <div 
        className="sticky top-0 h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url("${getImagePath('/images/bg-3.jpg')}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* 右側 - 真實產品UI截圖 - 卡片式堆疊滑動（行動版降低高度避免擠壓） */}
            <div className="relative h-64 sm:h-80 lg:h-[500px] xl:h-[600px] overflow-hidden">
              {/* UI卡片1: 學校刊登需求表單 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  opacity: ui1Opacity,
                  transform: `scale(${ui1Scale})`
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-brand-blue-light to-white p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-neutral-900">刊登新需求</h3>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <label className="block text-sm font-medium text-neutral-500 mb-2">需求標題</label>
                        <input className="w-full p-2 border border-neutral-100 rounded-md" placeholder="需要 20 台筆記型電腦" />
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <label className="block text-sm font-medium text-neutral-500 mb-2">學生人數</label>
                        <input className="w-full p-2 border border-neutral-100 rounded-md" placeholder="150 人" />
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <label className="block text-sm font-medium text-neutral-500 mb-2">學校位置</label>
                        <input className="w-full p-2 border border-neutral-100 rounded-md" placeholder="花蓮縣玉里鎮" />
                      </div>
                    </div>
                    <button className="w-full bg-brand-blue text-white py-3 rounded-lg font-medium">
                      提交需求
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* UI卡片2: AI智慧推薦儀表板 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  opacity: ui2Opacity,
                  transform: `scale(${ui2Scale})`
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-brand-orange-light to-white p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-neutral-900">AI 智慧推薦</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
                        <div className="text-2xl font-bold text-brand-blue">95%</div>
                        <div className="text-sm text-neutral-500">匹配度</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
                        <div className="text-2xl font-bold text-brand-orange">3</div>
                        <div className="text-sm text-neutral-500">推薦捐贈者</div>
                      </div>
                      </div>
                      <div className="space-y-2">
                      <div className="bg-white rounded-lg p-3 shadow-sm border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">科技公司A</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">高匹配</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">教育基金會B</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">中匹配</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* UI卡片3: 即時通知系統 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  opacity: ui3Opacity,
                  transform: `scale(${ui3Scale})`
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-green-50 to-white p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-neutral-900">即時通知</h3>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div>
                            <div className="text-sm font-medium">新匹配成功！</div>
                            <div className="text-xs text-neutral-500">科技公司A 願意捐贈 20 台筆電</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <div className="text-sm font-medium">運輸安排中</div>
                            <div className="text-xs text-neutral-500">預計 3 天內送達</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* UI卡片4: 社群互動平台 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  opacity: ui4Opacity,
                  transform: `scale(${ui4Scale})`
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-50 to-white p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-neutral-900">社群互動</h3>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
                          <div>
                            <div className="text-sm font-medium">科技公司A</div>
                            <div className="text-xs text-neutral-500">2 小時前</div>
                          </div>
                        </div>
                        <div className="text-sm">感謝學校的詳細需求說明，我們很樂意提供支援！</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white text-sm font-bold">B</div>
                          <div>
                            <div className="text-sm font-medium">教育基金會B</div>
                            <div className="text-xs text-neutral-500">5 小時前</div>
                      </div>
                      </div>
                        <div className="text-sm">我們也有類似的需求，可以一起討論合作方案。</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* UI卡片5: 數據分析儀表板 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  opacity: ui5Opacity,
                  transform: `scale(${ui5Scale})`
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-white p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-neutral-900">數據分析</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
                        <div className="text-2xl font-bold text-blue-600">85%</div>
                        <div className="text-sm text-neutral-500">配對成功率</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
                        <div className="text-2xl font-bold text-green-600">1,234</div>
                        <div className="text-sm text-neutral-500">已完成配對</div>
                      </div>
                      </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="text-sm font-medium mb-2">本月配對趨勢</div>
                      <div className="h-20 bg-gray-100 rounded flex items-center justify-center">
                        <div className="text-xs text-neutral-500">圖表區域</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* 左側 - 文字內容（固定顯示位置） */}
            <div className="relative h-[260px] sm:h-[300px] lg:h-full">
              {/* 問題描述 */}
              <motion.div 
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-center lg:text-left"
                style={{ opacity: text1Opacity }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 lg:mb-8 drop-shadow-2xl">
                  問題
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl text-white leading-relaxed font-medium drop-shadow-lg">
                  偏鄉學校面臨資源匱乏的困境，傳統的資源配對方式效率低下。
                  捐贈者難以找到真正需要幫助的學校，學校也缺乏有效的資源獲取管道。
                </p>
              </motion.div>
              
              {/* 解法1: 智慧配對系統 */}
              <motion.div 
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-center lg:text-left"
                style={{ opacity: text2Opacity }}
              >
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6 drop-shadow-xl">
                  解法 1: 智慧配對系統
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-white leading-relaxed font-medium drop-shadow-md">
                  運用先進的 AI 演算法，智能分析學校需求與捐贈者資源，
                  實現精準匹配，大幅提升資源分配效率與成功率。
                </p>
              </motion.div>
              
              {/* 解法2: 即時通知系統 */}
              <motion.div 
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-center lg:text-left"
                style={{ opacity: text3Opacity }}
              >
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6 drop-shadow-xl">
                  解法 2: 即時通知系統
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-white leading-relaxed font-medium drop-shadow-md">
                  即時監控配對機會，第一時間通知相關的學校和捐贈者，
                  確保寶貴的資源能夠快速、準確地配對成功。
                </p>
              </motion.div>

              {/* 解法3: 社群互動平台 */}
              <motion.div 
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-center lg:text-left"
                style={{ opacity: text4Opacity }}
              >
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6 drop-shadow-xl">
                  解法 3: 社群互動平台
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-white leading-relaxed font-medium drop-shadow-md">
                  打造專屬社群平台，促進學校與捐贈者之間的深度交流，
                  建立信任基礎，形成長期穩定的合作夥伴關係。
                </p>
              </motion.div>

              {/* 解法4: 數據分析與追蹤 */}
              <motion.div 
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-center lg:text-left"
                style={{ opacity: text5Opacity }}
              >
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6 drop-shadow-xl">
                  解法 4: 數據分析與追蹤
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-white leading-relaxed font-medium drop-shadow-md">
                  提供全面的數據分析儀表板，即時追蹤配對成功率、
                  資源流向與社會影響力，持續優化配對機制，確保最大效益。
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
