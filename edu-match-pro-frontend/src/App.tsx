import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import ImpactStoriesPage from './pages/ImpactStoriesPage';
import NeedDetailPage from './pages/NeedDetailPage';
import SchoolDashboardPage from './pages/SchoolDashboardPage';
import CompanyDashboardPage from './pages/CompanyDashboardPage';
import CreateNeedPage from './pages/CreateNeedPage';
import EditNeedPage from './pages/EditNeedPage';
import MyNeedsPage from './pages/MyNeedsPage';
import MyDonationsPage from './pages/MyDonationsPage';
import ExploreNeedsPage from './pages/ExploreNeedsPage';
import SmartExplorationPage from './pages/SmartExplorationPage';
import ProfilePage from './pages/ProfilePage';
import AllNeedsPage from './pages/AllNeedsPage';
import LoginPage from './pages/LoginPage';
import ForSchoolsPage from './pages/ForSchoolsPage';
import ForCompaniesPage from './pages/ForCompaniesPage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        {/* 使用 MainLayout 的路由 */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="stories" element={<ImpactStoriesPage />} />
          <Route path="needs" element={<AllNeedsPage />} />
          <Route path="needs/:needId" element={<NeedDetailPage />} />
          <Route path="for-schools" element={<ForSchoolsPage />} />
          <Route path="for-companies" element={<ForCompaniesPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
        
        {/* 受保護的儀表板路由 */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="school" element={<SchoolDashboardPage />} />
            <Route path="company" element={<CompanyDashboardPage />} />
            <Route path="my-donations" element={<MyDonationsPage />} />
            <Route path="smart-exploration" element={<SmartExplorationPage />} />
            <Route path="explore-needs" element={<ExploreNeedsPage />} />
            <Route path="create-need" element={<CreateNeedPage />} />
            <Route path="edit-need/:needId" element={<EditNeedPage />} />
            <Route path="my-needs" element={<MyNeedsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
        
        {/* 獨立路由 (不需要 MainLayout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ErrorBoundary>
  );
}

export default App;
