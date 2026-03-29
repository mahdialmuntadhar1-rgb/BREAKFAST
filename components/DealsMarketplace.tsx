import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Deal } from '../types';
import { Clock, Tag } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'motion/react';

export const DealsMarketplace: React.FC = () => {
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

  const visibleDeals = deals.slice(0, visibleCount);

  return (
    <section className="py-10 relative">
      <div className="container mx-auto px-4 relative z-10">
        <p className="text-center text-white/60 mb-6">More offers in your city</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />)}
          </div>
        ) : deals.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-70">
            <Tag className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/60 text-sm">No deals yet in your city.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative group backdrop-blur-3xl bg-black/40 border border-white/10 rounded-3xl p-6 hover:border-accent/50 hover:shadow-glow-accent/20 transition-all duration-300 overflow-hidden text-start hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-accent text-white font-black text-sm">-{deal.discount}%</div>
                  <div className="relative z-10 flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-xl p-1 bg-white/10 border border-white/10 flex items-center justify-center">
                      <img src={deal.businessLogo} alt="Business Logo" className="w-full h-full rounded-lg object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest">Category</h4>
                      <p className="text-white text-sm">City Offer</p>
                    </div>
                  </div>

                  <h3 className="text-white font-black text-xl mb-2 tracking-tight">{deal.titleKey ? t(deal.titleKey) : deal.title}</h3>
                  <p className="text-white/65 text-sm mb-5 line-clamp-2">{deal.descriptionKey ? t(deal.descriptionKey) : deal.description}</p>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2 text-accent"><Clock className="w-4 h-4" /><span>Expires: {deal.expiresInKey ? t(deal.expiresInKey) : deal.expiresIn}</span></div>
                    <span className="text-white/40">{deal.claimed}/{deal.total} claimed</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {deals.length > visibleCount && (
              <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.03] p-4">
                <button onClick={() => setVisibleCount(prev => prev + 3)} className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all">More offers in your city</button>
              </div>
            )}
            {deals.length <= visibleCount && <p className="mt-8 text-center text-white/60 text-sm">You reached the end.</p>}
          </>
        )}
      </div>
    </section>
  );
};
