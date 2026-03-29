import React from 'react';
import { SocialFeed } from './SocialFeed';
import { useTranslations } from '../hooks/useTranslations';
import type { Post } from '../types';
import { motion } from 'motion/react';
import { ChevronRight, MessageCircle } from './icons';

interface BusinessGridSectionProps {
    posts: Post[];
    isLoading: boolean;
    isLoggedIn: boolean;
    onSeeAll?: () => void;
}

export const BusinessGridSection: React.FC<BusinessGridSectionProps> = ({ 
    posts, 
    isLoading, 
    isLoggedIn,
    onSeeAll
}) => {
    const { t } = useTranslations();

    return (
        <section className="lg:col-span-2">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div className="space-y-4 text-start">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                            <MessageCircle className="w-3 h-3" />
                            {t('social.badge') || 'Social Pulse'}
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter">
                            {t('social.ecosystemTitle') || 'Recent Updates'}
                        </h2>
                        <p className="text-white/40 font-medium max-w-md">
                            {t('social.subtitle') || 'Stay connected with the latest news and offers from local businesses.'}
                        </p>
                    </div>
                    <button 
                        onClick={onSeeAll}
                        className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-primary/50 transition-all duration-500"
                    >
                        {t('social.viewAll') || 'See all posts'}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                
                <SocialFeed 
                    posts={posts} 
                    isLoading={isLoading} 
                    isLoggedIn={isLoggedIn} 
                />
            </motion.div>
        </section>
    );
};
