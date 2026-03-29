import React from 'react';
import { SocialFeed } from './SocialFeed';
import { useTranslations } from '../hooks/useTranslations';
import type { Post } from '../types';
import { motion } from 'motion/react';

interface BusinessGridSectionProps {
  posts: Post[];
  isLoading: boolean;
  isLoggedIn: boolean;
  onRequireAuth: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const BusinessGridSection: React.FC<BusinessGridSectionProps> = ({ posts, isLoading, isLoggedIn, onRequireAuth, onLoadMore, hasMore }) => {
  const { t } = useTranslations();

  return (
    <section className="lg:col-span-2">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">{t('social.ecosystemTitle') || 'Social Ecosystem'}</h2>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary animate-pulse" /><span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('social.liveFeed') || 'Live Feed'}</span></div>
        </div>

        <SocialFeed posts={posts} isLoading={isLoading} isLoggedIn={isLoggedIn} onRequireAuth={onRequireAuth} />

        {hasMore && !isLoading && (
          <div className="mt-6 flex justify-center">
            <button onClick={onLoadMore} className="px-6 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-all">{t('directory.loadMore')}</button>
          </div>
        )}
      </motion.div>
    </section>
  );
};
