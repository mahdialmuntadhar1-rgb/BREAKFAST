import React, { useMemo, useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle } from './icons';
import { GlassCard } from './GlassCard';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence } from 'motion/react';
import type { Post } from '../types';

interface SocialFeedProps {
    posts: Post[];
    isLoading?: boolean;
    isLoggedIn?: boolean;
    selectedGovernorate?: string;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onShare?: (postId: string) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, isLoading, isLoggedIn, selectedGovernorate = 'all', onLike, onComment, onShare }) => {
    const { t, lang } = useTranslations();
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [visibleCount, setVisibleCount] = useState(4);
    const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);
    const hasMore = visibleCount < posts.length;

    const handleLike = (postId: string) => {
        const newLikedPosts = new Set(likedPosts);
        if (newLikedPosts.has(postId)) {
            newLikedPosts.delete(postId);
        } else {
            newLikedPosts.add(postId);
        }
        setLikedPosts(newLikedPosts);
        onLike?.(postId);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/10" />
                            <div className="space-y-2 flex-1">
                                <div className="w-32 h-4 bg-white/10 rounded" />
                                <div className="w-20 h-3 bg-white/10 rounded" />
                            </div>
                        </div>
                        <div className="w-full h-4 bg-white/10 rounded mb-2" />
                        <div className="w-2/3 h-4 bg-white/10 rounded mb-4" />
                        <div className="w-full aspect-video bg-white/10 rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {selectedGovernorate !== 'all' && (
                <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs uppercase tracking-widest font-bold">
                    Posts in {selectedGovernorate}
                </div>
            )}
            <AnimatePresence mode="popLayout">
                {posts.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <MessageCircle className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">No posts yet in your area</h3>
                        <p className="text-white/50 text-base max-w-xs mx-auto">Be the first to share an update from your business.</p>
                    </motion.div>
                ) : (
                    visiblePosts.map((post, index) => (
                        <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6, delay: index * 0.06, ease: 'easeOut' }}>
                            <GlassCard className="p-0 overflow-hidden border-white/10 hover:border-primary/30 transition-all duration-500 group bg-black/40 backdrop-blur-3xl shadow-2xl hover:-translate-y-1 cursor-pointer">
                                <div className="p-6 flex items-center justify-between border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group/avatar">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-md opacity-0 group-hover/avatar:opacity-50 transition-opacity duration-500" />
                                            <img src={post.businessAvatar} alt={post.businessName} className="relative z-10 w-14 h-14 rounded-full border-2 border-white/10 group-hover:border-primary transition-all duration-500 object-cover" />
                                            {post.isVerified && <div className="absolute -bottom-1 -right-1 z-20 bg-primary rounded-full p-1 border-2 border-black shadow-lg"><CheckCircle className="w-3.5 h-3.5 text-white" /></div>}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white text-xl tracking-tight flex items-center gap-2 group-hover:text-primary transition-colors duration-300">{post.businessName}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                                {post.createdAt.toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-IQ' : 'ku-Arab-IQ', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-3 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all duration-300 border border-transparent hover:border-white/10 cursor-pointer">
                                        <MoreHorizontal className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="p-6"><p className="text-white/90 text-lg leading-relaxed font-medium tracking-tight">{post.caption}</p></div>
                                {post.imageUrl && <div className="relative aspect-[16/10] bg-white/5 overflow-hidden group/image"><img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" /></div>}
                                <div className="p-4 flex items-center justify-between bg-white/[0.03] border-t border-white/5">
                                    <div className="flex items-center gap-4 md:gap-8">
                                        <button onClick={() => isLoggedIn && handleLike(post.id)} disabled={!isLoggedIn} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 active:scale-90 border border-transparent ${!isLoggedIn ? 'opacity-30 cursor-not-allowed' : likedPosts.has(post.id) ? 'text-accent bg-accent/10 border-accent/20' : 'text-white/50 hover:text-accent hover:bg-accent/5 hover:border-accent/10 cursor-pointer'}`}>
                                            <Heart className={`w-6 h-6 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} /><span className="text-sm font-black uppercase tracking-widest">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                                        </button>
                                        <button onClick={() => isLoggedIn && onComment?.(post.id)} disabled={!isLoggedIn} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 active:scale-90 border border-transparent ${!isLoggedIn ? 'opacity-30 cursor-not-allowed' : 'text-white/50 hover:text-primary hover:bg-primary/5 hover:border-primary/10 cursor-pointer'}`}>
                                            <MessageCircle className="w-6 h-6" /><span className="text-sm font-black uppercase tracking-widest">{t('social.comments')}</span>
                                        </button>
                                    </div>
                                    <button onClick={() => onShare?.(post.id)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/50 hover:text-secondary hover:bg-secondary/5 border border-transparent hover:border-secondary/10 transition-all duration-300 active:scale-95 cursor-pointer">
                                        <Share2 className="w-6 h-6" /><span className="text-sm font-black uppercase tracking-widest">{t('social.share')}</span>
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>

            {posts.length > 0 && (
                <div className="pt-4 space-y-3">
                    {hasMore ? (
                        <button onClick={() => setVisibleCount((p) => p + 4)} className="w-full h-12 rounded-xl bg-gradient-to-r from-primary/90 to-secondary/90 text-white font-semibold hover:-translate-y-0.5 hover:shadow-glow-primary transition-all cursor-pointer">
                            Load more posts
                        </button>
                    ) : (
                        <p className="text-center text-white/60 text-sm">You reached the end</p>
                    )}
                </div>
            )}
        </div>
    );
};
