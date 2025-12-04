import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const ForSchoolsPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: "使用平台需要付費嗎？",
      answer: "完全免費！我們相信教育不應該有門檻。平台由企業贊助運營，學校刊登需求、媒合資源、接收捐贈，通通不需要任何費用。我們只專注於一件事：讓每個孩子都能擁有最好的學習資源。"
    },
    {
      question: "如何寫出吸引人的需求描述？",
      answer: "告訴我們您的故事！例如：『我們是南投山區的小學，孩子們對電腦課充滿期待，但學校只有 3 台 10 年前的舊電腦。希望能有 15 台筆記型電腦，讓每個孩子都能親手操作，體驗數位學習的樂趣。』越具體、越有溫度，越容易打動企業夥伴。"
    },
    {
      question: "多久能收到回應？",
      answer: "通常 1-3 天內就會有企業主動聯繫！我們的 AI 會即時比對您的需求與企業的 ESG 目標，並推播給最合適的捐贈方。許多老師都說，沒想到這麼快就有人願意幫忙。"
    },
    {
      question: "如何確保捐贈的真實性？",
      answer: "我們會嚴格驗證所有企業身份，並提供完整的媒合記錄。您可以透過平台直接與企業溝通，確認細節後再進行捐贈。每一筆捐贈都有透明追蹤，讓您安心收穫每一份愛心。"
    },
    {
      question: "如果沒有企業願意捐贈怎麼辦？",
      answer: "別擔心！我們會持續為您推廣需求，並提供優化建議。許多成功案例都是經過幾次調整後才找到合適的企業夥伴。我們相信，每個孩子的需求都值得被看見。"
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            讓每個孩子，都能擁有最好的學習資源
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            您專心教學，我們幫您找資源。簡單三步驟，讓您的教育夢想不再受限於資源不足。
          </p>
          <Link 
            to="/dashboard/create-need"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            立即刊登需求
          </Link>
        </div>
      </motion.div>

      {/* Steps Section */}
      <motion.div 
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">輕鬆刊登</h3>
            <p className="text-gray-600 leading-relaxed">
              3 分鐘完成刊登！告訴我們您的需求：是電腦設備、體育器材，還是教學資源？我們用最簡單的方式，讓您的聲音被聽見。
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">智慧媒合</h3>
            <p className="text-gray-600 leading-relaxed">
              AI 幫您找到最合適的企業夥伴！我們會根據您的需求，精準匹配有相同理念的企業，讓愛心資源快速到位。
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">資源到位</h3>
            <p className="text-gray-600 leading-relaxed">
              直接與企業夥伴溝通，確認細節後資源送達學校。全程透明追蹤，讓您安心收穫每一份愛心。
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            老師們的常見問題
          </h2>
          
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div 
                    className="px-6 pb-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForSchoolsPage;
