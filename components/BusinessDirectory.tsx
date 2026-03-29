import React, { useState, useEffect } from 'react';
import { categories, governorates } from '../constants';
import { api } from '../services/api';
import type { Business } from '../types';
import { Star, Grid3x3, List, MapPin, CheckCircle, ArrowLeft } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';

interface BusinessCardProps {
  business: Business;
  viewMode: 'grid' | 'list';
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, viewMode }) => {
  const { t, lang } = useTranslations();
  const displayName = lang === 'ar' && business.nameAr ? business.nameAr : lang === 'ku' && business.nameKu ? business.nameKu : business.name;
  const displayImage = business.imageUrl || business.coverImage || 'https://picsum.photos/seed/placeholder/400/300';
  const displayReviews = business.reviewCount ?? 0;

  if (viewMode === 'list') {
    return (
      <GlassCard className="p-4 flex gap-4 text-start rtl:text-right">
        <img src={displayImage} alt={displayName} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{displayName}</h3>
          <p className="text-white/60 text-sm mb-2">{t(categories.find((c) => c.id === business.category)?.nameKey || business.category)}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="text-white">{business.rating}</span></div>
            <div className="flex items-center gap-1 text-white/60"><MapPin className="w-4 h-4" />{business.distance || '1.2'} km</div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden group text-start p-0">
      <div className="relative h-48 overflow-hidden">
        <img src={displayImage} alt={displayName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {business.isVerified && <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><CheckCircle className="w-5 h-5 text-dark-bg" /></div>}
      </div>
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2">{displayName}</h3>
        <p className="text-white/60 text-sm mb-3">{t(categories.find((c) => c.id === business.category)?.nameKey || business.category)}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="text-white font-medium">{business.rating}</span><span className="text-white/60 text-sm">({displayReviews})</span></div>
          <div className="flex items-center gap-1 text-white/60 text-sm"><MapPin className="w-4 h-4" />{business.distance || '1.2'} km</div>
        </div>
      </div>
    </GlassCard>
  );
};

interface BusinessDirectoryProps {
  initialFilter?: { categoryId?: string; city?: string; governorate?: string };
  onBack?: () => void;
}

export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({ initialFilter, onBack }) => {
  const [filters, setFilters] = useState({ category: initialFilter?.categoryId || 'all', rating: 0, city: initialFilter?.city || '', governorate: initialFilter?.governorate || 'all' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageSize] = useState(20);
  const [businessesData, setBusinessesData] = useState<Business[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslations();

  useEffect(() => {
    setFilters({ category: initialFilter?.categoryId || 'all', rating: 0, city: initialFilter?.city || '', governorate: initialFilter?.governorate || 'all' });
  }, [initialFilter]);

  const fetchBusinesses = async (isLoadMore = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getBusinesses({
        category: filters.category,
        city: filters.city,
        governorate: filters.governorate,
        offset: isLoadMore ? offset : 0,
        limit: pageSize,
      });

      setBusinessesData((prev) => (isLoadMore ? [...prev, ...result.data] : result.data));
      setOffset(result.nextOffset);
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
        <div className="flex items-center justify-center relative mb-8">
          {onBack && <button onClick={onBack} className="absolute start-0 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"><ArrowLeft className="w-4 h-4" /><span className="hidden md:inline">{t('header.backToHome')}</span></button>}
          <h2 className="text-3xl font-bold text-white text-center">{t('directory.title')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4 text-start rtl:text-right">
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center justify-between">{t('directory.filters')}<button onClick={() => setFilters({ category: 'all', rating: 0, city: '', governorate: 'all' })} className="text-xs text-secondary hover:text-secondary/80">{t('directory.reset')}</button></h3>
              <div className="mb-6"><label className="block text-white/80 text-sm mb-2">{t('directory.city')}</label><input type="text" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} placeholder={t('directory.cityPlaceholder')} className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none focus:border-primary transition-colors" /></div>
              <div className="mb-6"><label className="block text-white/80 text-sm mb-2">{t('directory.category')}</label><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none"><option value="all" className="bg-dark-bg">{t('directory.allCategories')}</option>{categories.map((category) => <option key={category.id} value={category.id} className="bg-dark-bg">{t(category.nameKey)}</option>)}</select></div>
              <div className="mb-6"><label className="block text-white/80 text-sm mb-2">{t('directory.governorate')}</label><select value={filters.governorate} onChange={(e) => setFilters({ ...filters, governorate: e.target.value })} className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none">{governorates.map((gov) => <option key={gov.id} value={gov.id} className="bg-dark-bg">{t(gov.nameKey)}</option>)}</select></div>
            </GlassCard>
          </div>
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6"><p className="text-white/80">{t('directory.showing')} {businessesData.length} {t('directory.businesses')}</p><div className="flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-1"><button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary' : 'hover:bg-white/10'}`}><Grid3x3 className="w-5 h-5 text-white" /></button><button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary' : 'hover:bg-white/10'}`}><List className="w-5 h-5 text-white" /></button></div></div>
            {isLoading && businessesData.length === 0 ? <div className="flex flex-col items-center justify-center py-20 gap-4"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div> : error ? <div className="py-20 text-center text-white/60">{error}</div> : businessesData.length === 0 ? <div className="py-20 text-center text-white/60">{t('directory.noResultsDesc')}</div> : <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'space-y-4'}>{businessesData.map((business) => <BusinessCard key={business.id} business={business} viewMode={viewMode} />)}</div>}
            {hasMore && <div className="mt-12 flex items-center justify-center"><button disabled={isLoading} onClick={() => fetchBusinesses(true)} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary disabled:opacity-50 transition-all">{isLoading ? t('directory.loading') : t('directory.loadMore')}</button></div>}
          </div>
        </div>
      </div>
    </section>
  );
};
