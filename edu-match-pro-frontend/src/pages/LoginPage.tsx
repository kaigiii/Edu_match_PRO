import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/apiService';
import { demoAuthService } from '../services/demoAuthService';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'form' | 'demo'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'school' as 'school' | 'company'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 調用真實的 API 登入
      const response = await demoAuthService.realLogin(formData.email, formData.password);
      
      if (response.token) {
        // 將 token 存儲到 localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('isDemo', 'false');
        
        // 更新認證狀態
        login(response.user.role);
        
        // 根據角色跳轉到對應的儀表板
        const dashboardPath = response.user.role === 'company' ? '/dashboard/company' : '/dashboard/school';
        navigate(dashboardPath);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || '登入失敗，請檢查您的憑證');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'school' | 'company' | 'rural_school') => {
    setIsLoading(true);
    setError('');

    try {
      // 使用後端模擬登入API
      const response = await demoAuthService.demoLogin(role);
      
      if (response.token) {
        // 將 token 存儲到 localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('isDemo', 'true');
        
        // 更新認證狀態
        login(response.user.role);
        
        // 根據角色跳轉到對應的儀表板
        const dashboardPath = response.user.role === 'company' ? '/dashboard/company' : '/dashboard/school';
        navigate(dashboardPath);
      }
    } catch (err: any) {
      console.error('Demo login error:', err);
      setError(err.message || '模擬登入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              歡迎回來
            </h2>
            <p className="text-gray-600">
              登入到您的智匯偏鄉帳戶
            </p>
          </div>

          {/* Login Type Toggle */}
          <div className="mt-6 flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLoginType('form')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginType === 'form'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              正式登入
            </button>
            <button
              onClick={() => setLoginType('demo')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginType === 'demo'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              模擬登入
            </button>
          </div>

          {/* Form Login */}
          {loginType === 'form' && (
            <motion.form 
              className="mt-8 space-y-6"
              onSubmit={handleFormSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  身份類型
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="school">學校</option>
                  <option value="company">企業</option>
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入您的電子郵件"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  密碼
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="請輸入您的密碼"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '登入中...' : '登入'}
              </button>
            </motion.form>
          )}

          {/* Demo Login */}
          {loginType === 'demo' && (
            <motion.div 
              className="mt-8 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  選擇一個角色進行模擬登入
                </p>
              </div>
              
              <button
                onClick={() => handleDemoLogin('school')}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">學</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">城市學校模擬登入</div>
                    <div className="text-xs opacity-90">台北市立建國中學（演示）</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('rural_school')}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-orange-600 font-bold">鄉</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">偏鄉學校模擬登入</div>
                    <div className="text-xs opacity-90">台東縣太麻里國小（演示）</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('company')}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">企</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">企業模擬登入</div>
                    <div className="text-xs opacity-90">以企業身份體驗平台</div>
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              還沒有帳戶？{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                立即註冊
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
