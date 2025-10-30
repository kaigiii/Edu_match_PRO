import { Link, useNavigate } from 'react-router-dom';
import { useState, Fragment, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Header = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });
  
  // 載入使用者資料
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated) {
        try {
          const response = await apiService.getCurrentUser();
          if (response?.profile?.contact_person) {
            setUserName(response.profile.contact_person);
          } else {
            setUserName(userRole === 'school' ? '使用者' : '使用者');
          }
        } catch (error) {
          console.error('載入使用者資料失敗:', error);
          setUserName(userRole === 'school' ? '使用者' : '使用者');
        }
      }
    };
    loadUserData();
  }, [isAuthenticated, userRole]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItemVariants = {
    hover: { y: -2, color: '#2563eb' },
    tap: { scale: 0.95 }
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-white"
      animate={isScrolled ? 
        { backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : 
        { backgroundColor: 'rgba(255, 255, 255, 1)', backdropFilter: 'blur(0px)', boxShadow: '0 0 0 rgba(0,0,0,0)' }
      }
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center px-4 h-20 transition-all duration-300 relative">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            to="/" 
            className="text-xl font-bold text-neutral-900"
            onClick={() => {
              // 強制滾動到頂部，即使是在同一頁面
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
              setMobileOpen(false);
            }}
          >
            智匯偏鄉 Edu macth PRO
          </Link>
        </motion.div>

        {/* 右側導航項目和使用者選單 */}
        <div className="flex items-center space-x-4 md:space-x-8">
          {/* 行動版漢堡鍵 */}
          <button
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-gray-100 focus:outline-none"
            aria-label="Open main menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>

          {/* 導航項目（桌面版） */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* 我是學校 Dropdown */}
            <Menu as="div" className="relative">
              {({ open }) => (
                <>
                  <Menu.Button className="flex items-center space-x-1 text-neutral-500 hover:text-brand-blue transition-colors">
                    <span>我是學校</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>{({ active }) => (<Link to="/for-schools" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-neutral-500`}>了解運作方式</Link>)}</Menu.Item>
                        {isAuthenticated && userRole === 'school' && (
                          <>
                            <Menu.Item>{({ active }) => (<Link to="/dashboard/create-need" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-neutral-500`}>刊登一個需求</Link>)}</Menu.Item>
                            <Menu.Item>{({ active }) => (<Link to="/dashboard/school" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-neutral-500`}>前往儀表板</Link>)}</Menu.Item>
                          </>
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>

            {/* 我是企業 Dropdown */}
            <Menu as="div" className="relative">
              {({ open }) => (
                <>
                  <Menu.Button className="flex items-center space-x-1 text-neutral-500 hover:text-brand-blue transition-colors">
                    <span>我是企業</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>{({ active }) => (<Link to="/for-companies" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-neutral-500`}>ESG 方案</Link>)}</Menu.Item>
                        {isAuthenticated && userRole === 'company' && (
                          <>
                            <Menu.Item>{({ active }) => (<Link to="/dashboard/company" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-neutral-500`}>前往儀表板</Link>)}</Menu.Item>
                          </>
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>

            <motion.div whileHover={{ y: -2, color: '#3b82f6' }} whileTap={{ scale: 0.95 }}>
              <Link to="/needs" className="text-neutral-500 hover:text-brand-blue transition-colors">需求列表</Link>
            </motion.div>
            <motion.div whileHover={{ y: -2, color: '#3b82f6' }} whileTap={{ scale: 0.95 }}>
              <Link to="/data-explorer" className="text-neutral-500 hover:text-brand-blue transition-colors">資料探索</Link>
            </motion.div>
            <motion.div whileHover={{ y: -2, color: '#3b82f6' }} whileTap={{ scale: 0.95 }}>
              <Link to="/stories" className="text-neutral-500 hover:text-brand-blue transition-colors">影響力故事</Link>
            </motion.div>
            <motion.div whileHover={{ y: -2, color: '#3b82f6' }} whileTap={{ scale: 0.95 }}>
              <Link to="/about" className="text-neutral-500 hover:text-brand-blue transition-colors">關於我們</Link>
          </motion.div>
          </div>

          {/* 使用者選單 */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {isAuthenticated ? (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2">
                <img className="h-8 w-8 rounded-full" src="https://i.pravatar.cc/40" alt="User avatar" />
                <ChevronDownIcon className="w-5 h-5 text-neutral-500" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none right-0 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] overflow-hidden">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-neutral-900 border-b">
                      <p className="font-medium">你好，{userName || (userRole === 'school' ? '使用者' : '使用者')}</p>
                    </div>
                    <Menu.Item>{({ active }) => (<Link to={userRole === 'school' ? '/dashboard/school' : '/dashboard/company'} className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-neutral-500`}>我的儀表板</Link>)}</Menu.Item>
                    <Menu.Item>{({ active }) => (<button onClick={handleLogout} className={`${active ? 'bg-gray-100' : ''} w-full text-left block px-4 py-2 text-sm text-red-600`}>登出</button>)}</Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            ) : (
              <>
              <motion.div whileHover={{ y: -2, color: '#3b82f6' }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="text-neutral-500 hover:text-brand-blue transition-colors font-medium">登入</Link>
                </motion.div>
              <motion.div whileHover={{ y: -2, color: '#3b82f6' }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="text-neutral-500 hover:text-brand-blue transition-colors font-medium">註冊</Link>
              </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 行動版選單內容 */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link to="/for-schools" className="block text-neutral-600 hover:text-brand-blue" onClick={() => setMobileOpen(false)}>我是學校</Link>
            <Link to="/for-companies" className="block text-neutral-600 hover:text-brand-blue" onClick={() => setMobileOpen(false)}>我是企業</Link>
            <Link to="/needs" className="block text-neutral-600 hover:text-brand-blue" onClick={() => setMobileOpen(false)}>需求列表</Link>
            <Link to="/data-explorer" className="block text-neutral-600 hover:text-brand-blue" onClick={() => setMobileOpen(false)}>資料探索</Link>
            <Link to="/stories" className="block text-neutral-600 hover:text-brand-blue" onClick={() => setMobileOpen(false)}>影響力故事</Link>
            <Link to="/about" className="block text-neutral-600 hover:text-brand-blue" onClick={() => setMobileOpen(false)}>關於我們</Link>
            <div className="pt-2 border-t border-gray-100"/>
            {isAuthenticated ? (
              <>
                <Link to={userRole === 'school' ? '/dashboard/school' : '/dashboard/company'} className="block text-neutral-600 hover:text-brand-blue" onClick={() => setMobileOpen(false)}>我的儀表板</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left text-red-600">登出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-neutral-600 hover:text-brand-blue" onClick={() => setMobileOpen(false)}>登入</Link>
                <Link to="/register" className="block text-neutral-600 hover:text-brand-blue" onClick={() => setMobileOpen(false)}>註冊</Link>
              </>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
