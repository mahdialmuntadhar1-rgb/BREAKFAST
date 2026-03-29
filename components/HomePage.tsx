import React from 'react';
import { HeroSection } from './HeroSection';
import { StoriesRing } from './StoriesRing';
import { CategoriesSection } from './CategoriesSection';
import { BusinessGridSection } from './BusinessGridSection';
import { SearchSection } from './SearchSection';
import { FeaturedSection } from './FeaturedSection';
import { PersonalizedEvents } from './PersonalizedEvents';
import { DealsMarketplace } from './DealsMarketplace';
import { CommunityStories } from './CommunityStories';
import { CityGuide } from './CityGuide';
import { InclusiveFeatures } from './InclusiveFeatures';
import { FooterSection } from './FooterSection';
import { useTranslations } from '../hooks/useTranslations';
import type { Post, Category } from '../types';

interface HomePageProps {
  posts: Post[];
  isSocialLoading: boolean;
  isLoggedIn: boolean;
  onCategoryClick: (category: Category) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onSearch: (query: string) => void;
  selectedGovernorate: string;
  onGovernorateChange: (gov: string) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  posts,
  isSocialLoading,
  isLoggedIn,
  onCategoryClick,
  currentPage,
  setCurrentPage,
  onSearch,
  selectedGovernorate,
  onGovernorateChange,
  highContrast,
  setHighContrast,
}) => {
  const { t } = useTranslations();

  const SectionIntro = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="container mx-auto px-4 mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <p className="text-white/55 text-sm mt-2">{subtitle}</p>
      </div>
      <button className="text-primary hover:text-secondary transition-colors text-sm cursor-pointer">See all</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-primary/30 selection:text-white">
      <HeroSection />
      <StoriesRing />
      
      <SectionIntro title="Trending categories" subtitle="Start with what people across Iraq are searching for most." />
      <CategoriesSection 
        onCategoryClick={onCategoryClick} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="container mx-auto px-4 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <BusinessGridSection 
                posts={posts} 
                isLoading={isSocialLoading} 
                isLoggedIn={isLoggedIn} 
              />
              
              <SearchSection 
                onSearch={onSearch} 
                selectedGovernorate={selectedGovernorate}
                onGovernorateChange={onGovernorateChange}
              />
          </div>
      </div>

      <SectionIntro title="Featured businesses" subtitle="Premium picks updated daily from trusted local brands." />
      <FeaturedSection />
      
      <div className="space-y-32 py-24">
        <SectionIntro title="Events" subtitle="Don’t miss upcoming gatherings around your city." />
        <PersonalizedEvents />
        <SectionIntro title="Deals" subtitle="Best offers tailored for where you are browsing." />
        <DealsMarketplace />
        <CommunityStories />
        <CityGuide />
      </div>

      <InclusiveFeatures highContrast={highContrast} setHighContrast={setHighContrast} />
      
      <FooterSection />
    </div>
  );
};

