import React from 'react';
import { stories } from '../constants';
import { useTranslations } from '../hooks/useTranslations';
import { Check, Plus } from './icons';
import type { Story } from '../types';
import { StoryViewer } from './StoryViewer';

interface StoriesRingProps {
  onStoryOpen?: (story: Story | null) => void;
  onRequireAuth: () => void;
  isLoggedIn: boolean;
}

export const StoriesRing: React.FC<StoriesRingProps> = ({ onStoryOpen, onRequireAuth, isLoggedIn }) => {
  const { t } = useTranslations();
  const [activeStory, setActiveStory] = React.useState<Story | null>(null);

  const openStory = (story: Story) => {
    setActiveStory(story);
    onStoryOpen?.(story);
  };

  return (
    <div className="relative -mt-12 z-20">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {stories.map((story) => (
            <div key={story.id} className="flex-shrink-0 cursor-pointer" onClick={() => openStory(story as Story)}>
              <div className={`relative w-20 h-20 rounded-full p-0.5 ${story.viewed ? 'bg-white/20' : 'bg-gradient-to-tr from-primary via-accent to-secondary'}`}>
                <div className="w-full h-full rounded-full backdrop-blur-xl bg-dark-bg/80 flex items-center justify-center hover:scale-110 transition-transform p-1">
                  <img src={story.avatar} alt={story.name} className="w-full h-full rounded-full object-cover" />
                  {story.verified && <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 border-dark-bg"><Check className="w-4 h-4 text-dark-bg" /></div>}
                </div>
              </div>
              <p className="text-xs text-white/80 text-center mt-2 max-w-[80px] truncate">{story.name}</p>
            </div>
          ))}
          <div className="flex-shrink-0" onClick={onRequireAuth}>
            <div className="relative w-20 h-20 rounded-full p-0.5 bg-white/20">
              <div className={`w-full h-full rounded-full backdrop-blur-xl bg-dark-bg/80 flex items-center justify-center transition-transform border-2 border-dashed border-white/30 ${isLoggedIn ? 'hover:scale-110 cursor-pointer' : 'cursor-pointer'}`}>
                <Plus className="w-8 h-8 text-white/50" />
              </div>
            </div>
            <p className="text-xs text-white/80 text-center mt-2 max-w-[80px] truncate">{t('stories.add')}</p>
          </div>
        </div>
      </div>
      {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />}
    </div>
  );
};
