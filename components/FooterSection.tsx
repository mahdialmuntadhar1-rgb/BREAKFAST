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
        <footer className="bg-dark-bg border-t border-white/5 pt-20 pb-10 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 text-2xl font-black text-white tracking-tighter">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow-primary/20">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span>Iraq<span className="text-primary">Compass</span></span>
                        </div>
                        <p className="text-white/60 leading-relaxed max-w-sm">
                            {t('footer.description') || 'Your ultimate guide to exploring Iraq. Discover hidden gems, connect with local businesses, and experience the rich culture of Mesopotamia.'}
                        </p>
                        <div className="flex items-center gap-4">
                            {[Globe, Heart, MessageCircle, Share2].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/50 transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerLinks.map((section, i) => (
                        <div key={i} className="space-y-6">
                            <h4 className="text-white font-bold uppercase tracking-widest text-xs opacity-40">
                                {t(section.titleKey)}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
                                            {t(link)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>© {currentYear} Iraq Compass. {t('footer.allRightsReserved') || 'All rights reserved.'}</span>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>{t('footer.systemStatus') || 'Systems Operational'}</span>
                        </div>
                        <div className="text-white/20 text-xs font-mono">
                            v2.4.0-stable
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
