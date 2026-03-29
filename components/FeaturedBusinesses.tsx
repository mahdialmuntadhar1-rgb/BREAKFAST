import React from 'react';
import { motion } from 'motion/react';
import { useTranslations } from '../hooks/useTranslations';
import { Star, CheckCircle } from './icons';
import { businesses } from '../constants';

import type { Business } from '../types';

interface FeaturedBusinessesProps {
    onSeeAll?: () => void;
    onBusinessClick?: (business: Business) => void;
}

export const FeaturedBusinesses: React.FC<FeaturedBusinessesProps> = ({ onSeeAll, onBusinessClick }) => {
    const { t } = useTranslations();
    
    // Filter some businesses to show as featured
    const featured = businesses.slice(0, 5);

    return (
        <div className="w-full py-4 bg-white/5 backdrop-blur-md border-y border-white/10 overflow-hidden">
            <div className="container mx-auto px-4 mb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                        {t('featured.premium') || 'Premium Featured'}
                    </span>
                </div>
                {onSeeAll && (
                    <button 
                        onClick={onSeeAll}
                        className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-primary transition-colors"
                    >
                        {t('social.viewAll') || 'See All'}
                    </button>
                )}
            </div>
            
            <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-2">
                {featured.map((business, i) => (
                    <motion.div
                        key={business.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex-shrink-0 w-64 group cursor-pointer"
                        onClick={() => onBusinessClick?.(business as any)}
                    >
                        <div className="relative h-24 rounded-xl overflow-hidden mb-2 border border-white/10 group-hover:border-primary/50 transition-colors duration-500">
                            <img 
                                src={business.imageUrl || 'https://picsum.photos/seed/placeholder/400/300'} 
                                alt={business.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            <div className="absolute top-2 right-2">
                                <div className="px-2 py-0.5 rounded-full bg-primary/90 backdrop-blur-md text-[8px] font-bold text-white flex items-center gap-1">
                                    <CheckCircle className="w-2.5 h-2.5" />
                                    {t('featured.verified') || 'Verified'}
                                </div>
                            </div>
                            
                            <div className="absolute bottom-2 left-3 right-3">
                                <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                                    {business.name}
                                </h4>
                                <div className="flex items-center gap-1 text-[10px] text-white/60">
                                    <span className="truncate">{business.category}</span>
                                    <span>•</span>
                                    <span className="text-secondary font-bold">{business.rating} ★</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
