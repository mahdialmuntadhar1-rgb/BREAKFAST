import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from '../hooks/useTranslations';
import { Star, MapPin, Phone, MessageCircle, Share2, ArrowLeft, CheckCircle, Globe, Clock, Info, Calendar, Send } from './icons';
import { GlassCard } from './GlassCard';
import { SocialFeed } from './SocialFeed';
import type { Business, Post } from '../types';
import { categories } from '../constants';

interface BusinessProfileProps {
    business: Business;
    posts: Post[];
    onBack: () => void;
    isLoggedIn: boolean;
}

export const BusinessProfile: React.FC<BusinessProfileProps> = ({ 
    business, 
    posts, 
    onBack,
    isLoggedIn 
}) => {
    const { t, lang } = useTranslations();
    
    const displayName = lang === 'ar' && business.nameAr ? business.nameAr : 
                        lang === 'ku' && business.nameKu ? business.nameKu : 
                        business.name;
                        
    const displayImage = business.imageUrl || business.image || business.coverImage || 'https://picsum.photos/seed/placeholder/800/400';
    const displayLogo = business.avatar || 'https://picsum.photos/seed/logo/200/200';
    const businessPosts = posts.filter(p => p.businessId === business.id);

    return (
        <div className="min-h-screen bg-dark-bg pb-24">
            {/* Header / Cover Section */}
            <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={displayImage} 
                    alt={displayName}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/20 to-transparent" />
                
                {/* Back Button */}
                <button 
                    onClick={onBack}
                    className="absolute top-8 left-8 z-50 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Cover Actions */}
                <div className="absolute top-8 right-8 z-50 flex gap-3">
                    <button className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all">
                        <Share2 className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Identity & Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Identity Card */}
                        <GlassCard className="p-8 border-white/10">
                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <img 
                                        src={displayLogo} 
                                        alt={displayName} 
                                        className="relative w-32 h-32 rounded-3xl object-cover border-4 border-white/10 shadow-2xl"
                                    />
                                    {business.isVerified && (
                                        <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl shadow-lg border-2 border-dark-bg">
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                            {displayName}
                                        </h1>
                                        {business.isVerified && (
                                            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                                {t('featured.verified') || 'Verified'}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-6 text-white/60">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-white/5">
                                                <Star className="w-4 h-4 text-accent fill-accent" />
                                            </div>
                                            <span className="text-white font-bold">{business.rating}</span>
                                            <span className="text-xs uppercase tracking-widest">({business.reviewCount || 0} {t('profile.reviews') || 'Reviews'})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-white/5">
                                                <MapPin className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium">{business.city}, {t(governorates.find(g => g.id === business.governorate)?.nameKey || business.governorate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-white/5">
                                                <Clock className="w-4 h-4 text-secondary" />
                                            </div>
                                            <span className="text-sm font-medium text-green-400">{t('profile.openNow') || 'Open Now'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-black uppercase tracking-widest">
                                            {t(categories.find(c => c.id === business.category)?.nameKey || business.category)}
                                        </span>
                                        {business.subcategories?.map(sub => (
                                            <span key={sub} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* About Section */}
                        <GlassCard className="p-8 border-white/10">
                            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                {t('profile.about') || 'About the Business'}
                            </h2>
                            <p className="text-white/70 text-lg leading-relaxed font-medium">
                                {business.description || t('profile.noDescription') || 'No description available for this business yet.'}
                            </p>
                        </GlassCard>

                        {/* Gallery Section */}
                        <GlassCard className="p-8 border-white/10">
                            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-secondary rounded-full" />
                                {t('profile.gallery') || 'Gallery'}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <motion.div 
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer"
                                    >
                                        <img 
                                            src={`https://picsum.photos/seed/biz-${business.id}-${i}/400/400`} 
                                            alt={`Gallery ${i}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Updates Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 px-2">
                                <div className="w-1.5 h-6 bg-accent rounded-full" />
                                {t('profile.updates') || 'Recent Updates'}
                            </h2>
                            <SocialFeed 
                                posts={businessPosts} 
                                isLoggedIn={isLoggedIn}
                            />
                        </div>
                    </div>

                    {/* Right Column: Actions & Contact */}
                    <div className="space-y-8">
                        <GlassCard className="p-8 border-white/10 sticky top-32">
                            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8">
                                {t('profile.contact') || 'Get in Touch'}
                            </h2>
                            
                            <div className="space-y-4">
                                <button className="w-full group flex items-center justify-between p-5 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs hover:shadow-glow-primary transition-all active:scale-95">
                                    <div className="flex items-center gap-4">
                                        <Phone className="w-5 h-5" />
                                        <span>{t('profile.callNow') || 'Call Now'}</span>
                                    </div>
                                    <span className="text-white/60 group-hover:text-white transition-colors">→</span>
                                </button>
                                
                                <button className="w-full group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all active:scale-95">
                                    <div className="flex items-center gap-4">
                                        <MessageCircle className="w-5 h-5 text-secondary" />
                                        <span>{t('profile.message') || 'Send Message'}</span>
                                    </div>
                                    <span className="text-white/20 group-hover:text-white transition-colors">→</span>
                                </button>

                                <div className="pt-8 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                            <Globe className="w-5 h-5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{t('profile.website') || 'Website'}</p>
                                            <p className="text-sm font-bold text-white">www.{business.id}.iq</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                            <Share2 className="w-5 h-5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Social</p>
                                            <p className="text-sm font-bold text-white">@{business.id}_official</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                            <Globe className="w-5 h-5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Facebook</p>
                                            <p className="text-sm font-bold text-white">{displayName}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 relative group">
                                        <img 
                                            src="https://picsum.photos/seed/map/400/200" 
                                            alt="Map"
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button className="px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:border-primary transition-all">
                                                {t('profile.openMaps') || 'Open in Maps'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

const governorates = [
    { id: 'baghdad', nameKey: 'governorates.baghdad' },
    { id: 'erbil', nameKey: 'governorates.erbil' },
    { id: 'basra', nameKey: 'governorates.basra' },
    { id: 'sulaymaniyah', nameKey: 'governorates.sulaymaniyah' },
    { id: 'duhok', nameKey: 'governorates.duhok' },
    { id: 'nineveh', nameKey: 'governorates.nineveh' },
    { id: 'kirkuk', nameKey: 'governorates.kirkuk' },
    { id: 'najaf', nameKey: 'governorates.najaf' },
    { id: 'karbala', nameKey: 'governorates.karbala' },
    { id: 'anbar', nameKey: 'governorates.anbar' },
    { id: 'babil', nameKey: 'governorates.babil' },
    { id: 'diyala', nameKey: 'governorates.diyala' },
    { id: 'dhi-qar', nameKey: 'governorates.dhiQar' },
    { id: 'maysan', nameKey: 'governorates.maysan' },
    { id: 'al-qadisiyah', nameKey: 'governorates.alQadisiyah' },
    { id: 'wasit', nameKey: 'governorates.wasit' },
    { id: 'muthanna', nameKey: 'governorates.muthanna' },
    { id: 'saladin', nameKey: 'governorates.saladin' }
];
