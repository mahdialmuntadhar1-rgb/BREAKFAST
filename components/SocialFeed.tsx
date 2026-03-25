import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle } from './icons';
import { GlassCard } from './GlassCard';
import { useTranslations } from '../hooks/useTranslations';
import type { Post } from '../types';

interface SocialFeedProps {
    posts: Post[];
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onShare?: (postId: string) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, onLike, onComment, onShare }) => {
    const { t } = useTranslations();
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

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

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {posts.map((post) => (
                <GlassCard key={post.id} className="p-0 overflow-hidden border-white/10 hover:border-white/20 transition-all duration-300">
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src={post.businessAvatar} alt={post.businessName} className="w-10 h-10 rounded-full border border-primary/30" />
                                {post.verified && (
                                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5 border border-dark-bg">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white flex items-center gap-1">
                                    {post.businessName}
                                    {post.verified && <CheckCircle className="w-3 h-3 text-primary" />}
                                </h3>
                                <p className="text-xs text-white/50">{post.createdAt.toLocaleString()}</p>
                            </div>
                        </div>
                        <button className="p-2 rounded-full hover:bg-white/5 text-white/50 transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-4">
                        <p className="text-white/90 leading-relaxed mb-4">{post.caption}</p>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-video bg-white/5">
                        <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-2 transition-colors ${likedPosts.has(post.id) ? 'text-accent' : 'text-white/60 hover:text-accent'}`}
                            >
                                <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                <span className="text-sm font-medium">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                            </button>
                            <button 
                                onClick={() => onComment?.(post.id)}
                                className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{t('social.comments') || "Comments"}</span>
                            </button>
                        </div>
                        <button 
                            onClick={() => onShare?.(post.id)}
                            className="flex items-center gap-2 text-white/60 hover:text-secondary transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm font-medium">{t('social.share') || "Share"}</span>
                        </button>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
};
