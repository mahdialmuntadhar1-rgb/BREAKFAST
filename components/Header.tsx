import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Sparkles, User as UserIcon, LogOut, LayoutDashboard, ChevronDown } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { LanguageSelector } from './LanguageSelector';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
    isLoggedIn: boolean;
    user: User | null;
    onSignIn: () => void;
    onSignOut: () => void;
    onDashboard: () => void;
    onHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, user, onSignIn, onSignOut, onDashboard, onHome }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { t } = useTranslations();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 border-b ${
                isScrolled 
                ? 'py-4 backdrop-blur-3xl bg-black/60 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
                : 'py-8 bg-transparent border-transparent'
            }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <motion.button 
                    onClick={onHome} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center gap-3.5 text-3xl font-black text-white tracking-tighter"
                >
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-secondary group-hover:rotate-12 transition-all duration-500 shadow-glow-primary/30">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <span className="flex items-center">
                        Iraq<span className="text-primary group-hover:text-secondary transition-colors duration-500">Compass</span>
                    </span>
                </motion.button>

                <nav className="flex items-center gap-4 sm:gap-8 rtl:flex-row-reverse">
                    <div className="hidden lg:flex items-center gap-8 mr-4">
                        {['home', 'explore', 'community', 'deals'].map((item) => (
                            <button 
                                key={item}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors duration-300"
                            >
                                {t(`nav.${item}`) || item}
                            </button>
                        ))}
                    </div>

                    <LanguageSelector />
                    
                    {isLoggedIn && user ? (
                        <div className="relative">
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)} 
                                className={`flex items-center gap-4 p-1.5 pr-5 rounded-2xl transition-all duration-500 border ${
                                    dropdownOpen 
                                    ? 'bg-primary/10 border-primary/40 ring-8 ring-primary/5 shadow-2xl' 
                                    : 'bg-white/5 hover:bg-white/10 border-white/10 shadow-xl'
                                }`}
                            >
                                <div className="relative">
                                    <img 
                                        src={user.avatar} 
                                        alt={user.name} 
                                        className="w-10 h-10 rounded-xl border-2 border-primary/20 object-cover shadow-lg" 
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-black shadow-lg" />
                                </div>
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="text-start">
                                        <p className="text-white font-black text-xs tracking-tight leading-none mb-1">{user.name}</p>
                                        <p className="text-white/30 text-[8px] font-black uppercase tracking-widest leading-none">Premium Member</p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-[-1]" 
                                            onClick={() => setDropdownOpen(false)} 
                                        />
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(20px)' }}
                                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(20px)' }}
                                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                            className="absolute end-0 mt-4 w-72 backdrop-blur-3xl bg-black/80 border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-3 overflow-hidden"
                                        >
                                            <div className="px-5 py-4 mb-3 border-b border-white/5 bg-white/5 rounded-2xl">
                                                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-2">{t('header.account') || 'Account'}</p>
                                                <p className="text-white font-bold truncate text-sm">{user.email}</p>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <button 
                                                    onClick={() => { onDashboard(); setDropdownOpen(false); }} 
                                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                        <LayoutDashboard className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                                                    </div>
                                                    <span className="font-black text-xs uppercase tracking-widest">{t('header.dashboard')}</span>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => { onSignOut(); setDropdownOpen(false); }} 
                                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                                        <LogOut className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                                                    </div>
                                                    <span className="font-black text-xs uppercase tracking-widest">{t('header.logout')}</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.button 
                            onClick={onSignIn} 
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-glow-primary/30 transition-all duration-500 flex items-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <UserIcon className="w-4 h-4 relative z-10" /> 
                            <span className="relative z-10 hidden sm:inline">{t('header.signIn')}</span>
                        </motion.button>
                    )}
                </nav>
            </div>
        </header>
    );
}

