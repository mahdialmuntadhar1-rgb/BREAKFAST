import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Business } from '../types';
import { Crown, Star, MapPin, Clock, ChevronRight, ChevronLeft, Loader2 } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'motion/react';

interface FeaturedBusinessesProps {
  onSeeAll?: () => void;
}

export const FeaturedBusinesses: React.FC<FeaturedBusinessesProps> = ({ onSeeAll }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, lang } = useTranslations();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 5000);

    const fetchFeatured = async () => {
      setIsLoading(true);
      try {
        const result = await api.getBusinesses({ featuredOnly: true, limit: 10 });
        if (isMounted) setBusinesses(result.data);
      } catch (error) {
        console.error('Error fetching featured businesses:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };
    fetchFeatured();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-white/40 font-black uppercase tracking-widest animate-pulse">{t('featured.loading') || 'Finding premium spots...'}</p>
      </div>
    );
  }

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="space-y-4 max-w-2xl text-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em]">
                    <Crown className="w-3 h-3" />
                    {t('featured.badge') || 'Premium Selection'}
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter">
                    {t('featured.title') || 'Featured Businesses'}
                </h2>
                <p className="text-white/40 font-medium">
                    {t('featured.subtitle') || 'Discover hand-picked premium experiences across Iraq.'}
                </p>
            </div>
            <div className="flex items-center gap-4">
                <button 
                  onClick={onSeeAll}
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-primary/50 transition-all duration-500"
                >
                    {t('featured.viewAll') || 'Explore all'}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="hidden md:flex gap-2">
                    <button 
                        onClick={() => scroll('left')}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-primary hover:border-primary transition-all duration-300"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-primary hover:border-primary transition-all duration-300"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
        >
          {businesses.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10">
              <Crown className="w-16 h-16 text-white/10 mb-6" />
              <h3 className="text-white font-bold text-xl mb-2">{t('featured.noFeaturedTitle') || 'No Featured Listings'}</h3>
              <p className="text-white/40 text-base max-w-xs mx-auto">
                {t('featured.noFeatured') || "We're currently curating new premium spots for you."}
              </p>
            </div>
          ) : (
            businesses.map((business, index) => {
              const displayName = lang === 'ar' && business.nameAr ? business.nameAr : 
                                   lang === 'ku' && business.nameKu ? business.nameKu : 
                                   business.name;
              const displayImage = business.coverImage || business.imageUrl || business.image || 'https://picsum.photos/seed/placeholder/600/400';
              const isPremium = business.isPremium || business.isFeatured;
              
              return (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-shrink-0 w-85 snap-center"
                >
                  <GlassCard className="p-0 overflow-hidden group border-white/10 hover:border-primary/30 transition-all duration-500 hover:shadow-glow-primary/20 bg-black/40 backdrop-blur-2xl">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={displayImage}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                      
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {isPremium && (
                          <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="px-3 py-1.5 rounded-lg bg-accent/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-2xl border border-white/20"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            {t('featured.premium') || 'Premium'}
                          </motion.div>
                        )}
                        <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/10">
                          <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                          {business.rating || '4.9'}
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
                                {t(`categories.${business.category}`) || business.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border backdrop-blur-md ${business.status?.toLowerCase() === 'open' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                                {business.status ? t(`featured.${business.status.toLowerCase()}`) : t('featured.open')}
                            </span>
                        </div>
                        <h3 className="text-white font-black text-2xl tracking-tight leading-none group-hover:text-secondary transition-colors duration-300">
                            {displayName}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between text-white/50 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{business.governorate || 'Baghdad'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-secondary" />
                          <span>{business.hours || '09:00 - 22:00'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button className="relative overflow-hidden group/btn px-5 py-3.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-glow-white active:scale-95">
                          <span className="relative z-10">{t('actions.book') || 'Book Now'}</span>
                          <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        </button>
                        <button className="px-5 py-3.5 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all duration-300 active:scale-95">
                          {t('actions.details') || 'Details'}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

