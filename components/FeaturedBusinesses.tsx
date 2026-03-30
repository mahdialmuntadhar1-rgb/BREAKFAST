import React from 'react';
import { motion } from 'motion/react';
import { useTranslations } from '../hooks/useTranslations';
import { Star, CheckCircle } from './icons';
import { businesses } from '../constants';

import type { Business } from '../types';

interface FeaturedBusinessesProps {
    onSeeAll?: () => void;
    onBusinessClick?: (business: Business) => void;
    selectedGovernorate: string;
}

export const FeaturedBusinesses: React.FC<FeaturedBusinessesProps> = ({ 
    onSeeAll, 
    onBusinessClick,
    selectedGovernorate
}) => {
    const { t } = useTranslations();
    
    // Filter some businesses to show as featured, also filter by governorate if selected
    const featured = React.useMemo(() => {
        let filtered = businesses;
        if (selectedGovernorate !== 'all') {
            filtered = businesses.filter(b => b.governorate?.toLowerCase() === selectedGovernorate.toLowerCase());
        }
        return filtered.slice(0, 8); // Show up to 8 featured businesses
    }, [selectedGovernorate]);

    if (featured.length === 0) return null;

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
                        <div className="relative h-28 rounded-2xl overflow-hidden mb-2 border border-white/10 group-hover:border-primary/50 transition-all duration-500 hover:shadow-glow-primary/20">
                            <img 
                                src={business.imageUrl || 'https://picsum.photos/seed/placeholder/400/300'} 
                                alt={business.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            
                            {/* Sponsored Tag */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/70">
                                    {t('featured.sponsored') || 'Sponsored'}
                                </span>
                            </div>

                            <div className="absolute top-2 right-2">
                                <div className="px-2 py-0.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[8px] font-black text-primary flex items-center gap-1 uppercase tracking-tighter">
                                    <CheckCircle className="w-2.5 h-2.5" />
                                    {t('featured.verified') || 'Verified'}
                                </div>
                            </div>
                            
                            <div className="absolute bottom-3 left-3 right-3">
                                <h4 className="text-sm font-black text-white truncate group-hover:text-primary transition-colors uppercase tracking-tight">
                                    {business.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-white/50 font-bold uppercase tracking-widest">
                                    <span className="truncate">{business.category}</span>
                                    <span className="text-white/20">•</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5 text-accent fill-accent" />
                                        <span className="text-accent">{business.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
