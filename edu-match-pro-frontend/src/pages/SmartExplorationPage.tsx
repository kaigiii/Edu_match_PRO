import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/apiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReportCard from '../components/ReportCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Helper function to extract report data
const extractReportData = (content: string) => {
  const match = content.match(/```json:report\n([\s\S]*?)\n```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse report JSON", e);
      return null;
    }
  }
  return null;
};

const SmartExplorationPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '您好！我是小匯，智匯偏鄉平台的AI教育公益顧問 👋\n\n我可以協助您規劃偏鄉學校的捐贈策略，並根據平台真實數據為您提供精準建議。\n\n請問您想捐贈什麼物資？或是想幫助哪一區的學校呢？'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  // 簡單生成 Session ID
  const [sessionId] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };



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
      // 調用 AI Agent API
      const response = await apiService.chatWithAgent(userMessage, sessionId);

      // 添加 AI 回應
      setMessages([...newMessages, {
        role: 'assistant',
        content: response.response
      }]);

    } catch (error: any) {
      console.error('AI 處理錯誤:', error);
      let errorMessage = '抱歉，處理您的請求時發生錯誤。';

      if (error.message?.includes('AI 服務不可用') || error.message?.includes('Failed to fetch')) {
        errorMessage = '⚠️ AI 服務暫時不可用。請確認後端服務已啟動。';
      }

      setMessages([...newMessages, {
        role: 'assistant',
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
    // 重新整理頁面以重置 Session
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-100px)] flex flex-col">
      {/* 頁面標題 */}
      <div className="mb-4 flex-none">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
            <SparklesIcon className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">智慧探索</h1>
            <p className="text-gray-600">智匯偏鄉 AI 顧問 - 精準媒合您的教育公益資源</p>
          </div>
          <button
            onClick={handleReset}
            className="ml-auto text-sm text-gray-500 hover:text-purple-600 underline"
          >
            開啟新對話
          </button>
        </div>
      </div>

      {/* 對話區域 */}
      <div className="bg-white rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden border border-gray-100">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && extractReportData(message.content) ? (
                  // Report Card - Full Width, No Container
                  <ReportCard data={extractReportData(message.content)!} />
                ) : (
                  // Regular Message - 85% Width Container
                  <div
                    className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-100 text-gray-900 rounded-tl-none shadow-md'
                      }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none
                        prose-headings:font-bold prose-headings:text-gray-800
                        prose-p:text-gray-700 prose-p:leading-relaxed
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-purple-700 prose-strong:font-bold
                        prose-ul:list-disc prose-ul:pl-4
                        prose-ol:list-decimal prose-ol:pl-4
                        prose-li:my-1
                        prose-blockquote:border-l-4 prose-blockquote:border-purple-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:pr-2 prose-blockquote:rounded-r
                        prose-hr:border-gray-200 prose-hr:my-4
                        prose-code:hidden
                      ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-base">{message.content}</div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-50 rounded-2xl p-4 rounded-tl-none border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-gray-500 text-sm font-medium">小匯正在思考中...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 輸入區域 */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex space-x-3 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              placeholder="輸入您的需求，例如：我想捐贈 100 份早餐給南投的偏鄉學校..."
              className="flex-1 px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !inputValue.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              <span className="hidden sm:inline">發送</span>
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            AI 建議僅供參考，請以學校實際需求為準
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartExplorationPage;
