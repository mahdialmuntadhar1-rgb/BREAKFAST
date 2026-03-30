import React from 'react';
import { Home, Search, Heart, User, Sparkles } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'motion/react';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isLoggedIn: boolean;
    onSignIn: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, isLoggedIn, onSignIn }) => {
    const { t } = useTranslations();

    const tabs = [
        { id: 'home', icon: Home, label: t('nav.home') || 'Home' },
        { id: 'explore', icon: Search, label: t('nav.explore') || 'Explore' },
        { id: 'deals', icon: Sparkles, label: t('nav.deals') || 'Deals' },
        { id: 'profile', icon: User, label: isLoggedIn ? (t('nav.profile') || 'Profile') : (t('header.signIn') || 'Sign In') }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none">
            <div className="max-w-md mx-auto flex items-center justify-between p-2 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'profile' && !isLoggedIn) {
                                    onSignIn();
                                } else {
                                    onTabChange(tab.id);
                                }
                            }}
                            className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary/20 rounded-3xl border border-primary/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={`w-6 h-6 transition-all duration-500 ${isActive ? 'text-primary scale-110' : 'text-white/40 group-hover:text-white'}`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest transition-all duration-500 ${isActive ? 'text-white opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-40'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
