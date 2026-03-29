import React from 'react';
import { SocialFeed } from './SocialFeed';
import { useTranslations } from '../hooks/useTranslations';
import type { Post } from '../types';
import { motion } from 'motion/react';

interface BusinessGridSectionProps {
    posts: Post[];
    isLoading: boolean;
    isLoggedIn: boolean;
}

export const BusinessGridSection: React.FC<BusinessGridSectionProps> = ({ 
    posts, 
    isLoading, 
    isLoggedIn 
}) => {
    const { t } = useTranslations();

    return (
        <section className="lg:col-span-2">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Recent posts
                        </h2>
                        <p className="text-white/55 text-sm mt-1">Discover updates from businesses in your selected governorate.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-sm text-primary hover:text-secondary transition-colors cursor-pointer">See all</button>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                {t('social.liveFeed') || 'Live Feed'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <SocialFeed 
                    posts={posts} 
                    isLoading={isLoading} 
                    isLoggedIn={isLoggedIn} 
                    contextTitle="Recent posts in your city"
                />
            </motion.div>
        </section>
    );
};
