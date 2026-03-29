import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Deal } from '../types';
import { Clock, Tag, MapPin } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'motion/react';

export const DealsMarketplace: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const { t } = useTranslations();

  useEffect(() => {
    let isMounted = true;

    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        const data = await api.getDeals();
        if (isMounted) setDeals(data);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDeals();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleDeals = deals.slice(0, visibleCount);

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse animation-delay-3000" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('deals.title')}</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.length === 0 ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                  <Tag className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/60 text-sm">No deals yet in your city.</p>
                </div>
              ) : (
                visibleDeals.map((deal, index) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="relative group backdrop-blur-3xl bg-black/40 border border-white/10 rounded-3xl p-8 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow-accent/20 transition-all duration-500 overflow-hidden text-start cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl group-hover:opacity-100 opacity-50 transition-opacity duration-500" />

                    <div className="absolute top-6 right-6">
                      <div className="relative z-10 px-3 py-1.5 rounded-lg bg-accent text-white font-black text-sm tracking-tighter shadow-xl">
                        -{deal.discount}%
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        <img src={deal.businessLogo} alt="Business Logo" className="w-full h-full rounded-xl object-cover" />
                      </div>
                      <div>
                        <div className="px-2 py-1 rounded text-[10px] bg-primary/20 border border-primary/30 text-primary uppercase tracking-widest font-bold inline-block">Food & Dining</div>
                      </div>
                    </div>

                    <h3 className="text-white font-black text-2xl mb-3 tracking-tight leading-tight group-hover:text-accent transition-colors duration-300">
                      {deal.titleKey ? t(deal.titleKey) : deal.title}
                    </h3>

                    <p className="text-white/60 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
                      {deal.descriptionKey ? t(deal.descriptionKey) : deal.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest">
                        <Clock className="w-4 h-4" />
                        {t('deals.expires')}: {deal.expiresInKey ? t(deal.expiresInKey) : deal.expiresIn}
                      </div>
                      <div className="flex items-center gap-2 text-white/40 font-semibold">
                        <MapPin className="w-4 h-4" /> Erbil
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {deals.length > 0 && (
              <div className="mt-10">
                {visibleCount < deals.length ? (
                  <button onClick={() => setVisibleCount((prev) => prev + 3)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:-translate-y-0.5 transition-all cursor-pointer">
                    More offers in your city
                  </button>
                ) : (
                  <p className="text-center text-white/50 text-sm py-4 border border-white/10 rounded-2xl bg-white/5">You reached the end.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
