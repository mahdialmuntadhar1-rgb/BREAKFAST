import React from 'react';
import { HeroSection } from './HeroSection';
import { GovernorateSelection } from './GovernorateSelection';
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
  onBusinessClick: (business: any) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onSearch: (query: string) => void;
  selectedGovernorate: string;
  onGovernorateChange: (gov: string) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  onSeeAll: (type: 'businesses' | 'deals' | 'events' | 'posts') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  posts,
  isSocialLoading,
  isLoggedIn,
  onCategoryClick,
  onBusinessClick,
  currentPage,
  setCurrentPage,
  onSearch,
  selectedGovernorate,
  onGovernorateChange,
  highContrast,
  setHighContrast,
  onSeeAll,
}) => {
  const { t } = useTranslations();

  const filteredPosts = React.useMemo(() => {
    if (selectedGovernorate === 'all') return posts;
    return posts.filter(post => post.governorate?.toLowerCase() === selectedGovernorate.toLowerCase());
  }, [posts, selectedGovernorate]);

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-primary/30 selection:text-white pb-24 md:pb-0">
      <HeroSection onExplore={() => onSeeAll('businesses')} onBusinessClick={onBusinessClick} />
      
      <GovernorateSelection 
        selectedGovernorate={selectedGovernorate}
        onGovernorateChange={onGovernorateChange}
      />

      <FeaturedSection 
        onSeeAll={() => onSeeAll('businesses')} 
        onBusinessClick={onBusinessClick} 
        selectedGovernorate={selectedGovernorate}
      />
      
      <CategoriesSection 
        onCategoryClick={onCategoryClick} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <StoriesRing />

      <div className="container mx-auto px-4 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <BusinessGridSection 
                posts={filteredPosts} 
                isLoading={isSocialLoading} 
                isLoggedIn={isLoggedIn} 
                onSeeAll={() => onSeeAll('posts')}
              />
              
              <SearchSection 
                onSearch={onSearch} 
                selectedGovernorate={selectedGovernorate}
                onGovernorateChange={onGovernorateChange}
              />
          </div>
      </div>

      <div className="space-y-32 py-24">
        <PersonalizedEvents onSeeAll={() => onSeeAll('events')} selectedGovernorate={selectedGovernorate} />
        <DealsMarketplace onSeeAll={() => onSeeAll('deals')} selectedGovernorate={selectedGovernorate} />
        <CommunityStories onSeeAll={() => onSeeAll('posts')} />
        <CityGuide onGovernorateSelect={onGovernorateChange} />
      </div>

      <InclusiveFeatures highContrast={highContrast} setHighContrast={setHighContrast} />
      
      <FooterSection />
    </div>
  );
};

