import React, { useState, useEffect } from 'react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { categories, governorates } from '../constants';
import { api } from '../services/api';
import type { Business } from '../types';
import { Star, Grid3x3, List, MapPin, CheckCircle, ArrowLeft, Phone } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';

interface BusinessCardProps { business: Business; viewMode: 'grid' | 'list'; }

const BusinessCard: React.FC<BusinessCardProps> = ({ business, viewMode }) => {
  const { t, lang } = useTranslations();
  const displayName = lang === 'ar' && business.nameAr ? business.nameAr : lang === 'ku' && business.nameKu ? business.nameKu : business.name;
  const displayImage = business.imageUrl || (business as any).image || business.coverImage || 'https://picsum.photos/seed/placeholder/400/300';
  const displayReviews = business.reviewCount ?? (business as any).reviews ?? 0;
  const badge = business.isFeatured ? 'Featured' : 'New';

  if (viewMode === 'list') {
    return (
      <GlassCard className="p-4 flex gap-4 text-start rtl:text-right hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <img src={displayImage} alt={displayName} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1"><h3 className="text-white font-semibold text-lg">{displayName}</h3><span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/20 border border-primary/30 text-primary">{badge}</span></div>
          <p className="text-white/60 text-sm mb-2">{t(categories.find(c => c.id === business.category)?.nameKey || business.category)}</p>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span>{business.rating}</span></div>
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{business.city || business.governorate || 'Baghdad'}</div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm hover:-translate-y-0.5 transition-all cursor-pointer">View</button>
          <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-all cursor-pointer inline-flex items-center gap-2"><Phone className="w-4 h-4" />Call</button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden group text-start p-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img src={displayImage} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {business.isVerified && <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><CheckCircle className="w-5 h-5 text-dark-bg" /></div>}
        <span className="absolute top-3 start-3 px-2 py-1 text-[10px] rounded-full bg-primary/85 text-white font-bold uppercase tracking-wider">{badge}</span>
      </div>
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2">{displayName}</h3>
        <p className="text-white/60 text-sm">{t(categories.find(c => c.id === business.category)?.nameKey || business.category)}</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="text-white font-medium">{business.rating}</span><span className="text-white/60">({displayReviews})</span></div>
          <div className="flex items-center gap-1 text-white/60"><MapPin className="w-4 h-4" />{business.city || business.governorate || 'Baghdad'}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button className="py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all cursor-pointer">View</button>
          <button className="py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"><Phone className="w-4 h-4" />Call</button>
        </div>
      </div>
    </GlassCard>
  );
};

interface BusinessDirectoryProps { initialFilter?: { categoryId?: string; city?: string; governorate?: string }; onBack?: () => void; }

const DIRECTORY_STATE_KEY = 'iraq-compass-directory-state';

const readSavedState = () => {
  try {
    const raw = sessionStorage.getItem(DIRECTORY_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({ initialFilter, onBack }) => {
  const savedState = readSavedState();
  const [filters, setFilters] = useState({ 
    category: initialFilter?.categoryId || savedState?.filters?.category || 'all', 
    rating: savedState?.filters?.rating || 0,
    city: initialFilter?.city || savedState?.filters?.city || '',
    governorate: initialFilter?.governorate || savedState?.filters?.governorate || 'all'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(savedState?.viewMode || 'grid');
  const [pageSize] = useState(20);
  const [businessesData, setBusinessesData] = useState<Business[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslations();

  useEffect(() => {
    if (!initialFilter) return;
    setFilters((prev) => ({
      ...prev,
      category: initialFilter?.categoryId || prev.category,
      city: initialFilter?.city || prev.city,
      governorate: initialFilter?.governorate || prev.governorate,
    }));
  }, [initialFilter]);

  useEffect(() => {
    sessionStorage.setItem(DIRECTORY_STATE_KEY, JSON.stringify({ filters, page, viewMode }));
  }, [filters, page, viewMode]);

  const fetchBusinesses = async (isLoadMore = false) => {
    setIsLoading(true); setError(null);
    const timeoutId = setTimeout(() => setIsLoading(false), 8000);
    try {
      const result = await api.getBusinesses({ category: filters.category, city: filters.city, governorate: filters.governorate, lastDoc: isLoadMore ? lastDoc : undefined, limit: pageSize });
      setBusinessesData(prev => isLoadMore ? [...prev, ...result.data] : result.data);
      setLastDoc(result.lastDoc); setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(t('directory.errorLoading'));
    } finally { setIsLoading(false); clearTimeout(timeoutId); }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [filters.category, filters.city, filters.governorate, pageSize]);

  const filteredBusinesses = filters.rating > 0
    ? businessesData.filter((business) => (business.rating || 0) >= filters.rating)
    : businessesData;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center relative mb-4">
          {onBack && <button onClick={onBack} className="absolute start-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors cursor-pointer"><ArrowLeft className="w-4 h-4"/><span className="hidden md:inline">{t('header.backToHome')}</span></button>}
          <h2 className="text-3xl font-bold text-white text-center">{t('directory.title')}</h2>
        </div>
        <div className="mb-8 text-center"><span className="inline-flex px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest">{contextTitle}</span></div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4 text-start rtl:text-right">
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center justify-between">{t('directory.filters')}<button onClick={() => setFilters({ category: 'all', rating: 0, city: '', governorate: 'all' })} className="text-xs text-secondary hover:text-secondary/80 cursor-pointer">{t('directory.reset')}</button></h3>
              <div className="mb-6"><label className="block text-white/80 text-sm mb-2">{t('directory.city')}</label><input type="text" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} placeholder={t('directory.cityPlaceholder')} className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(109,91,255,0.2)] transition-colors" /></div>
              <div className="mb-6"><label className="block text-white/80 text-sm mb-2">{t('directory.category')}</label><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white outline-none"> <option value="all" className="bg-dark-bg">{t('directory.allCategories')}</option>{categories.map(category => <option key={category.id} value={category.id} className="bg-dark-bg">{t(category.nameKey)}</option>)} </select></div>
              <div className="mb-6"><label className="block text-white/80 text-sm mb-2">{t('directory.governorate')}</label><select value={filters.governorate} onChange={(e) => setFilters({ ...filters, governorate: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white outline-none">{governorates.map(gov => <option key={gov.id} value={gov.id} className="bg-dark-bg">{t(gov.nameKey)}</option>)}</select></div>
              <div><label className="text-white/80 text-sm mb-2 block">{t('directory.minimumRating')}</label><div className="flex gap-2">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} onClick={() => setFilters({ ...filters, rating })} className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer ${filters.rating >= rating ? 'bg-gradient-to-br from-accent to-primary' : 'bg-white/10 hover:bg-white/20'}`}><Star className={`w-5 h-5 ${filters.rating >= rating ? 'text-white fill-white' : 'text-white/50'}`} /></button>)}</div></div>
            </GlassCard>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/80">{t('directory.showing')} {filteredBusinesses.length} {t('directory.businesses')}</p>
              <div className="flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary' : 'hover:bg-white/10'}`}><Grid3x3 className="w-5 h-5 text-white" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary' : 'hover:bg-white/10'}`}><List className="w-5 h-5 text-white" /></button>
              </div>
            </div>
            
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-white/40 text-sm animate-pulse">{t('directory.loading')}</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <ArrowLeft className="w-8 h-8 text-red-400 rotate-180" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{t('directory.errorTitle')}</h3>
                    <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">{error}</p>
                    <button 
                        onClick={() => fetchBusinesses()} 
                        className="px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                    >
                        {t('directory.retry')}
                    </button>
                </div>
            ) : filteredBusinesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <MapPin className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{t('directory.noResultsTitle')}</h3>
                    <p className="text-white/60 text-sm max-w-xs mx-auto">
                        {t('directory.noResultsDesc')}
                    </p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'space-y-4'}>
                    {filteredBusinesses.map((business) => (<BusinessCard key={business.id} business={business} viewMode={viewMode} />))}
                </div>
            )}

            {isLoading ? <div className="flex flex-col items-center justify-center py-20 gap-4"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div><p className="text-white/40 text-sm animate-pulse">{t('directory.loading')}</p></div> : error ? <div className="flex flex-col items-center justify-center py-20 text-center"><h3 className="text-white font-semibold text-lg mb-2">{t('directory.errorTitle')}</h3><p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">{error}</p><button onClick={() => fetchBusinesses()} className="px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">{t('directory.retry')}</button></div> : businessesData.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center"><div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"><MapPin className="w-8 h-8 text-white/20" /></div><h3 className="text-white font-semibold text-lg mb-2">Be the first to add a business</h3><p className="text-white/60 text-sm max-w-xs mx-auto">No results for current filters. Try another city or category.</p></div> : <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'space-y-4'}>{businessesData.map((business) => <BusinessCard key={business.id} business={business} viewMode={viewMode} />)}</div>}

            <div className="mt-12">
              {hasMore ? <button disabled={isLoading} onClick={() => fetchBusinesses(true)} className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary disabled:opacity-50 transition-all cursor-pointer">{isLoading ? t('directory.loading') : 'Explore more businesses'}</button> : businessesData.length > 0 ? <p className="text-center text-white/60">You reached the end</p> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
