import React from 'react';
import { Sparkles, Globe, ShieldCheck, Heart, MessageCircle, Share2 } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'motion/react';

export const FooterSection: React.FC = () => {
    const { t } = useTranslations();
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        { titleKey: 'footer.about', links: ['footer.ourStory', 'footer.mission', 'footer.team'] },
        { titleKey: 'footer.support', links: ['footer.helpCenter', 'footer.safety', 'footer.contact'] },
        { titleKey: 'footer.legal', links: ['footer.privacy', 'footer.terms', 'footer.cookies'] }
    ];

    return (
        <footer className="bg-black border-t border-white/5 pt-32 pb-12 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16 mb-24">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-3 text-3xl font-black text-white tracking-tighter">
                            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-glow-primary/20">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <span>Iraq<span className="text-primary">Compass</span></span>
                        </div>
                        <p className="text-white/50 leading-relaxed max-w-sm text-base font-medium">
                            {t('footer.description') || 'The definitive AI-powered platform for discovering the heartbeat of Mesopotamia. From ancient wonders to modern luxuries.'}
                        </p>
                        <div className="flex items-center gap-4">
                            {[Globe, Heart, MessageCircle, Share2].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-primary hover:border-primary transition-all duration-500 shadow-xl"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerLinks.map((section, i) => (
                        <div key={i} className="space-y-8">
                            <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] opacity-30">
                                {t(section.titleKey)}
                            </h4>
                            <ul className="space-y-5">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <a href="#" className="group flex items-center gap-2 text-white/40 hover:text-white transition-all duration-300 text-sm font-bold">
                                            <div className="w-0 group-hover:w-4 h-0.5 bg-primary transition-all duration-300" />
                                            {t(link)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter / CTA */}
                    <div className="lg:col-span-1 space-y-8">
                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] opacity-30">
                            {t('footer.newsletter') || 'Stay Updated'}
                        </h4>
                        <div className="relative group">
                            <input 
                                type="email" 
                                placeholder={t('footer.emailPlaceholder') || 'Email Address'}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all duration-500"
                            />
                            <button className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-colors duration-500">
                                {t('footer.join') || 'Join'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 text-white/30 text-xs font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span>© {currentYear} Iraq Compass. {t('footer.allRightsReserved') || 'All rights reserved.'}</span>
                    </div>
                    
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3 text-white/30 text-xs font-bold uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <span>{t('footer.systemStatus') || 'Systems Operational'}</span>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/20 text-[10px] font-mono tracking-tighter">
                            v2.5.0-premium
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
