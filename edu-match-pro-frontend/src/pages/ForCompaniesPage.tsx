import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TagIcon, 
  LinkIcon, 
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
  TrophyIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ForCompaniesPage = () => {
  const partnerLogos = [
    { name: "台積電", logo: "TSMC" },
    { name: "鴻海", logo: "Foxconn" },
    { name: "台塑", logo: "Formosa" },
    { name: "中華電信", logo: "CHT" },
    { name: "統一企業", logo: "Uni-President" },
    { name: "中鋼", logo: "CSC" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              讓您的善心，成為改變台灣教育的力量
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              不只是做公益，更是投資未來。透過精準媒合，讓您的企業資源發揮最大影響力，同時提升品牌形象與員工認同感。
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link 
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                立即加入
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Value Propositions */}
      <motion.div 
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Precision Card */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TagIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI 精準媒合，讓愛心不浪費</h3>
            <p className="text-gray-600 leading-relaxed">
              不再盲目捐贈！我們的 AI 會深度分析您的企業特色與 ESG 目標，精準找到最需要、最適合的學校。讓每一份資源都發揮最大價值，創造真正的改變。
            </p>
          </motion.div>

          {/* Transparency Card */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LinkIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">透明追蹤，讓善行被看見</h3>
            <p className="text-gray-600 leading-relaxed">
              從捐贈到收穫，全程透明記錄。看到孩子們開心的笑容、老師們的感謝信，還有具體的學習成果。每一份愛心都有溫暖的回饋，讓您的善行被更多人看見。
            </p>
          </motion.div>

          {/* Brand Value Card */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">品牌故事，感動人心</h3>
            <p className="text-gray-600 leading-relaxed">
              每一次成功媒合，都是動人的品牌故事。透過我們的影響力故事牆，讓您的善舉感動更多人，建立有溫度、有責任感的企業形象，提升員工認同感與品牌價值。
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="bg-blue-600 text-white py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              
            >
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">合作企業</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              
            >
              <div className="text-4xl font-bold mb-2">1,200+</div>
              <div className="text-blue-200">成功媒合</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              
            >
              <div className="text-4xl font-bold mb-2">300+</div>
              <div className="text-blue-200">偏鄉學校</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              
            >
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">滿意度</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Partners Section */}
      <motion.div 
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">信賴我們的夥伴</h2>
          <p className="text-gray-600">與我們攜手創造社會價值的企業夥伴</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {partnerLogos.map((partner, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-shadow duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BuildingOffice2Icon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-sm font-semibold text-gray-700">{partner.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="bg-gray-900 text-white py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            
          >
            準備開始您的 ESG 旅程？
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            
          >
            加入我們，讓每一次捐贈都成為改變社會的力量
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            
          >
            <Link 
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              立即加入
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForCompaniesPage;
