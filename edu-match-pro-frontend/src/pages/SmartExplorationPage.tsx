import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  LightBulbIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/apiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ExtractedParams {
  resource_type?: string;
  quantity?: number;
  target_counties?: string[];
  target_school_level?: string;
  priority_focus?: string;
  area_type?: string;
}

interface AnalysisResult {
  report: string;
  school_data: {
    faraway_schools: any[];
    edu_stats: any[];
    devices_info: any[];
    volunteer_teams: any[];
  };
  statistics: {
    total_schools: number;
    total_students: number;
    counties_covered: string[];
    area_types: Record<string, number>;
  };
}

const SmartExplorationPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '您好！我是小匯，智匯偏鄉平台的AI教育公益顧問 👋\n\n我可以協助您規劃偏鄉學校的捐贈策略，並根據平台真實數據為您提供精準建議。'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [extractedParams, setExtractedParams] = useState<ExtractedParams>({});
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 移除自動滾動到底部的邏輯，讓用戶自己控制滾動位置
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  useEffect(() => {
    if (!isProcessing) {
      inputRef.current?.focus();
    }
  }, [isProcessing]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    // 添加用戶消息
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);

    try {
      // 檢測用戶是否要求生成報告（更靈活的檢測）
      const generateReportKeywords = ['生成報告', '產生報告', '生成', '產生', '請生成', '幫我生成', '開始生成', '製作報告'];
      const confirmKeywords = ['確認', '可以', '好', '沒有', 'ok', 'yes', '是'];
      
      const isRequestingReport = generateReportKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword.toLowerCase())
      );
      const isConfirming = waitingForConfirmation && 
        confirmKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

      // 檢查是否有必要參數
      const hasRequiredParams = extractedParams.resource_type && extractedParams.target_counties;
      
      if ((isRequestingReport || isConfirming) && hasRequiredParams) {
        // 用戶要求生成報告 且 參數已足夠
        console.log('✅ 開始生成報告，參數:', extractedParams);
        setWaitingForConfirmation(false);
        setIsComplete(true);
        
        const assistantMessage = {
          role: 'assistant' as const,
          content: '收到！我現在為您分析數據並準備策略建議... 💭'
        };
        setMessages([...newMessages, assistantMessage]);

        // 調用分析 API
        const analysisResponse = await apiService.analyzeAIStrategy(
          extractedParams,
          conversationHistory
        );

        setAnalysisResult(analysisResponse);
        
        // 顯示分析完成消息
        setMessages([...newMessages, assistantMessage, {
          role: 'assistant' as const,
          content: '好了，報告準備好了！'
        }]);
      } else {
        // 繼續正常對話流程
        if (isRequestingReport && !hasRequiredParams) {
          console.log('⚠️ 用戶要求生成報告但參數不足:', extractedParams);
        }
        // 先更新對話歷史（加入用戶消息）
        const newHistory = [
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ];
        console.log('📝 對話歷史（發送前）:', newHistory);

        // 調用 AI 參數提取 API（傳入完整對話歷史）
        const response = await apiService.extractAIParameters(
          userMessage,
          newHistory
        );
        console.log('📨 收到 AI 回應:', response);

        // 更新提取的參數（保留已有的參數，只添加新的）
        const newParams = { 
          ...extractedParams, 
          ...Object.fromEntries(
            Object.entries(response.extracted_params).filter(([_, v]) => v != null)
          )
        };
        setExtractedParams(newParams);
        
        console.log('📋 提取的參數:', response.extracted_params);
        console.log('📋 合併後的參數:', newParams);
        console.log('📋 是否有足夠參數:', {
          resource_type: newParams.resource_type || '缺少',
          target_counties: newParams.target_counties || '缺少'
        });

        if (response.followup_question) {
          // 需要追問或確認
          setMessages([...newMessages, {
            role: 'assistant' as const,
            content: response.followup_question
          }]);

          // 更新對話歷史（加入AI回復）
          const updatedHistory = [
            ...newHistory,
            { role: 'assistant', content: response.followup_question }
          ];
          setConversationHistory(updatedHistory);
          console.log('✅ 對話歷史已更新（含AI回復）:', updatedHistory);

          // 檢查是否進入等待確認狀態（必要參數已收集完成）
          if (response.is_complete) {
            setWaitingForConfirmation(true);
          }
        } else {
          // 即使沒有followup_question，也要保存用戶消息到歷史
          setConversationHistory(newHistory);
        }
      }

    } catch (error: any) {
      console.error('AI 處理錯誤:', error);
      let errorMessage = '抱歉，處理您的請求時發生錯誤。';
      
      if (error.message?.includes('AI 服務不可用')) {
        errorMessage = '⚠️ AI 服務暫時不可用。這可能是因為未配置 GEMINI_API_KEY 環境變量。\n\n請聯繫管理員配置 API 金鑰後重試。';
      }
      
      setMessages([...newMessages, {
        role: 'assistant' as const,
        content: errorMessage
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: '您好！我是小匯，智匯偏鄉平台的AI教育公益顧問 👋\n\n我可以協助您規劃偏鄉學校的捐贈策略，並根據平台真實數據為您提供精準建議。'
    }]);
    setInputValue('');
    setConversationHistory([]);
    setExtractedParams({});
    setAnalysisResult(null);
    setIsComplete(false);
    setWaitingForConfirmation(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
            <SparklesIcon className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">智慧探索</h1>
            <p className="text-gray-600">智匯偏鄉 AI 顧問 - 精準媒合您的教育公益資源</p>
          </div>
        </div>
      </div>

      {/* 對話區域 */}
      <div className="bg-white rounded-xl shadow-lg mb-8 flex flex-col max-h-[600px]">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-gray-600">AI 思考中...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              placeholder="輸入您的回應..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !inputValue.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              <span>發送</span>
            </button>
          </div>
        </div>
      </div>

      {/* 提取的參數顯示 */}
      {Object.keys(extractedParams).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-xl p-6 mb-8 border-l-4 border-blue-500"
        >
          <h3 className="text-lg font-bold text-blue-900 mb-3">📋 已收集的信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {extractedParams.resource_type && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-700 font-medium">資源類型:</span>
                <span className="text-gray-900">{extractedParams.resource_type}</span>
              </div>
            )}
            {extractedParams.quantity && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-700 font-medium">數量:</span>
                <span className="text-gray-900">{extractedParams.quantity}</span>
              </div>
            )}
            {extractedParams.target_counties && extractedParams.target_counties.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-700 font-medium">目標縣市:</span>
                <span className="text-gray-900">{extractedParams.target_counties.join(', ')}</span>
              </div>
            )}
            {extractedParams.target_school_level && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-700 font-medium">學校等級:</span>
                <span className="text-gray-900">{extractedParams.target_school_level}</span>
            </div>
            )}
            {extractedParams.area_type && (
                <div className="flex items-center space-x-2">
                <span className="text-blue-700 font-medium">地區屬性:</span>
                <span className="text-gray-900">{extractedParams.area_type}</span>
                </div>
            )}
            {extractedParams.priority_focus && (
                <div className="flex items-center space-x-2">
                <span className="text-blue-700 font-medium">優先關注:</span>
                <span className="text-gray-900">{extractedParams.priority_focus}</span>
                </div>
              )}
          </div>
        </motion.div>
      )}

      {/* 分析結果 */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* AI 分析報告 */}
          <div className="relative">
            {/* 背景裝飾 - 動態氣泡 */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white">
              {/* 頂部標題區 - 漸層背景 */}
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-8 overflow-hidden">
                {/* 標題背景裝飾 */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                  </div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                      <LightBulbIcon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-white tracking-tight">
                        AI 策略分析報告
                      </h2>
                      <p className="text-blue-100 mt-1 text-sm font-medium">
                        由小匯 AI 為您量身打造
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block bg-white/20 backdrop-blur-md px-5 py-2 rounded-full">
                    <span className="text-white font-semibold text-sm">✨ AI 生成</span>
            </div>
          </div>
              </div>
              
              {/* 內容區域 - 優雅漸層背景 */}
              <div className="relative overflow-hidden">
                {/* 主背景層 */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50"></div>
                
                {/* 微妙紋理層 */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Q0EzQUYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE4YzAtMS42NTctMS4zNDMtMy0zLTNzLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzIDMtMS4zNDMgMy0zIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
                
                {/* 彩色光暈層 - 柔和脈動 */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute -top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-cyan-300/20 rounded-full filter blur-3xl animate-pulse"></div>
                  <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-gradient-to-bl from-purple-300/30 to-pink-300/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
                  <div className="absolute -bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-tr from-pink-300/25 to-rose-300/15 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
                </div>
                
                <div className="relative p-8 md:p-12">
                  {/* 裝飾性圖標散落 - 靜態裝飾 */}
                  <div className="absolute top-20 right-16 text-blue-300 opacity-10 text-8xl pointer-events-none">💡</div>
                  <div className="absolute top-80 left-16 text-purple-300 opacity-10 text-7xl pointer-events-none">📊</div>
                  <div className="absolute bottom-60 right-32 text-pink-300 opacity-10 text-7xl pointer-events-none">🎯</div>
                  <div className="absolute top-96 right-40 text-green-300 opacity-10 text-6xl pointer-events-none">✨</div>
                  <div className="absolute bottom-40 left-24 text-yellow-300 opacity-10 text-6xl pointer-events-none">🚀</div>
                  
                  <div className="relative prose prose-lg max-w-none
                    prose-headings:!font-black prose-headings:!tracking-tight
                    
                    /* H2 大標題 - 優雅漸層居中 */
                    prose-h2:!text-4xl prose-h2:!font-black prose-h2:!text-transparent prose-h2:!bg-clip-text 
                    prose-h2:!bg-gradient-to-r prose-h2:!from-blue-700 prose-h2:!via-purple-600 prose-h2:!to-pink-600
                    prose-h2:!mt-16 prose-h2:!mb-10 prose-h2:!pb-6 prose-h2:!text-center
                    prose-h2:!relative prose-h2:!tracking-tight
                    prose-h2:!drop-shadow-[0_2px_10px_rgba(99,102,241,0.15)]
                    prose-h2:after:!content-[''] prose-h2:after:!absolute prose-h2:after:!bottom-0 prose-h2:after:!left-1/2 prose-h2:after:!-translate-x-1/2
                    prose-h2:after:!w-32 prose-h2:after:!h-1.5 prose-h2:after:!bg-gradient-to-r 
                    prose-h2:after:!from-blue-500 prose-h2:after:!via-purple-500 prose-h2:after:!to-pink-500
                    prose-h2:after:!rounded-full prose-h2:after:!shadow-lg
                    
                    /* H3 中標題 - 優雅彩色卡片居中 */
                    prose-h3:!text-2xl prose-h3:!font-black prose-h3:!text-white prose-h3:!mt-14 prose-h3:!mb-8 prose-h3:!text-center
                    prose-h3:!bg-gradient-to-r prose-h3:!from-blue-600 prose-h3:!via-purple-600 prose-h3:!to-pink-500
                    prose-h3:!px-10 prose-h3:!py-5 prose-h3:!rounded-3xl prose-h3:!mx-auto prose-h3:!max-w-3xl
                    prose-h3:!shadow-[0_8px_35px_-12px_rgba(0,0,0,0.25)]
                    prose-h3:hover:!shadow-[0_15px_50px_-12px_rgba(0,0,0,0.35)]
                    prose-h3:!transform prose-h3:hover:!scale-[1.02] prose-h3:hover:!-translate-y-1
                    prose-h3:!transition-all prose-h3:!duration-500
                    prose-h3:!relative prose-h3:!overflow-hidden
                    prose-h3:!backdrop-blur-xl
                    prose-h3:before:!content-[''] prose-h3:before:!absolute prose-h3:before:!inset-0
                    prose-h3:before:!bg-gradient-to-r prose-h3:before:!from-white/10 prose-h3:before:!via-transparent prose-h3:before:!to-transparent
                    prose-h3:after:!content-[''] prose-h3:after:!absolute prose-h3:after:!bottom-0 prose-h3:after:!left-0
                    prose-h3:after:!w-full prose-h3:after:!h-1 prose-h3:after:!bg-gradient-to-r
                    prose-h3:after:!from-pink-300/50 prose-h3:after:!via-purple-300/50 prose-h3:after:!to-blue-300/50
                    
                    /* H4 小標題 - 白色卡片居中 */
                    prose-h4:!text-lg prose-h4:!text-gray-800 prose-h4:!font-bold prose-h4:!mt-10 prose-h4:!mb-5
                    prose-h4:!bg-white prose-h4:!px-8 prose-h4:!py-4 prose-h4:!rounded-2xl prose-h4:!text-center
                    prose-h4:!shadow-[0_3px_15px_-3px_rgba(0,0,0,0.1)]
                    prose-h4:!border-t-[4px] prose-h4:!border-blue-500
                    prose-h4:!border prose-h4:!border-gray-200
                    prose-h4:!mx-auto prose-h4:!max-w-2xl
                    prose-h4:hover:!shadow-[0_6px_25px_-3px_rgba(0,0,0,0.15)]
                    prose-h4:hover:!border-blue-400
                    prose-h4:!transition-all prose-h4:!duration-300
                    
                    /* 段落 - 精美白色卡片 */
                    prose-p:!text-gray-700 prose-p:!text-base prose-p:!leading-relaxed prose-p:!my-6
                    prose-p:!bg-white prose-p:!px-10 prose-p:!py-6 prose-p:!rounded-3xl
                    prose-p:!shadow-[0_3px_15px_-3px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)]
                    prose-p:hover:!shadow-[0_8px_30px_-3px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.06)]
                    prose-p:hover:!-translate-y-1
                    prose-p:!transition-all prose-p:!duration-400 prose-p:!ease-out
                    prose-p:!relative
                    prose-p:!border-2 prose-p:!border-gray-200
                    prose-p:hover:!border-blue-300/60
                    prose-p:!mx-auto prose-p:!max-w-4xl
                    prose-p:before:!content-[''] prose-p:before:!absolute prose-p:before:!inset-0
                    prose-p:before:!rounded-3xl prose-p:before:!bg-gradient-to-br
                    prose-p:before:!from-blue-500/0 prose-p:before:!via-purple-500/0 prose-p:before:!to-pink-500/0
                    prose-p:before:hover:!from-blue-500/[0.02] prose-p:before:hover:!via-purple-500/[0.02] prose-p:before:hover:!to-pink-500/[0.02]
                    prose-p:before:!transition-all prose-p:before:!duration-400
                    prose-p:before:!-z-10
                    
                    /* 強調文字 - 精緻高亮 */
                    prose-strong:text-blue-800 prose-strong:font-extrabold
                    prose-strong:bg-gradient-to-r prose-strong:from-amber-200/80 prose-strong:via-yellow-100/80 prose-strong:to-amber-200/80
                    prose-strong:px-3 prose-strong:py-1 prose-strong:rounded-xl
                    prose-strong:shadow-[0_2px_8px_rgba(251,191,36,0.3)]
                    prose-strong:border-b-2 prose-strong:border-amber-400/50
                    prose-strong:transition-all prose-strong:duration-300
                    prose-strong:hover:shadow-[0_4px_12px_rgba(251,191,36,0.4)]
                    prose-strong:hover:scale-105
                    
                    /* 無序列表 - 精美白色卡片 */
                    prose-ul:!my-8 prose-ul:!space-y-3 prose-ul:!max-w-4xl prose-ul:!mx-auto
                    prose-li:!text-gray-700 prose-li:!text-base prose-li:!leading-relaxed
                    prose-li:!bg-white prose-li:!p-4 prose-li:!pl-12 prose-li:!pr-6 prose-li:!rounded-2xl
                    prose-li:!shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06),0_1px_5px_-1px_rgba(0,0,0,0.03)]
                    prose-li:hover:!shadow-[0_6px_25px_-2px_rgba(0,0,0,0.12),0_3px_10px_-1px_rgba(0,0,0,0.05)]
                    prose-li:!transform prose-li:hover:!scale-[1.01] prose-li:hover:!-translate-y-0.5
                    prose-li:!transition-all prose-li:!duration-300 prose-li:!ease-out
                    prose-li:!relative
                    prose-li:!border-2 prose-li:!border-gray-200
                    prose-li:hover:!border-blue-300/50
                    prose-li:before:!content-['✓'] prose-li:before:!absolute prose-li:before:!left-3.5
                    prose-li:before:!top-1/2 prose-li:before:!-translate-y-1/2
                    prose-li:before:!text-blue-600 prose-li:before:!font-black prose-li:before:!text-base
                    prose-li:before:!bg-gradient-to-br prose-li:before:!from-blue-100 prose-li:before:!to-blue-200
                    prose-li:before:!w-6 prose-li:before:!h-6 prose-li:before:!rounded-full
                    prose-li:before:!flex prose-li:before:!items-center prose-li:before:!justify-center
                    prose-li:before:!shadow-sm
                    prose-li:after:!content-[''] prose-li:after:!absolute prose-li:after:!inset-0
                    prose-li:after:!rounded-2xl prose-li:after:!bg-gradient-to-r
                    prose-li:after:!from-blue-500/0 prose-li:after:!to-purple-500/0
                    prose-li:after:hover:!from-blue-500/[0.015] prose-li:after:hover:!to-purple-500/[0.015]
                    prose-li:after:!transition-all prose-li:after:!duration-300
                    prose-li:after:!-z-10
                    
                    /* 有序列表 */
                    prose-ol:my-8 prose-ol:space-y-4
                    prose-ol:counter-reset-[item]
                    
                    /* 表格 - 精美置中白色卡片 */
                    prose-table:!my-16 prose-table:!w-full prose-table:!max-w-5xl prose-table:!mx-auto
                    prose-table:!shadow-[0_10px_50px_-10px_rgba(0,0,0,0.2),0_5px_20px_-5px_rgba(0,0,0,0.1)]
                    prose-table:!rounded-3xl prose-table:!overflow-hidden
                    prose-table:!border-separate prose-table:!border-spacing-0
                    prose-table:!bg-white
                    prose-table:!border-[3px] prose-table:!border-gray-200
                    prose-table:hover:!shadow-[0_15px_70px_-10px_rgba(0,0,0,0.3),0_8px_30px_-5px_rgba(0,0,0,0.15)]
                    prose-table:!transition-all prose-table:!duration-500
                    
                    prose-thead:!bg-gradient-to-r prose-thead:!from-blue-600 prose-thead:!via-purple-600 prose-thead:!to-pink-500
                    prose-thead:!relative prose-thead:!shadow-xl
                    prose-thead:before:!content-[''] prose-thead:before:!absolute prose-thead:before:!inset-0
                    prose-thead:before:!bg-gradient-to-r prose-thead:before:!from-white/15 prose-thead:before:!to-transparent
                    prose-thead:after:!content-[''] prose-thead:after:!absolute prose-thead:after:!bottom-0 prose-thead:after:!left-0 
                    prose-thead:after:!w-full prose-thead:after:!h-1 prose-thead:after:!bg-gradient-to-r 
                    prose-thead:after:!from-pink-300 prose-thead:after:!via-purple-300 prose-thead:after:!to-blue-300
                    prose-thead:after:!shadow-lg
                    
                    prose-th:!text-white prose-th:!font-black prose-th:!px-6 prose-th:!py-5 prose-th:!text-center prose-th:!text-base
                    prose-th:!tracking-wide prose-th:!align-middle
                    prose-th:first:!rounded-tl-3xl prose-th:last:!rounded-tr-3xl
                    prose-th:!relative prose-th:!border-r prose-th:!border-white/20 prose-th:last:!border-r-0
                    
                    prose-tbody:!bg-white
                    prose-td:!border-b prose-td:!border-gray-200 prose-td:!px-6 prose-td:!py-5 
                    prose-td:!text-gray-800 prose-td:!font-semibold prose-td:!text-base
                    prose-td:!text-center prose-td:!align-middle
                    prose-td:!border-r prose-td:!border-gray-100 prose-td:last:!border-r-0
                    prose-tr:!transition-all prose-tr:!duration-300 prose-tr:!cursor-default
                    prose-tr:hover:!bg-gradient-to-r prose-tr:hover:!from-blue-50/60 prose-tr:hover:!via-purple-50/40 prose-tr:hover:!to-pink-50/60
                    prose-tr:!relative
                    prose-tr:even:!bg-gray-50/50
                    prose-tr:last:!border-b-0
                    
                    /* 分隔線 - 漸層彩虹 */
                    prose-hr:my-16 prose-hr:border-0 prose-hr:h-2
                    prose-hr:bg-gradient-to-r prose-hr:from-blue-500 prose-hr:via-purple-500 prose-hr:to-pink-500
                    prose-hr:rounded-full prose-hr:shadow-lg
                    
                    /* 引用區塊 - 白色卡片 */
                    prose-blockquote:!border-l-[6px] prose-blockquote:!border-purple-500
                    prose-blockquote:!bg-white
                    prose-blockquote:!p-8 prose-blockquote:!my-10 prose-blockquote:!rounded-3xl 
                    prose-blockquote:!shadow-[0_6px_30px_-6px_rgba(0,0,0,0.12),0_3px_12px_-3px_rgba(0,0,0,0.06)]
                    prose-blockquote:hover:!shadow-[0_12px_50px_-6px_rgba(0,0,0,0.18),0_6px_20px_-3px_rgba(0,0,0,0.08)]
                    prose-blockquote:!italic prose-blockquote:!text-gray-800 prose-blockquote:!text-lg
                    prose-blockquote:!relative
                    prose-blockquote:!border prose-blockquote:!border-gray-100/70
                    prose-blockquote:hover:!border-purple-200/60
                    prose-blockquote:!transition-all prose-blockquote:!duration-500
                    prose-blockquote:before:!content-['❝'] prose-blockquote:before:!absolute prose-blockquote:before:!top-4 
                    prose-blockquote:before:!left-4 prose-blockquote:before:!text-6xl prose-blockquote:before:!text-purple-300/40 
                    prose-blockquote:after:!content-[''] prose-blockquote:after:!absolute prose-blockquote:after:!inset-0
                    prose-blockquote:after:!rounded-3xl prose-blockquote:after:!bg-gradient-to-br
                    prose-blockquote:after:!from-purple-500/0 prose-blockquote:after:!to-pink-500/0
                    prose-blockquote:after:hover:!from-purple-500/[0.03] prose-blockquote:after:hover:!to-pink-500/[0.03]
                    prose-blockquote:after:!transition-all prose-blockquote:after:!duration-500
                    prose-blockquote:after:!-z-10
                    
                    /* 代碼 */
                    prose-code:text-purple-700 prose-code:bg-purple-100 prose-code:px-3 prose-code:py-1.5
                    prose-code:rounded-lg prose-code:font-mono prose-code:font-bold prose-code:text-sm
                    prose-code:border-2 prose-code:border-purple-300 prose-code:shadow-md
                    
                    /* 連結 */
                    prose-a:text-blue-600 prose-a:font-bold prose-a:underline 
                    prose-a:decoration-2 prose-a:decoration-blue-400 prose-a:underline-offset-4
                    prose-a:hover:text-purple-600 prose-a:hover:decoration-purple-400
                    prose-a:transition-all prose-a:duration-300
                    prose-a:hover:scale-105 prose-a:inline-block">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {analysisResult.report}
                    </ReactMarkdown>
                  </div>
              </div>
              </div>
              
              {/* 底部裝飾條 */}
              <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500"></div>
            </div>
          </div>

          {/* 重新分析按鈕 */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              開始新的分析
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SmartExplorationPage;
