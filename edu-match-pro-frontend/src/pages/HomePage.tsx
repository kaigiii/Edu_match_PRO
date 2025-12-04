import { useApiState, ApiStateRenderer } from '../hooks/useApiState';
import { API_ENDPOINTS } from '../config/api';
import type { SchoolNeed } from '../types';

// 匯入我們剛剛創建的所有區塊元件
import HeroSection from './HomePage/HeroSection';
import MapSection from './HomePage/MapSection';
import ValueSection from './HomePage/ValueSection';
import SolutionSection from './HomePage/SolutionSection';
import NeedsCarousel from './HomePage/NeedsCarousel';
import CtaSection from './HomePage/CtaSection';

const HomePage = () => {
  const state = useApiState<SchoolNeed[]>({
    url: API_ENDPOINTS.SCHOOL_NEEDS
  });

  return (
    <div className="relative">
      <HeroSection />
      <MapSection />
      <ValueSection />
      <SolutionSection />
      <ApiStateRenderer state={state}>
        {(needs) => <NeedsCarousel needs={needs} />}
      </ApiStateRenderer>
      <CtaSection />
    </div>
  );
};

export default HomePage;