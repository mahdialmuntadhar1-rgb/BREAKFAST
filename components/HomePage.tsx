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

const SectionHeader: React.FC<{ title: string; subtitle: string; cta: string }> = ({ title, subtitle, cta }) => (
  <div className="container mx-auto px-4 mb-8 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
      <p className="text-white/60 mt-2">{subtitle}</p>
    </div>
    <button className="text-sm text-primary hover:text-secondary transition-colors hover:underline cursor-pointer">{cta}</button>
  </div>
);

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
  return (
    <div className="min-h-screen bg-dark-bg selection:bg-primary/30 selection:text-white">
      <HeroSection />
      <StoriesRing />

      <SectionHeader title="Trending categories" subtitle="Explore what people in Iraq are searching for right now." cta="See all" />
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
            selectedGovernorate={selectedGovernorate}
          />

          <SearchSection 
            onSearch={onSearch} 
            selectedGovernorate={selectedGovernorate}
            onGovernorateChange={onGovernorateChange}
          />
        </div>
      </div>

      <SectionHeader title="Featured businesses" subtitle="Premium and verified places worth visiting this week." cta="See all" />
      <FeaturedSection />

      <div className="space-y-28 py-24">
        <div>
          <SectionHeader title="Events" subtitle="Discover upcoming experiences in your area." cta="See all" />
          <PersonalizedEvents selectedGovernorate={selectedGovernorate} />
        </div>
        <div>
          <SectionHeader title="Deals" subtitle="Fresh offers and discounts around your city." cta="See all" />
          <DealsMarketplace selectedGovernorate={selectedGovernorate} />
        </div>
        <div>
          <SectionHeader title="Community stories" subtitle="Real stories shared by people and businesses." cta="See all" />
          <CommunityStories selectedGovernorate={selectedGovernorate} />
        </div>
        <CityGuide />
      </div>

      <InclusiveFeatures highContrast={highContrast} setHighContrast={setHighContrast} />

      <FooterSection />
    </div>
  );
};
