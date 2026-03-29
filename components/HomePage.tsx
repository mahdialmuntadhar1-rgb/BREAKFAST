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

const SectionHeader: React.FC<{ title: string; subtitle: string; cta: string }> = ({ title, subtitle, cta }) => (
  <div className="container mx-auto px-4 mb-8 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{title}</h2>
      <p className="text-white/60 mt-2">{subtitle}</p>
    </div>
    <button className="px-5 py-2.5 rounded-xl border border-white/15 text-white/80 hover:text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all cursor-pointer">
      {cta}
    </button>
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
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-primary/30 selection:text-white">
      <HeroSection />

      <SectionHeader
        title="Trending categories"
        subtitle="Discover what people are exploring right now across Iraq."
        cta="See all"
      />
      <StoriesRing />

      <SectionHeader
        title="Featured businesses"
        subtitle="Top-rated places with premium experiences and trusted quality."
        cta="See all"
      />
      <CategoriesSection
        onCategoryClick={onCategoryClick}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="container mx-auto px-4 py-24 relative">
        <SectionHeader
          title="Recent posts"
          subtitle="Live updates from business owners and local communities."
          cta="See all"
        />
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

      <FeaturedSection />

      <div className="space-y-28 py-20">
        <SectionHeader title="Events" subtitle="What's happening near you this week." cta="See all" />
        <PersonalizedEvents />

        <SectionHeader title="Deals" subtitle="Fresh offers and discounts in your city." cta="See all" />
        <DealsMarketplace />

        <SectionHeader title="Community stories" subtitle="Quick moments from people and places you follow." cta="See all" />
        <CommunityStories />

        <CityGuide />
      </div>

      <InclusiveFeatures highContrast={highContrast} setHighContrast={setHighContrast} />

      <FooterSection />
    </div>
  );
};
