import React, { useState } from 'react';
import { Image, Send, X } from './icons';
import { GlassCard } from './GlassCard';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence } from 'motion/react';
import type { Post } from '../types';

interface SocialPostBoxProps {
    businessId: string;
    businessName: string;
    businessAvatar: string;
    onSubmit?: (post: Partial<Post>) => void;
}

export const SocialPostBox: React.FC<SocialPostBoxProps> = ({ businessId, businessName, businessAvatar, onSubmit }) => {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const { t } = useTranslations();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caption || !image) return;

        setIsPosting(true);
        try {
            if (onSubmit) {
                await onSubmit({
                    caption,
                    imageUrl: image,
                    createdAt: new Date(),
                    likes: 0
                });
            }
            setCaption('');
            setImage(null);
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <GlassCard className="p-6 mb-8 border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <img src={businessAvatar} alt={businessName} className="w-12 h-12 rounded-full border-2 border-primary/30" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-bg" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">{businessName}</h3>
                    <p className="text-xs text-white/40">{t('social.postingAs') || 'Posting as business'}</p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={t('social.postPlaceholder')}
                        className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-lg outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all resize-none min-h-[120px]"
                        maxLength={500}
                    />
                    <div className="absolute bottom-3 right-4 text-xs text-white/20 font-mono">
                        {caption.length}/500
                    </div>
                </div>
                
                <AnimatePresence>
                    {image && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, height: 0 }}
                            animate={{ opacity: 1, scale: 1, height: 'auto' }}
                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                            className="relative rounded-2xl overflow-hidden border border-white/10 group"
                        >
                            <img src={image} alt="Preview" className="w-full h-64 object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button 
                                type="button"
                                onClick={() => setImage(null)}
                                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 hover:scale-110 transition-all backdrop-blur-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-white/5">
                        <Image className="w-6 h-6 text-primary" />
                        <span className="text-sm font-bold">{t('social.addPhoto')}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    
                    <button 
                        type="submit"
                        disabled={!caption || !image || isPosting}
                        className="flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-glow-primary transition-all transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isPosting ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>{t('social.post')}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </GlassCard>
    );
};

