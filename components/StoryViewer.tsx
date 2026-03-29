import React, { useState, useEffect } from 'react';
import type { Story } from '../types';
import { VolumeX, Volume2, X, Heart } from './icons';
import { useTranslations } from '../hooks/useTranslations';

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslations();

  useEffect(() => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress >= 100) {
          handleNext();
          return 0;
        }
        return Math.min(oldProgress + 0.5, 100);
      });
    }, 25); // ~5 seconds per story

    return () => clearInterval(timer);
  }, [currentIndex, story.media.length, onClose]);
  
  const handleNext = React.useCallback(() => {
      if(currentIndex < story.media.length - 1) {
          setCurrentIndex(i => i + 1);
      } else {
          onClose();
      }
  }, [currentIndex, story.media.length, onClose]);
  
  const handlePrevious = () => {
      if(currentIndex > 0) {
          setCurrentIndex(i => i - 1);
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div className="relative w-full h-full max-w-lg mx-auto aspect-[9/16]">
            <div className="absolute top-4 start-4 end-4 flex gap-1 z-20">
            {story.media.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%' }} />
                </div>
            ))}
            </div>

            <div className="absolute top-8 start-4 end-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
                <img src={story.avatar} alt={story.userName} className="w-10 h-10 rounded-full border-2 border-white" />
                <div>
                <p className="text-white font-semibold">{story.userName}</p>
                <p className="text-white/80 text-sm">{story.timeAgo}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/20 flex items-center justify-center">{isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}</button>
                <button onClick={onClose} className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/20 flex items-center justify-center"><X className="w-5 h-5 text-white" /></button>
            </div>
            </div>
            
            <img src={story.media[currentIndex]} alt="" className="w-full h-full object-cover rounded-lg" />

            <div className="absolute inset-0 flex">
                <div className="flex-1 cursor-pointer" onClick={handlePrevious} />
                <div className="flex-1 cursor-pointer" onClick={handleNext} />
            </div>

            <div className="absolute bottom-4 start-4 end-4 flex items-center gap-2 z-20">
                <input type="text" placeholder={t('stories.sendMessage')} className="flex-1 px-4 py-3 rounded-full backdrop-blur-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 outline-none focus:border-primary" />
                <button className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center hover:scale-110 transition-transform"><Heart className="w-5 h-5 text-white" /></button>
            </div>
        </div>
    </div>
  );
};