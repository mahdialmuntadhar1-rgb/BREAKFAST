import React, { useState, useEffect } from 'react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { categories, governorates } from '../constants';
import { api } from '../services/api';
import type { Business } from '../types';
import { Star, Grid3x3, List, MapPin, CheckCircle, ArrowLeft, Loader2 } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'motion/react';

interface BusinessCardProps {
  business: Business;
  viewMode: 'grid' | 'list';
  onClick?: (business: Business) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, viewMode, onClick }) => {
  const { t, lang } = useTranslations();
  
  const displayName = lang === 'ar' && business.nameAr ? business.nameAr : 
                      lang === 'ku' && business.nameKu ? business.nameKu : 
                      business.name;
                      
  const displayImage = business.imageUrl || business.image || business.coverImage || 'https://picsum.photos/seed/placeholder/400/300';
  const displayReviews = business.reviewCount ?? business.reviews ?? 0;
  const isVerified = business.isVerified ?? false;

  if (viewMode === 'list') {
    return (
      <GlassCard className="p-4 flex gap-4 text-start rtl:text-right cursor-pointer hover:border-primary/30 transition-all" onClick={() => onClick?.(business)}>
        <img src={displayImage} alt={displayName} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{displayName}</h3>
          <p className="text-white/60 text-sm mb-2">{t(categories.find(c => c.id === business.category)?.nameKey || business.category)}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="text-white">{business.rating}</span></div>
            <div className="flex items-center gap-1 text-white/60"><MapPin className="w-4 h-4" />{business.distance || '1.2'} km</div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm">{t('directory.view')}</button>
          <button className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white font-medium text-sm" onClick={(e) => { e.stopPropagation(); /* Handle contact */ }}>{t('directory.contact')}</button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden group text-start p-0 cursor-pointer hover:border-primary/30 transition-all" onClick={() => onClick?.(business)}>
      <div className="relative h-48 overflow-hidden">
        <img src={displayImage} alt={displayName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {isVerified && <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><CheckCircle className="w-5 h-5 text-dark-bg" /></div>}
      </div>
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2">{displayName}</h3>
        <p className="text-white/60 text-sm mb-3">{t(categories.find(c => c.id === business.category)?.nameKey || business.category)}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="text-white font-medium">{business.rating}</span><span className="text-white/60 text-sm">({displayReviews})</span></div>
          <div className="flex items-center gap-1 text-white/60 text-sm"><MapPin className="w-4 h-4" />{business.distance || '1.2'} km</div>
        </div>
        <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all">{t('directory.viewProfile')}</button>
      </div>
    </GlassCard>
  );
};

interface BusinessDirectoryProps {
    initialFilter?: { categoryId?: string; city?: string; governorate?: string };
    onBack?: () => void;
    onBusinessClick?: (business: Business) => void;
}

export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({ initialFilter, onBack, onBusinessClick }) => {
  const [filters, setFilters] = useState({ 
    category: initialFilter?.categoryId || 'all', 
    rating: 0,
    city: initialFilter?.city || '',
    governorate: initialFilter?.governorate || 'all'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageSize] = useState(20);
  const [businessesData, setBusinessesData] = useState<Business[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslations();

  useEffect(() => {
    setFilters({
        category: initialFilter?.categoryId || 'all',
        rating: 0,
        city: initialFilter?.city || '',
        governorate: initialFilter?.governorate || 'all'
    });
  }, [initialFilter]);

  const fetchBusinesses = async (isLoadMore = false) => {
    setIsLoading(true);
    setError(null);
    
    // Safety timeout
    const timeoutId = setTimeout(() => {
        setIsLoading(false);
    }, 8000);

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
        clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [filters, pageSize]);

  const getContextualTitle = () => {
    const categoryName = filters.category === 'all' 
        ? (t('directory.allBusinesses') || 'Businesses')
        : t(categories.find(c => c.id === filters.category)?.nameKey || filters.category);
    
    const governorateName = filters.governorate === 'all'
        ? ''
        : ` ${t('common.in') || 'in'} ${t(governorates.find(g => g.id === filters.governorate)?.nameKey || filters.governorate)}`;
    
    const cityName = filters.city ? ` - ${filters.city}` : '';

    return `${categoryName}${governorateName}${cityName}`;
  };

  return (
    <section className="py-24 min-h-screen bg-[#0A0A0B]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div className="flex items-center gap-6">
                {onBack && (
                    <button 
                        onClick={onBack} 
                        className="group p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-primary/50 transition-all duration-500"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform"/>
                    </button>
                )}
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                        {getContextualTitle()}
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                            {businessesData.length} {t('directory.resultsFound') || 'Results Found'}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-3 rounded-xl transition-all duration-500 ${viewMode === 'grid' ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <Grid3x3 className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-3 rounded-xl transition-all duration-500 ${viewMode === 'list' ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <List className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <GlassCard className="p-8 sticky top-32 border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    {t('directory.filters') || 'Filters'}
                </h3>
                <button 
                    onClick={() => setFilters({ category: 'all', rating: 0, city: '', governorate: 'all' })} 
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
                >
                    {t('directory.reset') || 'Clear All'}
                </button>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                        {t('directory.governorate') || 'Governorate'}
                    </label>
                    <div className="relative group">
                        <select 
                            value={filters.governorate} 
                            onChange={(e) => setFilters({ ...filters, governorate: e.target.value })} 
                            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none appearance-none focus:border-primary/50 focus:bg-white/[0.08] transition-all duration-500 cursor-pointer"
                        >
                            {governorates.map(gov => (
                                <option key={gov.id} value={gov.id} className="bg-[#0A0A0B] text-white py-4">
                                    {t(gov.nameKey)}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                            <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-white/20 rotate-45 group-focus-within:border-primary transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                        {t('directory.city') || 'City / District'}
                    </label>
                    <input 
                        type="text"
                        value={filters.city}
                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        placeholder={t('directory.cityPlaceholder') || 'Search city...'}
                        className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all duration-500"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                        {t('directory.category') || 'Category'}
                    </label>
                    <div className="relative group">
                        <select 
                            value={filters.category} 
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })} 
                            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none appearance-none focus:border-primary/50 focus:bg-white/[0.08] transition-all duration-500 cursor-pointer"
                        >
                            <option value="all" className="bg-[#0A0A0B]">{t('directory.allCategories') || 'All Categories'}</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id} className="bg-[#0A0A0B]">
                                    {t(category.nameKey)}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                            <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-white/20 rotate-45 group-focus-within:border-primary transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                        {t('directory.minimumRating') || 'Minimum Rating'}
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <button 
                                key={rating} 
                                onClick={() => setFilters({ ...filters, rating })} 
                                className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border ${
                                    filters.rating >= rating 
                                    ? 'bg-white border-white text-black scale-105 shadow-xl' 
                                    : 'bg-white/5 border-white/10 text-white/20 hover:border-white/30 hover:text-white/40'
                                }`}
                            >
                                <Star className={`w-4 h-4 ${filters.rating >= rating ? 'fill-current' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-3">
            {isLoading && businessesData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">
                        {t('directory.loading') || 'Scanning directory...'}
                    </p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                    <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 rotate-12">
                        <ArrowLeft className="w-10 h-10 text-red-500 rotate-180" />
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter mb-4">
                        {t('directory.errorTitle') || 'Connection Interrupted'}
                    </h3>
                    <p className="text-white/40 font-medium mb-10 max-w-sm mx-auto">
                        {error}
                    </p>
                    <button 
                        onClick={() => fetchBusinesses()} 
                        className="px-12 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:shadow-glow-white/20 transition-all active:scale-95"
                    >
                        {t('directory.retry') || 'Try Again'}
                    </button>
                </div>
            ) : businessesData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 -rotate-12">
                        <MapPin className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter mb-4">
                        {t('directory.noResultsTitle') || 'No Matches Found'}
                    </h3>
                    <p className="text-white/40 font-medium max-w-sm mx-auto mb-10">
                        {t('directory.noResultsDesc') || "We couldn't find any businesses matching your current filters. Try adjusting your search."}
                    </p>
                    <button 
                        onClick={() => setFilters({ category: 'all', rating: 0, city: '', governorate: 'all' })}
                        className="px-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-95"
                    >
                        {t('directory.reset') || 'Clear Filters'}
                    </button>
                </div>
            ) : (
                <div className="space-y-12">
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-8' : 'space-y-6'}>
                        {businessesData.map((business, index) => (
                            <motion.div
                                key={business.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index % 10 * 0.05 }}
                            >
                                <BusinessCard 
                                    business={business} 
                                    viewMode={viewMode} 
                                    onClick={onBusinessClick}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Load More Section */}
                    <div className="pt-12 text-center">
                        {hasMore ? (
                            <button 
                                disabled={isLoading}
                                onClick={() => fetchBusinesses(true)}
                                className="group relative px-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-primary/50 hover:shadow-glow-primary/20 active:scale-95 disabled:opacity-50"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            <span>{t('directory.loadingMore') || 'Fetching...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{t('directory.loadMore') || 'Explore more businesses'}</span>
                                            <motion.span
                                                animate={{ y: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                ↓
                                            </motion.span>
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
                                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                                    {t('directory.endOfList') || 'You have reached the end'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};