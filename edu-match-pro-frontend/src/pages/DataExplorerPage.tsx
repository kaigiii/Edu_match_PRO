import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/apiService';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
      active
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface SortableHeaderProps {
  label: string;
  field: string;
  sortConfig: SortConfig | null;
  onSort: (field: string) => void;
  align?: 'left' | 'right';
  hoverColor?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  label, 
  field, 
  sortConfig, 
  onSort,
  align = 'left',
  hoverColor = 'hover:bg-blue-700'
}) => (
  <th 
    onClick={() => onSort(field)}
    className={`px-6 py-4 text-${align} text-xs font-semibold text-white uppercase tracking-wider cursor-pointer ${hoverColor} transition-all select-none`}
  >
    <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
      <span>{label}</span>
      <span className="text-white opacity-80">
        {sortConfig?.field === field ? (
          sortConfig.direction === 'asc' ? '▲' : '▼'
        ) : (
          <span className="opacity-40">⇅</span>
        )}
      </span>
    </div>
  </th>
);

const DataExplorerPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  // 偏鄉學校資料
  const [farawaySchools, setFarawaySchools] = useState<any[]>([]);
  const [farawayAllData, setFarawayAllData] = useState<any[]>([]); // 儲存所有原始數據
  const [farawayFilters, setFarawayFilters] = useState({ 
    year: '',
    county: '', 
    school_name: '',
    branch_name: '',
    area_type: '',
    classes: '',
    students: ''
  });
  const [farawaySortConfig, setFarawaySortConfig] = useState<SortConfig | null>(null);

  // 教育統計資料
  const [eduStats, setEduStats] = useState<any[]>([]);
  const [eduAllData, setEduAllData] = useState<any[]>([]);
  const [eduFilters, setEduFilters] = useState({ 
    year: '',
    county: '',
    kindergarten: '',
    elementary: '',
    junior: '',
    senior: ''
  });
  const [eduSortConfig, setEduSortConfig] = useState<SortConfig | null>(null);

  // 電腦設備資料
  const [devices, setDevices] = useState<any[]>([]);
  const [devicesAllData, setDevicesAllData] = useState<any[]>([]);
  const [devicesFilters, setDevicesFilters] = useState({ 
    county: '', 
    township: '',
    school_name: '',
    computers: ''
  });
  const [devicesSortConfig, setDevicesSortConfig] = useState<SortConfig | null>(null);

  // 志工團隊資料
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [volunteersAllData, setVolunteersAllData] = useState<any[]>([]);
  const [volunteersFilters, setVolunteersFilters] = useState({ 
    year: '',
    county: '', 
    service_unit: '',
    volunteer_school: ''
  });
  const [volunteersSortConfig, setVolunteersSortConfig] = useState<SortConfig | null>(null);

  // 載入統計資料
  useEffect(() => {
    loadStatistics();
  }, []);

  // 當切換 Tab 時載入資料
  useEffect(() => {
    loadData();
  }, [currentTab]);

  // 自動篩選 - 偏鄉學校
  useEffect(() => {
    if (farawayAllData.length > 0 && currentTab === 0) {
      let filtered = [...farawayAllData];
      if (farawayFilters.year) {
        filtered = filtered.filter(item => String(item.學年度)?.includes(farawayFilters.year));
      }
      if (farawayFilters.county) {
        filtered = filtered.filter(item => item.縣市名稱?.includes(farawayFilters.county));
      }
      if (farawayFilters.school_name) {
        filtered = filtered.filter(item => item.本校名稱?.includes(farawayFilters.school_name));
      }
      if (farawayFilters.branch_name) {
        filtered = filtered.filter(item => item.分校分班名稱?.includes(farawayFilters.branch_name));
      }
      if (farawayFilters.area_type) {
        filtered = filtered.filter(item => item.地區屬性?.includes(farawayFilters.area_type));
      }
      if (farawayFilters.classes) {
        filtered = filtered.filter(item => String(item.班級數)?.includes(farawayFilters.classes));
      }
      if (farawayFilters.students) {
        const studentCount = (item: any) => (item.男學生數 || 0) + (item.女學生數 || 0);
        filtered = filtered.filter(item => String(studentCount(item))?.includes(farawayFilters.students));
      }
      setFarawaySchools(filtered);
    }
  }, [farawayFilters, farawayAllData, currentTab]);

  // 自動篩選 - 教育統計
  useEffect(() => {
    if (eduAllData.length > 0 && currentTab === 1) {
      let filtered = [...eduAllData];
      if (eduFilters.year) {
        filtered = filtered.filter(item => String(item.學年度)?.includes(eduFilters.year));
      }
      if (eduFilters.county) {
        filtered = filtered.filter(item => item.縣市別?.includes(eduFilters.county));
      }
      if (eduFilters.kindergarten) {
        filtered = filtered.filter(item => String(item.幼兒園)?.includes(eduFilters.kindergarten));
      }
      if (eduFilters.elementary) {
        filtered = filtered.filter(item => String(item.國小)?.includes(eduFilters.elementary));
      }
      if (eduFilters.junior) {
        filtered = filtered.filter(item => String(item.國中)?.includes(eduFilters.junior));
      }
      if (eduFilters.senior) {
        filtered = filtered.filter(item => String(item.高中普通科)?.includes(eduFilters.senior));
      }
      setEduStats(filtered);
    }
  }, [eduFilters, eduAllData, currentTab]);

  // 自動篩選 - 電腦設備
  useEffect(() => {
    if (devicesAllData.length > 0 && currentTab === 2) {
      let filtered = [...devicesAllData];
      if (devicesFilters.county) {
        filtered = filtered.filter(item => item.縣市?.includes(devicesFilters.county));
      }
      if (devicesFilters.township) {
        filtered = filtered.filter(item => item.鄉鎮市區?.includes(devicesFilters.township));
      }
      if (devicesFilters.school_name) {
        filtered = filtered.filter(item => item.學校名稱?.includes(devicesFilters.school_name));
      }
      if (devicesFilters.computers) {
        filtered = filtered.filter(item => String(item.教學電腦數)?.includes(devicesFilters.computers));
      }
      setDevices(filtered);
    }
  }, [devicesFilters, devicesAllData, currentTab]);

  // 自動篩選 - 志工團隊
  useEffect(() => {
    if (volunteersAllData.length > 0 && currentTab === 3) {
      let filtered = [...volunteersAllData];
      if (volunteersFilters.year) {
        filtered = filtered.filter(item => String(item.年度)?.includes(volunteersFilters.year));
      }
      if (volunteersFilters.county) {
        filtered = filtered.filter(item => item.縣市?.includes(volunteersFilters.county));
      }
      if (volunteersFilters.service_unit) {
        filtered = filtered.filter(item => item.受服務單位?.includes(volunteersFilters.service_unit));
      }
      if (volunteersFilters.volunteer_school) {
        filtered = filtered.filter(item => item.志工團隊學校?.includes(volunteersFilters.volunteer_school));
      }
      setVolunteers(filtered);
    }
  }, [volunteersFilters, volunteersAllData, currentTab]);

  const loadStatistics = async () => {
    try {
      const stats = await apiService.getDataStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('載入統計資料失敗:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (currentTab) {
        case 0: // 偏鄉學校
          const farawayData = await apiService.getFarawaySchools({
            page: 1,
            limit: 10000, // 一次加載所有數據
          });
          setFarawayAllData(farawayData.data || []);
          setFarawaySchools(farawayData.data || []);
          break;
          
        case 1: // 教育統計
          const eduData = await apiService.getEducationStatistics({
            page: 1,
            limit: 10000,
          });
          setEduAllData(eduData.data || []);
          setEduStats(eduData.data || []);
          break;
          
        case 2: // 電腦設備
          const devicesData = await apiService.getConnectedDevices({
            page: 1,
            limit: 10000,
          });
          setDevicesAllData(devicesData.data || []);
          setDevices(devicesData.data || []);
          break;
          
        case 3: // 志工團隊
          const volunteersData = await apiService.getVolunteerTeams({
            page: 1,
            limit: 10000,
          });
          setVolunteersAllData(volunteersData.data || []);
          setVolunteers(volunteersData.data || []);
          break;
      }
    } catch (err: any) {
      setError(err.message || '載入資料失敗');
    } finally {
      setLoading(false);
    }
  };


  // 排序處理函數
  const handleSort = (field: string, currentSort: SortConfig | null, setSort: (config: SortConfig | null) => void, data: any[], setData: (data: any[]) => void) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (currentSort?.field === field && currentSort.direction === 'asc') {
      direction = 'desc';
    }
    
    const sortedData = [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      // 處理空值
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      // 處理數字和字串
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setSort({ field, direction });
    setData(sortedData);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              📊 教育資料探索平台
            </h1>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              探索臺灣教育資料，包含偏鄉學校、教育統計、電腦設備及志工服務等資訊
            </p>
          </motion.div>
        </div>
      </div>

      {/* 統計卡片 */}
      {statistics && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🏫</span>
                <h3 className="text-lg font-semibold">偏鄉學校</h3>
              </div>
              <p className="text-3xl font-bold">{statistics.faraway_schools?.total_records || 0}</p>
              <p className="text-sm text-blue-100 mt-1">{statistics.faraway_schools?.counties || 0} 個縣市</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📈</span>
                <h3 className="text-lg font-semibold">教育統計</h3>
              </div>
              <p className="text-3xl font-bold">{statistics.education_statistics?.total_records || 0}</p>
              <p className="text-sm text-green-100 mt-1">筆資料</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">💻</span>
                <h3 className="text-lg font-semibold">電腦設備</h3>
              </div>
              <p className="text-3xl font-bold">{statistics.connected_devices?.total_records || 0}</p>
              <p className="text-sm text-purple-100 mt-1">{statistics.connected_devices?.counties || 0} 個縣市</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">👥</span>
                <h3 className="text-lg font-semibold">志工團隊</h3>
              </div>
              <p className="text-3xl font-bold">{statistics.volunteer_teams?.volunteer_schools || 0}</p>
              <p className="text-sm text-orange-100 mt-1">個志工學校</p>
            </motion.div>
          </div>
        </div>
      )}

      {/* 數據介紹區塊 - 根據當前 Tab 顯示 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentTab === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-2xl">
                🏫
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">偏鄉教育現況數據</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  這份資料涵蓋全台灣偏遠、特偏及非山非市地區的學校分布情況。透過了解各地區學校的班級數、學生數等資訊，
                  我們能更精準地識別教育資源需求，為偏鄉學童提供更好的學習環境。
                </p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-600">涵蓋 <span className="font-semibold text-blue-700">{farawayAllData.length}</span> 所學校</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span className="text-gray-600">包含特偏、偏遠、非山非市等地區</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="text-gray-600">即時更新教育部資料</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentTab === 1 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">全國教育機構統計數據</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  完整記錄全國各縣市的教育機構數量，從幼兒園到高中普通科，系統性地呈現台灣教育體系的分布狀況。
                  這些數據有助於了解各地教育資源配置，評估教育發展均衡性，為教育政策制定提供重要參考依據。
                </p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600">統計 <span className="font-semibold text-green-700">{eduAllData.length}</span> 筆縣市資料</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-gray-600">涵蓋幼兒園至高中階段</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    <span className="text-gray-600">教育部官方統計資料</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentTab === 2 && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-2xl">
                💻
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">教學電腦設備分布資訊</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  詳細記錄全國各級學校的教學電腦設備數量，反映數位教育基礎建設的實際狀況。
                  透過這些數據，我們能夠識別數位落差，協助縮小城鄉教育資源差距，確保每位學童都能享有公平的數位學習機會。
                </p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="text-gray-600">收錄 <span className="font-semibold text-purple-700">{devicesAllData.length}</span> 所學校設備資料</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                    <span className="text-gray-600">涵蓋全國各縣市鄉鎮</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span className="text-gray-600">協助評估數位教育需求</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentTab === 3 && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-2xl">
                🤝
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">資訊志工服務網絡地圖</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  彙整全國資訊志工團隊的服務據點與受服務單位，展現台灣教育志願服務的能量與熱情。
                  這些志工團隊致力於推動數位包容，為偏鄉地區提供資訊教育支援，縮短數位落差，讓愛心與專業連結每一個需要的角落。
                </p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-600">記錄 <span className="font-semibold text-orange-700">{volunteersAllData.length}</span> 組志工服務配對</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className="text-gray-600">串聯志工團隊與服務學校</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                    <span className="text-gray-600">推動數位教育公益行動</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 主內容區 */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab 導航 */}
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border-b">
            <TabButton
              active={currentTab === 0}
              onClick={() => setCurrentTab(0)}
              icon="🏫"
              label="偏鄉學校"
            />
            <TabButton
              active={currentTab === 1}
              onClick={() => setCurrentTab(1)}
              icon="📈"
              label="教育統計"
            />
            <TabButton
              active={currentTab === 2}
              onClick={() => setCurrentTab(2)}
              icon="💻"
              label="電腦設備"
            />
            <TabButton
              active={currentTab === 3}
              onClick={() => setCurrentTab(3)}
              icon="👥"
              label="志工團隊"
            />
          </div>

          {/* Tab 內容 */}
          <div className="p-6">
            {/* 偏鄉學校 */}
            {currentTab === 0 && (
              <div>
                {/* 篩選區域 - 即時篩選，順序對應表格欄位 */}
                <div className="mb-4 grid grid-cols-7 gap-3">
                  <input
                    type="text"
                    placeholder="學年度"
                    value={farawayFilters.year}
                    onChange={(e) => setFarawayFilters({ ...farawayFilters, year: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="縣市"
                    value={farawayFilters.county}
                    onChange={(e) => setFarawayFilters({ ...farawayFilters, county: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="學校名稱"
                    value={farawayFilters.school_name}
                    onChange={(e) => setFarawayFilters({ ...farawayFilters, school_name: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="分校分班"
                    value={farawayFilters.branch_name}
                    onChange={(e) => setFarawayFilters({ ...farawayFilters, branch_name: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <select
                    value={farawayFilters.area_type}
                    onChange={(e) => setFarawayFilters({ ...farawayFilters, area_type: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">全部地區</option>
                    <option value="特偏">特偏</option>
                    <option value="偏遠">偏遠</option>
                    <option value="非山非市">非山非市</option>
                  </select>
                  <input
                    type="text"
                    placeholder="班級數"
                    value={farawayFilters.classes}
                    onChange={(e) => setFarawayFilters({ ...farawayFilters, classes: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="學生數"
                    value={farawayFilters.students}
                    onChange={(e) => setFarawayFilters({ ...farawayFilters, students: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                ) : farawaySchools.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有找到符合的資料</h3>
                    <p className="text-gray-600">請嘗試調整篩選條件</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 sticky top-0 z-10">
                          <tr>
                            <SortableHeader 
                              label="學年度" 
                              field="學年度" 
                              sortConfig={farawaySortConfig} 
                              onSort={(field) => handleSort(field, farawaySortConfig, setFarawaySortConfig, farawaySchools, setFarawaySchools)}
                              hoverColor="hover:bg-indigo-700"
                            />
                            <SortableHeader 
                              label="縣市" 
                              field="縣市名稱" 
                              sortConfig={farawaySortConfig} 
                              onSort={(field) => handleSort(field, farawaySortConfig, setFarawaySortConfig, farawaySchools, setFarawaySchools)}
                              hoverColor="hover:bg-indigo-700"
                            />
                            <SortableHeader 
                              label="學校名稱" 
                              field="本校名稱" 
                              sortConfig={farawaySortConfig} 
                              onSort={(field) => handleSort(field, farawaySortConfig, setFarawaySortConfig, farawaySchools, setFarawaySchools)}
                              hoverColor="hover:bg-indigo-700"
                            />
                            <SortableHeader 
                              label="分校分班" 
                              field="分校分班名稱" 
                              sortConfig={farawaySortConfig} 
                              onSort={(field) => handleSort(field, farawaySortConfig, setFarawaySortConfig, farawaySchools, setFarawaySchools)}
                              hoverColor="hover:bg-indigo-700"
                            />
                            <SortableHeader 
                              label="地區屬性" 
                              field="地區屬性" 
                              sortConfig={farawaySortConfig} 
                              onSort={(field) => handleSort(field, farawaySortConfig, setFarawaySortConfig, farawaySchools, setFarawaySchools)}
                              hoverColor="hover:bg-indigo-700"
                            />
                            <SortableHeader 
                              label="班級數" 
                              field="班級數" 
                              sortConfig={farawaySortConfig} 
                              onSort={(field) => handleSort(field, farawaySortConfig, setFarawaySortConfig, farawaySchools, setFarawaySchools)}
                              align="right"
                              hoverColor="hover:bg-indigo-700"
                            />
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-all">學生數</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {farawaySchools.map((row: any, index: number) => (
                            <tr key={index} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{row.學年度}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{row.縣市名稱}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.本校名稱}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{row.分校分班名稱 || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  row.地區屬性 === '特偏' ? 'bg-red-100 text-red-800' :
                                  row.地區屬性 === '偏遠' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {row.地區屬性}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 whitespace-nowrap">{row.班級數}</td>
                              <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600 whitespace-nowrap">
                                {((row.男學生數 || 0) + (row.女學生數 || 0)).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 flex justify-between items-center bg-gray-50 rounded-lg px-6 py-4 border border-gray-200">
                      <div className="text-sm text-gray-700">
                        共找到 <span className="font-bold text-blue-600 text-lg">{farawaySchools.length}</span> 筆資料
                      </div>
                      <div className="text-xs text-gray-500">
                        從 {farawayAllData.length} 筆資料中篩選
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 教育統計 */}
            {currentTab === 1 && (
              <div>
                <div className="mb-4 grid grid-cols-6 gap-3">
                  <input
                    type="text"
                    placeholder="學年度"
                    value={eduFilters.year}
                    onChange={(e) => setEduFilters({ ...eduFilters, year: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="縣市別"
                    value={eduFilters.county}
                    onChange={(e) => setEduFilters({ ...eduFilters, county: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="幼兒園"
                    value={eduFilters.kindergarten}
                    onChange={(e) => setEduFilters({ ...eduFilters, kindergarten: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="國小"
                    value={eduFilters.elementary}
                    onChange={(e) => setEduFilters({ ...eduFilters, elementary: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="國中"
                    value={eduFilters.junior}
                    onChange={(e) => setEduFilters({ ...eduFilters, junior: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="高中普通科"
                    value={eduFilters.senior}
                    onChange={(e) => setEduFilters({ ...eduFilters, senior: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                ) : eduStats.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有找到符合的資料</h3>
                    <p className="text-gray-600">請嘗試調整篩選條件</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-green-600 to-emerald-600 sticky top-0 z-10">
                          <tr>
                            <SortableHeader 
                              label="學年度" 
                              field="學年度" 
                              sortConfig={eduSortConfig} 
                              onSort={(field) => handleSort(field, eduSortConfig, setEduSortConfig, eduStats, setEduStats)}
                              hoverColor="hover:bg-emerald-700"
                            />
                            <SortableHeader 
                              label="縣市別" 
                              field="縣市別" 
                              sortConfig={eduSortConfig} 
                              onSort={(field) => handleSort(field, eduSortConfig, setEduSortConfig, eduStats, setEduStats)}
                              hoverColor="hover:bg-emerald-700"
                            />
                            <SortableHeader 
                              label="幼兒園" 
                              field="幼兒園" 
                              sortConfig={eduSortConfig} 
                              onSort={(field) => handleSort(field, eduSortConfig, setEduSortConfig, eduStats, setEduStats)}
                              align="right"
                              hoverColor="hover:bg-emerald-700"
                            />
                            <SortableHeader 
                              label="國小" 
                              field="國小" 
                              sortConfig={eduSortConfig} 
                              onSort={(field) => handleSort(field, eduSortConfig, setEduSortConfig, eduStats, setEduStats)}
                              align="right"
                              hoverColor="hover:bg-emerald-700"
                            />
                            <SortableHeader 
                              label="國中" 
                              field="國中" 
                              sortConfig={eduSortConfig} 
                              onSort={(field) => handleSort(field, eduSortConfig, setEduSortConfig, eduStats, setEduStats)}
                              align="right"
                              hoverColor="hover:bg-emerald-700"
                            />
                            <SortableHeader 
                              label="高中普通科" 
                              field="高中普通科" 
                              sortConfig={eduSortConfig} 
                              onSort={(field) => handleSort(field, eduSortConfig, setEduSortConfig, eduStats, setEduStats)}
                              align="right"
                              hoverColor="hover:bg-emerald-700"
                            />
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {eduStats.map((row: any, index: number) => (
                            <tr key={index} className={`transition-colors hover:bg-green-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{row.學年度}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{row.縣市別}</td>
                              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 whitespace-nowrap">
                                {row.幼兒園?.toLocaleString() || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 whitespace-nowrap">
                                {row.國小?.toLocaleString() || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 whitespace-nowrap">
                                {row.國中?.toLocaleString() || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 whitespace-nowrap">
                                {row.高中普通科?.toLocaleString() || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 flex justify-between items-center bg-gray-50 rounded-lg px-6 py-4 border border-gray-200">
                      <div className="text-sm text-gray-700">
                        共找到 <span className="font-bold text-green-600 text-lg">{eduStats.length}</span> 筆資料
                      </div>
                      <div className="text-xs text-gray-500">
                        從 {eduAllData.length} 筆資料中篩選
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 電腦設備 */}
            {currentTab === 2 && (
              <div>
                <div className="mb-4 grid grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="縣市"
                    value={devicesFilters.county}
                    onChange={(e) => setDevicesFilters({ ...devicesFilters, county: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="鄉鎮市區"
                    value={devicesFilters.township}
                    onChange={(e) => setDevicesFilters({ ...devicesFilters, township: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="學校名稱"
                    value={devicesFilters.school_name}
                    onChange={(e) => setDevicesFilters({ ...devicesFilters, school_name: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="教學電腦數"
                    value={devicesFilters.computers}
                    onChange={(e) => setDevicesFilters({ ...devicesFilters, computers: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                ) : devices.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有找到符合的資料</h3>
                    <p className="text-gray-600">請嘗試調整篩選條件</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-purple-600 to-violet-600 sticky top-0 z-10">
                          <tr>
                            <SortableHeader 
                              label="縣市" 
                              field="縣市" 
                              sortConfig={devicesSortConfig} 
                              onSort={(field) => handleSort(field, devicesSortConfig, setDevicesSortConfig, devices, setDevices)}
                              hoverColor="hover:bg-violet-700"
                            />
                            <SortableHeader 
                              label="鄉鎮市區" 
                              field="鄉鎮市區" 
                              sortConfig={devicesSortConfig} 
                              onSort={(field) => handleSort(field, devicesSortConfig, setDevicesSortConfig, devices, setDevices)}
                              hoverColor="hover:bg-violet-700"
                            />
                            <SortableHeader 
                              label="學校名稱" 
                              field="學校名稱" 
                              sortConfig={devicesSortConfig} 
                              onSort={(field) => handleSort(field, devicesSortConfig, setDevicesSortConfig, devices, setDevices)}
                              hoverColor="hover:bg-violet-700"
                            />
                            <SortableHeader 
                              label="教學電腦數" 
                              field="教學電腦數" 
                              sortConfig={devicesSortConfig} 
                              onSort={(field) => handleSort(field, devicesSortConfig, setDevicesSortConfig, devices, setDevices)}
                              align="right"
                              hoverColor="hover:bg-violet-700"
                            />
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {devices.map((row: any, index: number) => (
                            <tr key={index} className={`transition-colors hover:bg-purple-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{row.縣市}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{row.鄉鎮市區}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.學校名稱}</td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <span className="px-3 py-1 text-sm font-semibold bg-purple-100 text-purple-800 rounded-full">
                                  {row.教學電腦數?.toLocaleString() || 0}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 flex justify-between items-center bg-gray-50 rounded-lg px-6 py-4 border border-gray-200">
                      <div className="text-sm text-gray-700">
                        共找到 <span className="font-bold text-purple-600 text-lg">{devices.length}</span> 筆資料
                      </div>
                      <div className="text-xs text-gray-500">
                        從 {devicesAllData.length} 筆資料中篩選
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 志工團隊 */}
            {currentTab === 3 && (
              <div>
                <div className="mb-4 grid grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="年度"
                    value={volunteersFilters.year}
                    onChange={(e) => setVolunteersFilters({ ...volunteersFilters, year: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="縣市"
                    value={volunteersFilters.county}
                    onChange={(e) => setVolunteersFilters({ ...volunteersFilters, county: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="受服務單位"
                    value={volunteersFilters.service_unit}
                    onChange={(e) => setVolunteersFilters({ ...volunteersFilters, service_unit: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="志工團隊學校"
                    value={volunteersFilters.volunteer_school}
                    onChange={(e) => setVolunteersFilters({ ...volunteersFilters, volunteer_school: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                ) : volunteers.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有找到符合的資料</h3>
                    <p className="text-gray-600">請嘗試調整篩選條件</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-orange-600 to-amber-600 sticky top-0 z-10">
                          <tr>
                            <SortableHeader 
                              label="年度" 
                              field="年度" 
                              sortConfig={volunteersSortConfig} 
                              onSort={(field) => handleSort(field, volunteersSortConfig, setVolunteersSortConfig, volunteers, setVolunteers)}
                              hoverColor="hover:bg-amber-700"
                            />
                            <SortableHeader 
                              label="縣市" 
                              field="縣市" 
                              sortConfig={volunteersSortConfig} 
                              onSort={(field) => handleSort(field, volunteersSortConfig, setVolunteersSortConfig, volunteers, setVolunteers)}
                              hoverColor="hover:bg-amber-700"
                            />
                            <SortableHeader 
                              label="受服務單位" 
                              field="受服務單位" 
                              sortConfig={volunteersSortConfig} 
                              onSort={(field) => handleSort(field, volunteersSortConfig, setVolunteersSortConfig, volunteers, setVolunteers)}
                              hoverColor="hover:bg-amber-700"
                            />
                            <SortableHeader 
                              label="志工團隊學校" 
                              field="志工團隊學校" 
                              sortConfig={volunteersSortConfig} 
                              onSort={(field) => handleSort(field, volunteersSortConfig, setVolunteersSortConfig, volunteers, setVolunteers)}
                              hoverColor="hover:bg-amber-700"
                            />
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {volunteers.map((row: any, index: number) => (
                            <tr key={index} className={`transition-colors hover:bg-orange-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 text-sm font-semibold bg-orange-100 text-orange-800 rounded-full">
                                  {row.年度}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{row.縣市}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.受服務單位}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.志工團隊學校}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 flex justify-between items-center bg-gray-50 rounded-lg px-6 py-4 border border-gray-200">
                      <div className="text-sm text-gray-700">
                        共找到 <span className="font-bold text-orange-600 text-lg">{volunteers.length}</span> 筆資料
                      </div>
                      <div className="text-xs text-gray-500">
                        從 {volunteersAllData.length} 筆資料中篩選
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExplorerPage;
