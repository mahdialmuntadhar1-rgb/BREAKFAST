import React, { useState, useEffect, useMemo } from 'react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { categories, governorates } from '../constants';
import { api } from '../services/api';
import type { Business } from '../types';
import { Star, Grid3x3, List, MapPin, CheckCircle, ArrowLeft, Phone } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';

interface BusinessCardProps {
  business: Business;
  viewMode: 'grid' | 'list';
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, viewMode }) => {
  const { t, lang } = useTranslations();

  const displayName = lang === 'ar' && business.nameAr ? business.nameAr :
    lang === 'ku' && business.nameKu ? business.nameKu :
      business.name;

  const displayImage = business.imageUrl || business.image || business.coverImage || 'https://picsum.photos/seed/placeholder/400/300';
  const displayReviews = business.reviewCount ?? business.reviews ?? 0;
  const isVerified = business.isVerified ?? false;

  if (viewMode === 'list') {
    return (
      <GlassCard className="p-4 flex gap-4 text-start rtl:text-right hover:-translate-y-1 transition-all cursor-pointer">
        <img src={displayImage} alt={displayName} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold text-lg">{displayName}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary">{isVerified ? 'Featured' : 'New'}</span>
          </div>
          <p className="text-white/60 text-sm mb-2">{t(categories.find(c => c.id === business.category)?.nameKey || business.category)}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="text-white">{business.rating}</span></div>
            <div className="flex items-center gap-1 text-white/60"><MapPin className="w-4 h-4" />{business.city || business.governorate || 'Baghdad'}</div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm hover:-translate-y-0.5 transition-all cursor-pointer">View</button>
          <button className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-all cursor-pointer flex items-center gap-1"><Phone className="w-4 h-4" />Call</button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden group text-start p-0 hover:-translate-y-1 transition-all cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img src={displayImage} alt={displayName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-3 start-3 text-[10px] px-2 py-1 rounded-full bg-black/50 border border-white/20 text-white">{business.isFeatured ? 'Featured' : 'New'}</div>
        {isVerified && <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><CheckCircle className="w-5 h-5 text-dark-bg" /></div>}
      </div>
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-1">{displayName}</h3>
        <p className="text-white/60 text-sm mb-1">{t(categories.find(c => c.id === business.category)?.nameKey || business.category)}</p>
        <p className="text-white/60 text-sm mb-3 flex items-center gap-1"><MapPin className="w-4 h-4" />{business.city || business.governorate || 'Baghdad'}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="text-white font-medium">{business.rating}</span><span className="text-white/60 text-sm">({displayReviews})</span></div>
          <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all cursor-pointer flex items-center gap-1"><Phone className="w-4 h-4" />Call</button>
        </div>
        <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary hover:-translate-y-0.5 transition-all cursor-pointer">{t('directory.viewProfile')}</button>
      </div>
    </GlassCard>
  );
};

interface BusinessDirectoryProps {
  initialFilter?: { categoryId?: string; city?: string; governorate?: string };
  onBack?: () => void;
}

export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({ initialFilter, onBack }) => {
  const [filters, setFilters] = useState({
    category: initialFilter?.categoryId || 'all',
    rating: 0,
    city: initialFilter?.city || '',
    governorate: initialFilter?.governorate || 'all'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageSize] = useState(12);
  const [businessesData, setBusinessesData] = useState<Business[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslations();

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: initialFilter?.categoryId || prev.category,
      city: initialFilter?.city ?? prev.city,
      governorate: initialFilter?.governorate || prev.governorate,
    }));
  }, [initialFilter]);

  const selectedCategoryLabel = useMemo(() => {
    if (filters.category === 'all') return 'Businesses';
    return t(categories.find((c) => c.id === filters.category)?.nameKey || filters.category);
  }, [filters.category, t]);

  const selectedGovernorateLabel = useMemo(() => {
    if (filters.governorate === 'all') return 'Iraq';
    return t(governorates.find((g) => g.id === filters.governorate)?.nameKey || filters.governorate);
  }, [filters.governorate, t]);

  const fetchBusinesses = async (isLoadMore = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getBusinesses({
        category: filters.category,
        city: filters.city,
        governorate: filters.governorate,
        lastDoc: isLoadMore ? lastDoc : undefined,
        limit: pageSize
      });

      setBusinessesData(prev => isLoadMore ? [...prev, ...result.data] : result.data);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(t('directory.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [filters, pageSize]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center relative mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute start-0 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">{t('header.backToHome')}</span>
            </button>
          )}
          <h2 className="text-3xl font-bold text-white text-center">{selectedCategoryLabel} in {selectedGovernorateLabel}</h2>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs">{selectedCategoryLabel}</span>
          <span className="px-3 py-1 rounded-full bg-secondary/20 border border-secondary/40 text-secondary text-xs">{selectedGovernorateLabel}</span>
          {filters.city && <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs">{filters.city}</span>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4 text-start rtl:text-right">
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
                {t('directory.filters')}
                <button onClick={() => setFilters({ category: 'all', rating: 0, city: '', governorate: 'all' })} className="text-xs text-secondary hover:text-secondary/80 cursor-pointer">
                  {t('directory.reset')}
                </button>
              </h3>

              <div className="mb-6">
                <label className="block text-white/80 text-sm mb-2">{t('directory.city')}</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder={t('directory.cityPlaceholder')}
                  className="w-full h-12 px-4 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(88,99,255,0.2)] transition-all"
                />
              </div>

              <div className="mb-6">
                <label className="block text-white/80 text-sm mb-2">{t('directory.category')}</label>
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full h-12 px-4 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none appearance-none">
                  <option value="all" className="bg-dark-bg">{t('directory.allCategories')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-dark-bg">
                      {t(category.nameKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-white/80 text-sm mb-2">{t('directory.governorate')}</label>
                <select
                  value={filters.governorate}
                  onChange={(e) => setFilters({ ...filters, governorate: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none appearance-none"
                >
                  {governorates.map(gov => (
                    <option key={gov.id} value={gov.id} className="bg-dark-bg">
                      {t(gov.nameKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">{t('directory.minimumRating')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button key={rating} onClick={() => setFilters({ ...filters, rating })} className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${filters.rating >= rating ? 'bg-gradient-to-br from-accent to-primary' : 'backdrop-blur-xl bg-white/10 hover:bg-white/20'}`}>
                      <Star className={`w-5 h-5 ${filters.rating >= rating ? 'text-white fill-white' : 'text-white/50'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/80">{t('directory.showing')} {businessesData.length} {t('directory.businesses')}</p>
              <div className="flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-primary' : 'hover:bg-white/10'}`}><Grid3x3 className="w-5 h-5 text-white" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-primary' : 'hover:bg-white/10'}`}><List className="w-5 h-5 text-white" /></button>
              </div>
            </div>

            {isLoading && businessesData.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-72 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />)}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-white font-semibold text-lg mb-2">{t('directory.errorTitle')}</h3>
                <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">{error}</p>
                <button
                  onClick={() => fetchBusinesses()}
                  className="px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  {t('directory.retry')}
                </button>
              </div>
            ) : businessesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Be the first to add a business</h3>
                <p className="text-white/60 text-sm max-w-xs mx-auto">No results in this area yet. Try nearby cities or adjust your filters.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'space-y-4'}>
                {businessesData.map((business) => (<BusinessCard key={business.id} business={business} viewMode={viewMode} />))}
              </div>
            )}

            <div className="mt-10">
              {hasMore ? (
                <button
                  disabled={isLoading}
                  onClick={() => fetchBusinesses(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary hover:-translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {isLoading ? 'Loading more...' : 'Explore more businesses'}
                </button>
              ) : businessesData.length > 0 && (
                <p className="text-center text-white/50 text-sm py-4 border border-white/10 rounded-2xl bg-white/5">You reached the end.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
