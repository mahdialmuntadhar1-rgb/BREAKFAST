import React from 'react';
import { stories } from '../constants';
import { useTranslations } from '../hooks/useTranslations';
import { Check, Plus } from './icons';

import { motion } from 'motion/react';

const AddStoryButton = () => {
    const { t } = useTranslations();
    return (
        <div className="flex-shrink-0 group cursor-pointer">
            <div className="relative w-24 h-24 rounded-full p-1 bg-white/5 border border-dashed border-white/20 group-hover:border-primary transition-all duration-500">
                <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center mt-3 group-hover:text-white transition-colors">
                {t('stories.add') || 'Your Story'}
            </p>
        </div>
    );
}

export const StoriesRing: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="relative -mt-16 z-30">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-6 overflow-x-auto pb-8 scrollbar-hide">
                    <AddStoryButton />
                    {stories.map((story, index) => (
                        <motion.div 
                            key={story.id} 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex-shrink-0 group cursor-pointer"
                        >
                            <div className={`relative w-24 h-24 rounded-full p-1 transition-all duration-500 ${story.viewed ? 'bg-white/10' : 'bg-gradient-to-tr from-primary via-accent to-secondary animate-gradient-xy'}`}>
                                <div className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-50 bg-inherit transition-opacity duration-500" />
                                <div className="relative z-10 w-full h-full rounded-full bg-black p-1 group-hover:scale-105 transition-transform duration-500">
                                    <img 
                                        src={story.avatar} 
                                        alt={story.name}
                                        className="w-full h-full rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                                    />
                                    {story.verified && (
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-4 border-black shadow-xl">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 text-center mt-3 group-hover:text-white transition-colors truncate max-w-[96px]">
                                {story.name}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};