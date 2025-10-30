import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  AcademicCapIcon, 
  BuildingOffice2Icon, 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PhoneIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'school' | 'company' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // School fields
    schoolName: '',
    contactPerson: '',
    position: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    // Company fields
    companyName: '',
    taxId: '',
    contactPersonCompany: '',
    positionCompany: '',
    phoneCompany: '',
    addressCompany: '',
    emailCompany: '',
    passwordCompany: ''
  });

  // 學校搜索相關狀態
  const [schools, setSchools] = useState<string[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target as Node)) {
        setShowSchoolDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 獲取學校列表
  const fetchSchools = async (query: string = '') => {
    setIsLoadingSchools(true);
    try {
      const response = await apiService.getSchools(query);
      setSchools(response.schools);
      setFilteredSchools(response.schools);
    } catch (error) {
      console.error('獲取學校列表失敗:', error);
      toast.error('無法載入學校列表');
    } finally {
      setIsLoadingSchools(false);
    }
  };

  // 初始載入學校列表
  useEffect(() => {
    if (userType === 'school') {
      fetchSchools();
    }
  }, [userType]);

  // 搜索學校
  const handleSchoolSearch = (query: string) => {
    setSchoolSearchQuery(query);
    setFormData(prev => ({ ...prev, schoolName: query }));
    
    if (query.length > 0) {
      // 前端過濾
      const filtered = schools.filter(school => 
        school.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSchools(filtered);
      
      // 如果輸入超過 2 個字，觸發後端搜索
      if (query.length >= 2) {
        fetchSchools(query);
      }
    } else {
      setFilteredSchools(schools);
    }
    
    setShowSchoolDropdown(true);
  };

  // 選擇學校
  const handleSchoolSelect = (schoolName: string) => {
    setFormData(prev => ({ ...prev, schoolName }));
    setSchoolSearchQuery(schoolName);
    setShowSchoolDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Email 格式驗證函數
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 準備註冊數據
      const registerData = userType === 'school' 
        ? {
            email: formData.email,
            password: formData.password,
            role: 'school',
            profile: {
              organization_name: formData.schoolName,
              contact_person: formData.contactPerson,
              position: formData.position,
              phone: formData.phone || formData.email,
              address: formData.address || '待補充',
              tax_id: null,
              bio: null,
              avatar_url: null
            }
          }
        : {
            email: formData.emailCompany,
            password: formData.passwordCompany,
            role: 'company',
            profile: {
              organization_name: formData.companyName,
              contact_person: formData.contactPersonCompany,
              position: formData.positionCompany,
              phone: formData.phoneCompany || formData.emailCompany,
              address: formData.addressCompany || '待補充',
              tax_id: formData.taxId || null,
              bio: null,
              avatar_url: null
            }
          };

      // 前端驗證
      if (!isValidEmail(registerData.email)) {
        toast.error('請輸入有效的電子郵件地址');
        setIsLoading(false);
        return;
      }

      if (registerData.password.length < 6) {
        toast.error('密碼長度至少需要 6 個字符');
        setIsLoading(false);
        return;
      }

      // 調用註冊 API
      const response = await apiService.register(registerData);
      
      // 註冊成功
      toast.success('註冊成功！正在跳轉到登入頁面...');
      
      // 延遲跳轉到登入頁面
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('註冊失敗:', error);
      console.error('錯誤詳情:', error?.response);
      
      // 顯示錯誤訊息
      const errorMessage = error?.response?.data?.detail || error?.message || '註冊失敗，請稍後再試';
      toast.error(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
          <div className="text-center text-white p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-6xl mb-6">🎓</div>
              <h2 className="text-3xl font-bold mb-4">每一次援手，都在改變一個未來</h2>
              <p className="text-xl opacity-90">
                加入我們，讓教育資源的分配更加公平，讓每個孩子都有機會發光發熱
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo and Welcome */}
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-blue-600 mb-2">智匯偏鄉 Edu macth PRO</div>
            <h1 className="text-2xl font-bold text-gray-900">歡迎加入智匯偏鄉 Edu macth PRO</h1>
            <p className="text-gray-600 mt-2">請選擇您的身份並完成註冊</p>
          </div>

          {/* User Type Selection */}
          {!userType && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button
                onClick={() => setUserType('school')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center">
                  <AcademicCapIcon className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">我是學校</h3>
                    <p className="text-gray-600">刊登教育資源需求，尋找企業支援</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setUserType('company')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center">
                  <BuildingOffice2Icon className="w-8 h-8 text-orange-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">我是企業</h3>
                    <p className="text-gray-600">實踐 ESG 目標，支援偏鄉教育</p>
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {/* Registration Form */}
          {userType && (
            <motion.form 
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setUserType(null)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← 重新選擇身份
              </button>

              {userType === 'school' ? (
                <>
                  {/* School Form */}
                  <div className="relative" ref={schoolDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      學校名稱 * <span className="text-xs text-gray-500">(可輸入搜索)</span>
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={schoolSearchQuery}
                        onChange={(e) => handleSchoolSearch(e.target.value)}
                        onFocus={() => setShowSchoolDropdown(true)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="搜索或選擇學校名稱..."
                        required
                      />
                      {isLoadingSchools && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* 下拉選單 */}
                    {showSchoolDropdown && filteredSchools.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredSchools.map((school, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSchoolSelect(school)}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                          >
                            <div className="text-sm text-gray-900">{school}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* 無結果提示 */}
                    {showSchoolDropdown && schoolSearchQuery.length > 0 && filteredSchools.length === 0 && !isLoadingSchools && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                        <p className="text-sm text-gray-500 text-center">
                          找不到符合的學校，您可以繼續輸入學校名稱
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      聯絡人姓名 *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="請輸入聯絡人姓名"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      職稱 *
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：教務主任、校長"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      聯絡電話
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="例如：02-2345-6789"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      學校地址
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：台北市中正區重慶南路一段"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      學校電子郵件 *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="name@school.edu.tw"
                        title="請輸入有效的電子郵件地址，例如：name@school.edu.tw"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">請輸入完整的電子郵件地址，例如：teacher@school.edu.tw</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密碼 *
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="請設定密碼"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Company Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公司名稱 *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="請輸入公司名稱"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      統一編號 *
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="請輸入統一編號"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      聯絡人姓名 *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="contactPersonCompany"
                        value={formData.contactPersonCompany}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="請輸入聯絡人姓名"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      職稱 *
                    </label>
                    <input
                      type="text"
                      name="positionCompany"
                      value={formData.positionCompany}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="例如：CSR 經理、永續長"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      聯絡電話
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phoneCompany"
                        value={formData.phoneCompany}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="例如：02-2345-6789"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公司地址
                    </label>
                    <input
                      type="text"
                      name="addressCompany"
                      value={formData.addressCompany}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="例如：台北市信義區信義路五段"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公司電子郵件 *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="emailCompany"
                        value={formData.emailCompany}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="name@company.com"
                        title="請輸入有效的電子郵件地址，例如：name@company.com"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">請輸入完整的電子郵件地址，例如：manager@company.com</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密碼 *
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="passwordCompany"
                        value={formData.passwordCompany}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="請設定密碼"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
                  userType === 'school' 
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400' 
                    : 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400'
                } ${isLoading ? 'cursor-not-allowed' : ''}`}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    註冊中...
                  </div>
                ) : (
                  '完成註冊'
                )}
              </motion.button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  已經有帳號了？{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                    前往登入
                  </Link>
                </p>
              </div>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
