import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Deal } from '../types';
import { Clock, Tag } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { useAppSettings } from '../hooks/useAppSettings';

export const DealsMarketplace: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const { governorate } = useAppSettings();
  const { t } = useTranslations();

  const fetchDeals = async (loadMore = false) => {
    setIsLoading(true);
    try {
      const result = await api.getDeals({ page: loadMore ? page : 0, governorate, limit: 9 });
      setDeals((prev) => (loadMore ? [...prev, ...result.data] : result.data));
      setPage(result.nextPage);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchDeals(false);
  }, [governorate]);

  return (
    <section className="py-16 relative"><div className="container mx-auto px-4 relative z-10"><h2 className="text-3xl font-bold text-white mb-8 text-center">{t('deals.title')}</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{deals.length === 0 && !isLoading ? <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-50"><Tag className="w-12 h-12 text-white/20 mb-4" /><p className="text-white/60 text-sm">{t('deals.noDeals') || 'No active deals at the moment.'}</p></div> : deals.map((deal) => <div key={deal.id} className="relative group backdrop-blur-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-white/10 rounded-2xl p-6 text-start"><h3 className="text-white font-semibold text-lg mb-2">{deal.titleKey ? t(deal.titleKey) : deal.title}</h3><p className="text-white/70 text-sm mb-4">{deal.descriptionKey ? t(deal.descriptionKey) : deal.description}</p><div className="flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-accent" /><span className="text-accent text-sm font-medium">{t('deals.expires')}: {deal.expiresInKey ? t(deal.expiresInKey) : deal.expiresIn}</span></div><button className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-primary text-white font-semibold flex items-center justify-center gap-2"><Tag className="w-4 h-4" />{t('deals.claimNow')}</button></div>)}</div>{hasMore && <div className="flex justify-center mt-8"><button onClick={() => fetchDeals(true)} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold">{isLoading ? t('directory.loading') : t('directory.loadMore')}</button></div>}</div></section>
  );
};
