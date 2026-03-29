import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Deal } from '../types';
import { Clock, Tag } from './icons';
import { useTranslations } from '../hooks/useTranslations';

export const DealsMarketplace: React.FC<{ selectedGovernorate: string }> = ({ selectedGovernorate }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslations();

  const fetchDeals = async (loadMore = false) => {
    setIsLoading(true);
    try {
      const result = await api.getDeals({ cursor: loadMore ? (cursor ?? 0) : 0, governorate: selectedGovernorate });
      setDeals((prev) => (loadMore ? [...prev, ...result.data] : result.data));
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDeals(false); }, [selectedGovernorate]);

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('deals.title')}</h2>
        {isLoading && deals.length === 0 ? <div className="py-16 flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div> : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.length === 0 ? <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-50"><Tag className="w-12 h-12 text-white/20 mb-4" /><p className="text-white/60 text-sm">{t('deals.noDeals') || 'No active deals at the moment.'}</p></div> : deals.map((deal) => (
            <div key={deal.id} className="relative group backdrop-blur-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-white/10 rounded-2xl p-6 text-start">
              <div className="w-16 h-16 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4"><img src={deal.businessLogo} alt="Business Logo" className="w-12 h-12 rounded-full" /></div>
              <h3 className="text-white font-semibold text-lg mb-2">{deal.titleKey ? t(deal.titleKey) : deal.title}</h3>
              <p className="text-white/70 text-sm mb-4">{deal.descriptionKey ? t(deal.descriptionKey) : deal.description}</p>
              <div className="flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-accent" /><span className="text-accent text-sm font-medium">{t('deals.expires')}: {deal.expiresInKey ? t(deal.expiresInKey) : deal.expiresIn}</span></div>
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-primary text-white font-semibold flex items-center justify-center gap-2"><Tag className="w-4 h-4" />{t('deals.claimNow')}</button>
            </div>
          ))}
        </div>
        {hasMore && <div className="mt-8 text-center"><button onClick={() => fetchDeals(true)} className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20">{t('directory.loadMore')}</button></div>}
        </>)}
      </div>
    </section>
  );
};
