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

const SectionHeader: React.FC<{ id: string; title: string; subtitle: string; seeAll: string }> = ({ id, title, subtitle, seeAll }) => (
  <div id={id} className="container mx-auto px-4 mb-6 md:mb-8">
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-white/60 mt-2">{subtitle}</p>
      </div>
      <a href="#" className="text-primary font-semibold hover:text-secondary transition-all hover:-translate-y-0.5 cursor-pointer">
        {seeAll}
      </a>
    </div>
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
    <div className="min-h-screen bg-dark-bg selection:bg-primary/30 selection:text-white" id="join-signup">
      <HeroSection />
      <StoriesRing />

      <SectionHeader id="explore-sections" title="Trending categories" subtitle="Jump into what people are exploring most this week." seeAll="See all" />
      <CategoriesSection
        onCategoryClick={onCategoryClick}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <SectionHeader id="recent-posts" title="Recent posts" subtitle="Live updates from businesses and local communities." seeAll="See all posts" />
      <div className="container mx-auto px-4 py-10 relative">
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

      <SectionHeader id="featured-businesses" title="Featured businesses" subtitle="Verified and standout places worth visiting." seeAll="See all businesses" />
      <FeaturedSection />

      <div className="space-y-28 py-20">
        <SectionHeader id="events-section" title="Events" subtitle="Handpicked activities and experiences around you." seeAll="See all events" />
        <PersonalizedEvents />

        <SectionHeader id="deals-section" title="Deals" subtitle="Limited-time offers from local brands in your city." seeAll="See all offers" />
        <DealsMarketplace />

        <SectionHeader id="stories-section" title="Community stories" subtitle="Bite-sized stories from people and businesses nearby." seeAll="See all stories" />
        <CommunityStories />

        <CityGuide />
      </div>

      <InclusiveFeatures highContrast={highContrast} setHighContrast={setHighContrast} />

      <FooterSection />
    </div>
  );
};
