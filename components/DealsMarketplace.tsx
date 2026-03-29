import React, { useMemo, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Deal } from '../types';
import { Clock, Tag } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'motion/react';

interface DealsMarketplaceProps { selectedGovernorate?: string }

export const DealsMarketplace: React.FC<DealsMarketplaceProps> = ({ selectedGovernorate = 'all' }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const { t } = useTranslations();

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        const data = await api.getDeals();
        setDeals(data);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const visibleDeals = useMemo(() => deals.slice(0, visibleCount), [deals, visibleCount]);
  const hasMore = visibleCount < deals.length;

  if (isLoading) {
    return <div className="py-16 flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <section className="py-8 relative">
      <div className="container mx-auto px-4 relative z-10">
        {selectedGovernorate !== 'all' && <p className="mb-6 inline-flex px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">Deals in {selectedGovernorate}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-90 rounded-2xl border border-white/10 bg-white/5">
              <Tag className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/70 text-sm">No deals yet in your city.</p>
            </div>
          ) : (
            visibleDeals.map((deal, index) => (
              <motion.div key={deal.id} initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05 }} className="relative group backdrop-blur-3xl bg-black/40 border border-white/10 rounded-3xl p-7 hover:border-accent/50 hover:-translate-y-1 hover:shadow-glow-accent/20 transition-all duration-300 overflow-hidden text-start cursor-pointer">
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-accent text-white font-black text-sm">-{deal.discount}%</div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl p-1 bg-white/10 border border-white/10 flex items-center justify-center"><img src={deal.businessLogo} alt="Business Logo" className="w-full h-full rounded-xl object-cover" /></div>
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-primary/20 border border-primary/30 text-primary font-bold uppercase">General</span>
                </div>
                <h3 className="text-white font-black text-xl mb-2">{deal.titleKey ? t(deal.titleKey) : deal.title}</h3>
                <p className="text-white/60 text-sm mb-5 line-clamp-2">{deal.descriptionKey ? t(deal.descriptionKey) : deal.description}</p>
                <div className="flex items-center justify-between text-xs uppercase tracking-wider">
                  <div className="flex items-center gap-2 text-accent"><Clock className="w-4 h-4" />{t('deals.expires')}: {deal.expiresInKey ? t(deal.expiresInKey) : deal.expiresIn}</div>
                  <div className="text-white/40">{deal.claimed}/{deal.total}</div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {deals.length > 0 && (
          <div className="mt-10 space-y-3">
            {hasMore ? <button onClick={() => setVisibleCount((v) => v + 6)} className="w-full h-12 rounded-xl bg-gradient-to-r from-accent to-primary text-white font-semibold hover:-translate-y-0.5 transition-all cursor-pointer">More offers in your city</button> : <p className="text-center text-white/60">You reached the end</p>}
          </div>
        )}
      </div>
    </section>
  );
};
