import React, { useState } from 'react';
import { Image, Send, X, Loader2 } from './icons';
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
        <GlassCard className="p-8 mb-12 border-white/10 hover:border-white/20 transition-all duration-500 group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex items-center gap-5 mb-8">
                <div className="relative group/avatar">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-20 group-hover/avatar:opacity-50 transition-opacity duration-500" />
                    <img src={businessAvatar} alt={businessName} className="relative w-14 h-14 rounded-full border-2 border-white/10 object-cover" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0A0A0B] shadow-lg" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-black text-white text-xl tracking-tight leading-none">{businessName}</h3>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t('social.postingAs') || 'Business Account'}</p>
                    </div>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative group/textarea">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur opacity-0 group-focus-within/textarea:opacity-100 transition-opacity duration-500" />
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={t('social.postPlaceholder') || "What's happening in your business?"}
                        className="relative w-full px-6 py-5 rounded-3xl bg-white/5 border border-white/10 text-white text-lg font-medium outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all resize-none min-h-[160px] placeholder:text-white/20"
                        maxLength={500}
                    />
                    <div className="absolute bottom-4 right-6 text-[10px] font-black text-white/20 uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                        {caption.length} / 500
                    </div>
                </div>
                
                <AnimatePresence>
                    {image && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative rounded-3xl overflow-hidden border border-white/10 group/preview aspect-video shadow-2xl"
                        >
                            <img src={image} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500" />
                            <button 
                                type="button"
                                onClick={() => setImage(null)}
                                className="absolute top-4 right-4 p-3 rounded-2xl bg-black/60 text-white hover:bg-red-500 hover:scale-110 transition-all backdrop-blur-xl border border-white/10 shadow-2xl"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                    <label className="w-full sm:w-auto flex items-center justify-center gap-4 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-white/10 group/upload">
                        <Image className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{t('social.addPhoto') || 'Add Visuals'}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    
                    <button 
                        type="submit"
                        disabled={!caption || !image || isPosting}
                        className="w-full sm:w-auto group relative px-12 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 hover:shadow-glow-primary/40 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            {isPosting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>{t('social.post') || 'Publish Update'}</span>
                                </>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                    </button>
                </div>
            </form>
        </GlassCard>
    );
};

