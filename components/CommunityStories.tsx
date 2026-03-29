import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Story } from '../types';
import { Briefcase, Users, ShieldCheck, Plus } from './icons';
import { StoryViewer } from './StoryViewer';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence } from 'motion/react';

export const CommunityStories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const { t } = useTranslations();

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const data = await api.getStories();
        setStories(data);
        setVisibleCount(8);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-96 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.2em]">
                    <Users className="w-3 h-3" />
                    {t('stories.communityTitle') || 'Community Pulse'}
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter">
                    {t('stories.latestUpdates') || 'Live from Iraq'}
                </h2>
                <p className="text-white/40 font-medium">
                    {t('stories.description') || 'Real-time moments shared by businesses and explorers across the governorates.'}
                </p>
            </div>
            <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-primary/50 transition-all duration-500">
                {t('stories.viewAll') || 'View All Stories'}
            </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {stories.length === 0 && !isLoading ? (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <p className="text-white text-xs font-black uppercase tracking-widest">{t('stories.noStories') || "No stories shared yet."}</p>
            </div>
          ) : (
            stories.slice(0, visibleCount).map((story, index) => (
            <motion.div 
                key={story.id} 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveStory(story)} 
                className="cursor-pointer group relative"
            >
              <div className="relative aspect-[9/16] rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-primary/50 transition-all duration-500 shadow-2xl">
                <img 
                    src={story.thumbnail} 
                    alt={story.userName} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        {story.isLive && (
                          <div className="px-3 py-1.5 rounded-xl bg-red-500 flex items-center gap-2 shadow-lg shadow-red-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span className="text-white text-[8px] font-black uppercase tracking-widest">{t('stories.live') || 'Live'}</span>
                          </div>
                        )}
                        {story.aiVerified && (
                          <div className="w-8 h-8 rounded-xl bg-secondary/20 backdrop-blur-xl border border-secondary/30 flex items-center justify-center shadow-lg">
                            <ShieldCheck className="w-4 h-4 text-secondary" />
                          </div>
                        )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border-2 border-primary p-0.5 bg-black/40 backdrop-blur-md">
                          <img src={story.avatar} alt={story.userName} className="w-full h-full rounded-lg object-cover" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-white text-xs font-black truncate block">{story.userName}</span>
                            <div className="flex items-center gap-1 text-white/40 text-[8px] font-black uppercase tracking-widest">
                                {story.type === 'business' ? <Briefcase className="w-2 h-2" /> : <Users className="w-2 h-2" />}
                                <span>{t(`stories.${story.type}`)}</span>
                            </div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </motion.div>
          )))}

          {/* Add Story Button */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="aspect-[9/16] rounded-[2rem] bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-primary/50 transition-all duration-500 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-1">
                <span className="text-white text-xs font-black uppercase tracking-widest block">{t('stories.addYours') || 'Post Story'}</span>
                <span className="text-white/20 text-[8px] font-black uppercase tracking-widest block">Share your moment</span>
            </div>
          </motion.div>
        </div>

        {stories.length > 0 && (
          <div className="mt-8 space-y-3">
            {visibleCount < stories.length ? (
              <button onClick={() => setVisibleCount((prev) => prev + 6)} className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all cursor-pointer">
                Load more stories
              </button>
            ) : (
              <p className="text-center text-white/50">You reached the end</p>
            )}
            <p className="text-center text-xs uppercase tracking-widest text-white/40">Stories in your city</p>
          </div>
        )}
      </div>
      {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />}
    </section>
  );
};
