import { motion } from 'framer-motion';
import {
  HeartIcon,
  UserGroupIcon,
  LightBulbIcon,
  TagIcon,
  TrophyIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const AboutPage = () => {
  const teamMembers = [
    {
      name: "范愷鈞",
      role: "角色與描述留白",
      description: "致力於用科技改變教育現況",
      avatar: `/images/team/member-1.jpg`
    },
    {
      name: "劉竑毅",
      role: "角色與描述留白",
      description: "致力於用科技改變教育現況",
      avatar: `/images/team/member-2.jpg`
    },
    {
      name: "史靖崴",
      role: "角色與描述留白",
      description: "致力於用科技改變教育現況",
      avatar: `/images/team/member-3.jpg`
    }
  ];

  const missionValues = [
    {
      icon: ShieldCheckIcon,
      title: "透明",
      description: "每一筆捐贈都公開透明，讓愛心看得見",
      color: "blue"
    },
    {
      icon: BoltIcon,
      title: "高效",
      description: "AI 精準媒合，讓資源快速到達需要的地方",
      color: "green"
    },
    {
      icon: GlobeAltIcon,
      title: "永續",
      description: "建立長期夥伴關係，持續創造教育價值",
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div
        className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-teal-900/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.h1
            className="text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            我們相信，科技的最大價值，在於創造公平。
          </motion.h1>
          <motion.p
            className="text-xl opacity-90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            透過 AI 技術與數據分析，我們致力於縮小城鄉教育資源差距，讓每個孩子都有公平的學習機會。
          </motion.p>
        </div>
      </motion.div>

      {/* Our Story Section */}
      <motion.div
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏫</div>
                <div className="text-gray-600">偏鄉學校實地訪查</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">一個改變的信念</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                在台灣的許多角落，教室裡的孩子們眼中閃爍著同樣對知識的渴望，但他們眼前的螢幕，卻可能隔著一個世代的距離。我們看見了這道資源的鴻溝，它不該是限制任何孩子夢想的邊界。
              </p>
              <p>
                「為什麼同樣努力，機會卻不均等？」這個問題，是我們行動的起點。我們相信，科技不應是加劇差距的工具，而應是鋪平道路的橋樑。
              </p>
              <p>
                於是，「智匯偏鄉」誕生了。我們不是旁觀者，而是搭建者。我們用 AI 技術分析真實的需求，用數據驅動每一次資源的流動，用科技的力量，將企業的善意精準地送達最需要的地方。我們正在做的，就是確保每個孩子，無論身在何處，都能在平等的起跑線上，勇敢追逐自己的夢想。
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        className="bg-blue-600 text-white py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              我們的使命
            </motion.h2>
            <motion.p
              className="text-xl opacity-90 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              我們相信，每個孩子都值得最好的教育。透過科技的力量，我們要讓台灣的每一間學校、每一個孩子，都能擁有平等的學習機會，點亮屬於他們的未來。
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {missionValues.map((value, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className={`w-16 h-16 bg-${value.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <value.icon className={`w-8 h-8 text-${value.color}-600`} />
                </div>
                <h3 className="text-2xl font-bold mb-2">{value.title}</h3>
                <p className="text-blue-200">{value.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-lg opacity-90 max-w-4xl mx-auto leading-relaxed">
              我們相信，真正的教育公平不是讓每個人都擁有相同的資源，而是讓每個人都能獲得最適合的資源。透過 AI 技術的深度分析，我們能夠精準識別每個學校的實際需求，並將其與最合適的企業 ESG 目標進行媒合，創造最大的社會價值。
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">幕後推手</h2>
          <p className="text-gray-600">一群懷抱理想、致力於改變教育現況的專業團隊</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <img
                className="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
                src={member.avatar}
                alt={member.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="text-6xl mb-4 hidden" style={{ display: 'none' }}>👤</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-blue-600 font-semibold mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Impact Section */}
      <motion.div
        className="bg-gray-900 text-white py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              我們的影響力
            </motion.h2>
            <motion.p
              className="text-xl text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              用數據說話，用行動證明
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="text-4xl font-bold mb-2 text-blue-400">300+</div>
              <div className="text-gray-300">偏鄉學校</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-4xl font-bold mb-2 text-green-400">500+</div>
              <div className="text-gray-300">合作企業</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-4xl font-bold mb-2 text-purple-400">1,200+</div>
              <div className="text-gray-300">成功媒合</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-4xl font-bold mb-2 text-orange-400">95%</div>
              <div className="text-gray-300">滿意度</div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
