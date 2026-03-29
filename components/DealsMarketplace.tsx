import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Deal } from '../types';
import { Clock, Tag } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { useAppPreferences } from '../hooks/useAppPreferences';

export const DealsMarketplace: React.FC = () => {
  const { governorate } = useAppPreferences();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslations();

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        const result = await api.getDeals({ governorate, limit: 6, offset: 0 });
        setDeals(result.data);
        setOffset(result.nextOffset);
        setHasMore(result.hasMore);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, [governorate]);

  const loadMore = async () => {
    const result = await api.getDeals({ governorate, limit: 6, offset });
    setDeals((prev) => [...prev, ...result.data]);
    setOffset(result.nextOffset);
    setHasMore(result.hasMore);
  };

  if (isLoading) return <div className="py-16 flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('deals.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.length === 0 ? <div className="col-span-full py-12 text-center opacity-50"><Tag className="w-12 h-12 text-white/20 mb-4 mx-auto" /><p className="text-white/60 text-sm">{t('deals.noDeals')}</p></div> : deals.map((deal) => (
            <div key={deal.id} className="relative group backdrop-blur-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-white/10 rounded-2xl p-6 text-start">
              <div className="absolute top-4 end-4 text-white font-bold text-lg">-{deal.discount}%</div>
              <div className="w-16 h-16 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4"><img src={deal.businessLogo} alt="Business Logo" className="w-12 h-12 rounded-full" /></div>
              <h3 className="text-white font-semibold text-lg mb-2">{deal.title}</h3>
              <p className="text-white/70 text-sm mb-4">{deal.description}</p>
              <div className="flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-accent" /><span className="text-accent text-sm font-medium">{t('deals.expires')}: {deal.expiresIn}</span></div>
            </div>
          ))}
        </div>
        {hasMore && <div className="text-center mt-8"><button onClick={loadMore} className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20">{t('directory.loadMore')}</button></div>}
      </div>
    </section>
  );
};
