import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen">
      {/* 側邊欄 */}
      <aside className="w-64 bg-gray-900 text-white shadow-xl">
        {/* 頂部品牌列，貼齊最上緣 */}
        <div className="bg-white px-6 py-4">
          <Link to="/" className="block text-xl font-bold text-gray-900 leading-tight">
            <span className="block">智匯偏鄉</span>
            <span className="block">Edu match PRO</span>
          </Link>
        </div>
        <div className="p-6">
          <nav className="space-y-2">
            {/* 根據用戶角色顯示不同的導航連結 */}
            {userRole === 'school' ? (
              <>
                <Link to="/dashboard/school" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors text-white font-medium hover:text-white">
                  總覽
                </Link>
                <Link to="/dashboard/create-need" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors text-white font-medium hover:text-white">
                  刊登新需求
                </Link>
                <Link to="/dashboard/my-needs" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors text-white font-medium hover:text-white">
                  我的需求
                </Link>
              </>
            ) : userRole === 'company' ? (
              <>
                <Link to="/dashboard/company" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors text-white font-medium hover:text-white">
                  總覽
                </Link>
                <Link to="/dashboard/my-donations" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors text-white font-medium hover:text-white">
                  我的捐贈
                </Link>
                <Link to="/dashboard/smart-exploration" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors text-white font-medium hover:text-white">
                  智慧探索
                </Link>
                <Link to="/dashboard/explore-needs" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors text-white font-medium hover:text-white">
                  探索需求
                </Link>
              </>
            ) : null}
            
            {/* 通用連結 */}
            <Link to="/dashboard/profile" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors text-white font-medium hover:text-white">
              個人檔案
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full text-left block py-2 px-4 rounded hover:bg-gray-700 transition-colors text-red-300 hover:text-red-200 font-medium"
            >
              登出
            </button>
          </nav>
        </div>
      </aside>

      {/* 主內容區 */}
      <div className="flex-grow overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
