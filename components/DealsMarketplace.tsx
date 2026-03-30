import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Deal } from '../types';
import { Clock, Tag, Loader2, ChevronRight } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence } from 'motion/react';

interface DealsMarketplaceProps {
    onSeeAll?: () => void;
    selectedGovernorate?: string;
}

export const DealsMarketplace: React.FC<DealsMarketplaceProps> = ({ onSeeAll, selectedGovernorate = 'all' }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useTranslations();

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 5000);

    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        const data = await api.getDeals({ governorate: selectedGovernorate });
        if (isMounted) {
          setDeals(data);
          // For demo purposes, assume we have more if we got some data
          setHasMore(data.length > 0);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };
    fetchDeals();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [selectedGovernorate]);

  const handleLoadMore = async () => {
    setIsMoreLoading(true);
    // Simulate fetching more
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsMoreLoading(false);
    setHasMore(false); // For demo, just stop after one load
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-white/40 font-black uppercase tracking-widest animate-pulse">{t('deals.loading') || 'Hunting for discounts...'}</p>
      </div>
    );
  }

  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse animation-delay-3000" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="space-y-4 max-w-2xl text-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em]">
                    <Tag className="w-3 h-3" />
                    {t('deals.badge') || 'Hot Deals'}
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter">
                    {t('deals.title') || 'Exclusive Marketplace'}
                </h2>
                <p className="text-white/40 font-medium">
                    {t('deals.subtitle') || 'Save big with exclusive discounts from top-rated businesses in your city.'}
                </p>
            </div>
            <button 
                onClick={onSeeAll}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-accent/50 transition-all duration-500"
            >
                {t('deals.viewAll') || 'See all deals'}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-50">
              <Tag className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60 text-sm">{t('deals.noDeals') || "No active deals at the moment."}</p>
            </div>
          ) : (
            deals.map((deal, index) => (
            <motion.div 
              key={deal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group backdrop-blur-3xl bg-black/40 border border-white/10 rounded-3xl p-8 hover:border-accent/50 hover:shadow-glow-accent/20 transition-all duration-500 overflow-hidden text-start"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
              
              <div className="absolute top-6 right-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-accent blur-md opacity-40 animate-pulse" />
                    <div className="relative z-10 px-3 py-1.5 rounded-lg bg-accent text-white font-black text-sm tracking-tighter shadow-xl">
                        -{deal.discount}%
                    </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <img src={deal.businessLogo} alt="Business Logo" className="w-full h-full rounded-xl object-cover" />
                </div>
                <div>
                    <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{t('deals.exclusive') || 'Exclusive Deal'}</h4>
                    <div className="h-1 w-8 bg-accent rounded-full" />
                </div>
              </div>

              <h3 className="text-white font-black text-2xl mb-3 tracking-tight leading-tight group-hover:text-accent transition-colors duration-300">
                {deal.titleKey ? t(deal.titleKey) : deal.title}
              </h3>
              
              <p className="text-white/60 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">
                {deal.descriptionKey ? t(deal.descriptionKey) : deal.description}
              </p>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-accent text-[10px] font-black uppercase tracking-widest">
                            {t('deals.expires')}: {deal.expiresInKey ? t(deal.expiresInKey) : deal.expiresIn}
                        </span>
                    </div>
                    <div className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                        {deal.claimed}/{deal.total} {t('deals.claimed')}
                    </div>
                </div>

                <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(deal.claimed / deal.total) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-primary shadow-[0_0_10px_rgba(255,100,0,0.5)]" 
                  />
                </div>

                <button className="relative overflow-hidden group/btn w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-glow-white active:scale-95 flex items-center justify-center gap-2">
                  <span className="relative z-10 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {t('deals.claimNow')}
                  </span>
                  <div className="absolute inset-0 bg-accent translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          )))}
        </div>

        {/* Load More Section */}
        {deals.length > 0 && (
            <div className="mt-20 text-center">
                {hasMore ? (
                    <button
                        onClick={handleLoadMore}
                        disabled={isMoreLoading}
                        className="group relative px-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-accent/50 hover:shadow-glow-accent/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-4">
                            {isMoreLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                                    <span>{t('deals.loadingMore') || 'Searching for more deals...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>{t('deals.loadMore') || 'Explore more deals'}</span>
                                    <motion.span
                                        animate={{ y: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        ↓
                                    </motion.span>
                                </>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                            {t('deals.endOfList') || 'You have seen all current deals'}
                        </p>
                    </div>
                )}
            </div>
        )}
      </div>
    </section>
  );
};
