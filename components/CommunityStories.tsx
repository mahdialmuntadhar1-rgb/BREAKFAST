import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import type { Story } from '../types';
import { Briefcase, Users, ShieldCheck, Plus } from './icons';
import { StoryViewer } from './StoryViewer';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'motion/react';

interface CommunityStoriesProps { selectedGovernorate?: string }

export const CommunityStories: React.FC<CommunityStoriesProps> = ({ selectedGovernorate = 'all' }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const { t } = useTranslations();

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const data = await api.getStories();
        setStories(data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  const visibleStories = useMemo(() => stories.slice(0, visibleCount), [stories, visibleCount]);
  const hasMore = visibleCount < stories.length;

  if (isLoading) return <div className="py-16 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <section className="py-14 bg-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-96 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {selectedGovernorate !== 'all' && <p className="mb-8 inline-flex px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">Stories in {selectedGovernorate}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {stories.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6 opacity-80">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center"><Plus className="w-10 h-10 text-white" /></div>
              <p className="text-white text-sm">No stories yet in your city.</p>
            </div>
          ) : (
            visibleStories.map((story, index) => (
              <motion.div key={story.id} initial={{ opacity: 0, scale: 0.95, y: 12 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: index * 0.03 }} onClick={() => setActiveStory(story)} className="cursor-pointer group relative hover:-translate-y-1 transition-transform">
                <div className="relative aspect-[9/16] rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-primary/50 transition-all duration-300 shadow-2xl">
                  <img src={story.thumbnail} alt={story.userName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      {story.isLive && <div className="px-3 py-1.5 rounded-xl bg-red-500 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /><span className="text-white text-[8px] font-black uppercase tracking-widest">Live</span></div>}
                      {story.aiVerified && <div className="w-8 h-8 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-secondary" /></div>}
                    </div>
                    <div className="space-y-2">
                      <span className="text-white text-xs font-black truncate block">{story.userName}</span>
                      <div className="flex items-center gap-1 text-white/50 text-[8px] font-black uppercase tracking-widest">{story.type === 'business' ? <Briefcase className="w-2 h-2" /> : <Users className="w-2 h-2" />}<span>{t(`stories.${story.type}`)}</span></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="aspect-[9/16] rounded-[2rem] bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-primary/50 transition-all duration-500 cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"><Plus className="w-8 h-8 text-white" /></div>
            <span className="text-white text-xs font-black uppercase tracking-widest block">Post Story</span>
          </motion.div>
        </div>
        {hasMore && (
          <div className="mt-8 text-center">
            <button onClick={() => setPage((p) => p + 1)} className="px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20">
              {t('directory.loadMore')}
            </button>
          </div>
        )}
      </div>
      {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />}
    </section>
  );
};
