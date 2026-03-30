import React, { useState, useEffect } from 'react';
import { categories } from '../constants';
import type { Category } from '../types';
import { Sparkles } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryGridProps {
  onCategoryClick: (category: Category) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const SkeletonCard: React.FC = () => (
    <div className="aspect-square backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-full mb-4"></div>
        <div className="h-4 w-3/4 bg-white/10 rounded mb-2"></div>
        <div className="h-6 w-1/2 bg-white/10 rounded"></div>
    </div>
);

const ITEMS_PER_PAGE = 9;

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryClick, currentPage, setCurrentPage }) => {
    const [loading, setLoading] = useState(true);
    const { t } = useTranslations();

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500); // Simulate loading time
        return () => clearTimeout(timer);
    }, []);

    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
    const paginatedCategories = categories.slice(
      currentPage * ITEMS_PER_PAGE,
      (currentPage + 1) * ITEMS_PER_PAGE
    );

    return (
        <div className="container mx-auto px-4 py-24">
            <div className="flex flex-col items-center text-center mb-16 space-y-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <Sparkles className="w-3 h-3" />
                    {t('categories.badge') || 'Trending Now'}
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-6xl font-black text-white tracking-tighter"
                >
                    {t('categories.title') || 'Explore by Category'}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-medium max-w-xl"
                >
                    {t('categories.subtitle') || 'Find exactly what you need, from local delicacies to essential services.'}
                </motion.p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-full grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
                        >
                            {Array.from({ length: 9 }).map((_, index) => <SkeletonCard key={index} />)}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={currentPage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="col-span-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8"
                        >
                            {paginatedCategories.map((category, index) => (
                                <GlassCard
                                    as="button"
                                    key={category.id}
                                    onClick={() => onCategoryClick(category)}
                                    className="group relative aspect-[4/5] p-0 hover:shadow-glow-primary hover:scale-105 cursor-pointer overflow-hidden transition-all duration-700 border-white/5"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {/* Background Image with Overlay */}
                                    <div className="absolute inset-0 z-0">
                                        <img 
                                            src={`https://picsum.photos/seed/cat-${category.id}/400/500`} 
                                            alt="" 
                                            className="w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                                    </div>

                                    <div className="relative z-10 h-full flex flex-col items-center justify-between p-6 text-center">
                                        <div className="mt-4">
                                            <div className="text-5xl md:text-6xl mb-4 text-white transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(0,217,255,0.4)]">
                                                {category.icon}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-2">
                                            <h3 className="text-white font-black text-base md:text-lg mb-1 group-hover:text-primary transition-colors uppercase tracking-tight">
                                                {t(category.nameKey)}
                                            </h3>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-white/50 font-black">
                                                    {category.eventCount} {t('categories.events') || 'Places'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '100%' }}
                                                transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                                className="h-full bg-gradient-to-r from-primary via-secondary to-accent opacity-30 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>

                                        {category.recommended && (
                                            <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-primary/20 border border-primary/30 backdrop-blur-md flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-primary" />
                                                <span className="text-[8px] font-black uppercase tracking-tighter text-primary">{t('categories.featured') || 'Hot'}</span>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => setCurrentPage(index)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className={`
                            w-2 h-2 rounded-full transition-all duration-300
                            ${currentPage === index 
                                ? 'w-8 bg-primary' 
                                : 'bg-white/20 hover:bg-white/40'
                            }
                            `}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
