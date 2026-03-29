import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Story } from '../types';
import { Briefcase, Users, ShieldCheck, Plus } from './icons';
import { StoryViewer } from './StoryViewer';
import { useTranslations } from '../hooks/useTranslations';
import { useAppPreferences } from '../hooks/useAppPreferences';

interface CommunityStoriesProps {
  externalActiveStory?: Story | null;
  onStoryOpen?: (story: Story | null) => void;
}

export const CommunityStories: React.FC<CommunityStoriesProps> = ({ externalActiveStory, onStoryOpen }) => {
  const { governorate } = useAppPreferences();
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(externalActiveStory ?? null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslations();

  useEffect(() => {
    setActiveStory(externalActiveStory ?? null);
  }, [externalActiveStory]);

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const result = await api.getStories({ governorate, limit: 6, offset: 0 });
        setStories(result.data);
        setOffset(result.nextOffset);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Error fetching stories:', error);
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, [governorate]);

  const loadMore = async () => {
    const result = await api.getStories({ governorate, limit: 6, offset });
    setStories((prev) => [...prev, ...result.data]);
    setOffset(result.nextOffset);
    setHasMore(result.hasMore);
  };

  if (isLoading) return <div className="py-16 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('stories.communityTitle')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stories.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-50"><Plus className="w-12 h-12 text-white/20 mb-4" /><p className="text-white/60 text-sm">{t('stories.noStories')}</p></div>
          ) : stories.map((story) => (
            <div key={story.id} onClick={() => { setActiveStory(story); onStoryOpen?.(story); }} className="cursor-pointer group">
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-transparent group-hover:border-primary transition-colors">
                <img src={story.thumbnail} alt={story.userName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 start-3 end-3">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full border-2 border-white"><img src={story.avatar} alt={story.userName} className="w-full h-full rounded-full" /></div><span className="text-white text-sm font-medium truncate">{story.userName}</span></div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${story.type === 'business' ? 'bg-primary/80' : 'bg-secondary/80'}`}>{story.type === 'business' ? <Briefcase className="w-3 h-3" /> : <Users className="w-3 h-3" />}<span>{t(`stories.${story.type}`)}</span></div>
                </div>
                {story.aiVerified && <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-dark-bg" /></div>}
              </div>
            </div>
          ))}
        </div>
        {hasMore && <div className="text-center mt-6"><button onClick={loadMore} className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20">{t('directory.loadMore')}</button></div>}
      </div>
      {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />}
    </section>
  );
};
