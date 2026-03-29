import React from 'react';
import { heroSlides } from '../constants';
import { useTranslations } from '../hooks/useTranslations';
import { Sparkles } from './icons';
import { motion, AnimatePresence } from 'motion/react';
import { FeaturedBusinesses } from './FeaturedBusinesses';

interface HeroSectionProps {
    onExplore?: () => void;
    onBusinessClick?: (business: any) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onBusinessClick }) => {
    const [activeSlide, setActiveSlide] = React.useState(0);
    const [activeSlogan, setActiveSlogan] = React.useState(0);
    const { t } = useTranslations();

    const slogans = (t('hero.slogans') as unknown as string[]) || [
        "Your Compass to Iraq's Best",
        "Discover. Connect. Grow.",
        "The Heart of Iraqi Business"
    ];

    React.useEffect(() => {
        const slideTimer = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % heroSlides.length);
        }, 6000);
        
        const sloganTimer = setInterval(() => {
            setActiveSlogan(prev => (prev + 1) % slogans.length);
        }, 3000);

        return () => {
            clearInterval(slideTimer);
            clearInterval(sloganTimer);
        };
    }, [slogans.length]);

    return (
        <section className="relative min-h-[80vh] md:min-h-[95vh] w-full overflow-hidden flex flex-col justify-center items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img 
                        src={heroSlides[activeSlide].image} 
                        alt={t(heroSlides[activeSlide].titleKey)} 
                        className="absolute inset-0 w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/40 via-dark-bg/70 to-dark-bg"></div>
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 container mx-auto px-4 text-center pt-20 pb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSlide}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-5xl mx-auto"
                    >
                        {/* Rotating Slogan Badge */}
                        <div className="h-12 mb-6 flex justify-center items-center">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeSlogan}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-xs md:text-sm font-black uppercase tracking-[0.2em] text-secondary-glow shadow-glow-secondary/10"
                                >
                                    <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                                    <span>{slogans[activeSlogan]}</span>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <h1 className="text-5xl lg:text-9xl font-black mb-8 text-white tracking-tighter leading-[0.9] uppercase italic">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent drop-shadow-2xl">
                                {t(heroSlides[activeSlide].titleKey)}
                            </span>
                        </h1>
                        <p className="text-lg md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto font-medium leading-relaxed tracking-wide line-clamp-3">
                            {t(heroSlides[activeSlide].subtitleKey)}
                        </p>
                        
                        <div className="flex flex-wrap gap-6 justify-center mb-20">
                            <button 
                                onClick={onExplore}
                                className="group relative px-12 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest overflow-hidden transition-all duration-500 hover:shadow-glow-primary hover:scale-105 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <span className="relative z-10 flex items-center gap-3">
                                    {t('actions.exploreBusinesses') || 'Explore Businesses'}
                                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
                                </span>
                            </button>
                            <button className="px-12 py-5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all duration-500 active:scale-95">
                                {t('actions.joinSignup') || 'Join / Sign Up'}
                            </button>
                        </div>

                        {/* Mini Stats Row */}
                        <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-3xl mx-auto pt-12 border-t border-white/10">
                            {[
                                { label: t('stats.businesses') || 'Businesses', value: '12,000+' },
                                { label: t('stats.cities') || 'Cities', value: '18' },
                                { label: t('stats.categories') || 'Categories', value: '45+' }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + (i * 0.1) }}
                                    className="text-center group"
                                >
                                    <div className="text-3xl md:text-5xl font-black text-white mb-2 group-hover:text-primary transition-colors duration-500">{stat.value}</div>
                                    <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/30 font-black group-hover:text-white/60 transition-colors duration-500">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            {/* Slide Progress Indicators */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-4 items-center">
                {heroSlides.map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => setActiveSlide(index)} 
                        className={`group relative h-1.5 transition-all duration-700 rounded-full overflow-hidden ${activeSlide === index ? 'w-16 bg-primary' : 'w-8 bg-white/10 hover:bg-white/30'}`} 
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        {activeSlide === index && (
                            <motion.div 
                                initial={{ x: '-100%' }}
                                animate={{ x: '0%' }}
                                transition={{ duration: 6, ease: "linear" }}
                                className="absolute inset-0 bg-white/40"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Featured Strip at the bottom of Hero */}
            <div className="absolute bottom-0 left-0 w-full z-30">
                <FeaturedBusinesses onBusinessClick={onBusinessClick} onSeeAll={onExplore} />
            </div>
        </section>
    );
};
