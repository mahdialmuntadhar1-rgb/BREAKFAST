import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence } from 'motion/react';

export const InstallBanner: React.FC = () => {
    const [show, setShow] = useState(false);
    const { t } = useTranslations();

    useEffect(() => {
        // Show banner after 5 seconds if not dismissed
        const dismissed = localStorage.getItem('iraq-compass-install-dismissed');
        if (!dismissed) {
            const timer = setTimeout(() => setShow(true), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setShow(false);
        localStorage.setItem('iraq-compass-install-dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-32 left-4 right-4 z-40 md:hidden"
                >
                    <div className="relative overflow-hidden p-4 rounded-3xl bg-primary/20 backdrop-blur-3xl border border-primary/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 pointer-events-none" />
                        
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow-primary/30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-black text-sm uppercase tracking-tight">
                                    {t('pwa.installTitle') || 'Iraq Compass App'}
                                </h4>
                                <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">
                                    {t('pwa.installDesc') || 'Install for a faster, offline experience'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    className="px-4 py-2 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                                    onClick={() => {
                                        // In a real PWA, this would trigger the install prompt
                                        alert('To install: Tap the Share icon and then "Add to Home Screen"');
                                        handleDismiss();
                                    }}
                                >
                                    {t('pwa.installBtn') || 'Install'}
                                </button>
                                <button 
                                    onClick={handleDismiss}
                                    className="p-2 rounded-xl bg-white/10 text-white/40 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
