import React, { useState, useMemo } from 'react';
import { inclusiveFeaturesList, events, format } from '../constants';
import type { Event } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { Check, X, MapPin, Clock, ShieldCheck } from './icons';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'motion/react';

// Parses a HEX color string (#RRGGBB) and returns an array of RGB values.
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

// Calculates the relative luminance of a color.
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculates the contrast ratio between two colors.
function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

const ColorContrastChecker: React.FC = () => {
    const { t } = useTranslations();
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [bgColor, setBgColor] = useState('#6C2BD9');

    const contrastRatio = getContrastRatio(textColor, bgColor);
    
    const compliance = {
        normal_AA: contrastRatio >= 4.5,
        large_AA: contrastRatio >= 3,
        normal_AAA: contrastRatio >= 7,
        large_AAA: contrastRatio >= 4.5,
    };

    const ComplianceRow: React.FC<{ label: string; aa: boolean; aaa: boolean; }> = ({label, aa, aaa}) => (
        <div className="grid grid-cols-3 items-center text-center">
            <div className="text-sm text-white/80 text-start rtl:text-right">{label}</div>
            <div className={`flex items-center justify-center gap-2 font-semibold ${aa ? 'text-green-400' : 'text-red-400'}`}>
                {aa ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {t(aa ? 'inclusive.contrastChecker.pass' : 'inclusive.contrastChecker.fail')}
            </div>
            <div className={`flex items-center justify-center gap-2 font-semibold ${aaa ? 'text-green-400' : 'text-red-400'}`}>
                {aaa ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {t(aaa ? 'inclusive.contrastChecker.pass' : 'inclusive.contrastChecker.fail')}
            </div>
        </div>
    );

    return (
        <GlassCard className="mt-12 p-6 md:p-8">
            <style>{`
                input[type="color"] {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 2rem;
                    height: 2rem;
                    padding: 0;
                    border: none;
                    border-radius: 0.5rem;
                    background-color: transparent;
                    cursor: pointer;
                }
                input[type="color"]::-webkit-color-swatch-wrapper {
                    padding: 0;
                }
                input[type="color"]::-webkit-color-swatch {
                    border: none;
                    border-radius: 0.5rem;
                }
                input[type="color"]::-moz-color-swatch {
                    border: none;
                    border-radius: 0.5rem;
                }
            `}</style>
            <h3 className="text-2xl font-bold text-white mb-6 text-center md:text-start rtl:md:text-right">
                {t('inclusive.contrastChecker.title')}
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label htmlFor="text-color" className="text-white/80">{t('inclusive.contrastChecker.textColor')}</label>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 border border-white/20">
                           <input id="text-color" type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />
                           <span className="font-mono text-white">{textColor.toUpperCase()}</span>
                        </div>
                    </div>
                     <div className="flex items-center justify-between">
                        <label htmlFor="bg-color" className="text-white/80">{t('inclusive.contrastChecker.bgColor')}</label>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 border border-white/20">
                           <input id="bg-color" type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                           <span className="font-mono text-white">{bgColor.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-white/60 text-sm mb-2">{t('inclusive.contrastChecker.contrastRatio')}</p>
                        <p className="text-4xl font-bold text-white">{contrastRatio.toFixed(2)}:1</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4 text-center">{t('inclusive.contrastChecker.compliance')}</h4>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 items-center text-center text-xs text-white/60">
                                <div className="text-start rtl:text-right"></div>
                                <div>AA</div>
                                <div>AAA</div>
                            </div>
                           <ComplianceRow label={t('inclusive.contrastChecker.normalText')} aa={compliance.normal_AA} aaa={compliance.normal_AAA} />
                           <ComplianceRow label={t('inclusive.contrastChecker.largeText')} aa={compliance.large_AA} aaa={compliance.large_AAA} />
                        </div>
                    </div>
                </div>
                {/* Preview */}
                <div style={{ backgroundColor: bgColor, color: textColor }} className="rounded-2xl p-6 border border-white/10 flex flex-col justify-center">
                    <h4 className="font-bold text-lg mb-4">{t('inclusive.contrastChecker.preview')}</h4>
                    <p className="mb-2 text-2xl font-bold">{t('inclusive.contrastChecker.previewText')}</p>
                    <p className="mb-2">{t('inclusive.contrastChecker.previewText')}</p>
                    <p className="text-sm">{t('inclusive.contrastChecker.previewText')}</p>
                </div>
            </div>
        </GlassCard>
    );
}

interface InclusiveFeaturesProps {
    highContrast: boolean;
    setHighContrast: (value: boolean) => void;
}

const VisualAccessibilitySettings: React.FC<InclusiveFeaturesProps> = ({ highContrast, setHighContrast }) => {
    const { t } = useTranslations();
    return (
        <GlassCard className="mt-12 p-6 md:p-8 text-start rtl:text-right">
            <h3 className="text-2xl font-bold text-white mb-6">
                {t('inclusive.visualAccessibility.title')}
            </h3>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                <div>
                    <h4 className="font-semibold text-white">{t('inclusive.visualAccessibility.highContrast')}</h4>
                    <p className="text-sm text-white/60">{t('inclusive.visualAccessibility.highContrastDesc')}</p>
                </div>
                <button
                    onClick={() => setHighContrast(!highContrast)}
                    role="switch"
                    aria-checked={highContrast}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-bg ${highContrast ? 'bg-primary' : 'bg-white/20'}`}
                >
                    <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${highContrast ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                </button>
            </div>
        </GlassCard>
    );
};

export const InclusiveFeatures: React.FC<InclusiveFeaturesProps> = ({ highContrast, setHighContrast }) => {
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const { t } = useTranslations();

    const toggleFilter = (filter: string) => {
        setActiveFilters(prev => 
            prev.includes(filter) 
            ? prev.filter(f => f !== filter)
            : [...prev, filter]
        );
    }
    
    const filteredEvents = useMemo(() => {
        if (activeFilters.length === 0) {
            return [];
        }
        return events.filter(event => {
            return activeFilters.every(filter => {
                return event.accessibility?.[filter as keyof Event['accessibility']];
            });
        });
    }, [activeFilters]);

    return (
    <section className="py-32 bg-black relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-full max-w-4xl h-96 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full max-w-4xl h-96 bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ShieldCheck className="w-3 h-3" />
                    {t('inclusive.badge') || 'Inclusive by Design'}
                </motion.div>
                <h2 className="text-5xl font-black text-white tracking-tighter">
                    {t('inclusive.title') || 'Accessibility First'}
                </h2>
                <p className="text-white/40 max-w-2xl mx-auto font-medium">
                    {t('inclusive.subtitle') || 'We believe discovery should be universal. Our platform is architected to be accessible, inclusive, and empowering for everyone.'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {inclusiveFeaturesList.map((feature, index) => (
                    <motion.div
                        key={feature.key}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-500 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full group-hover:bg-primary/10 transition-all duration-500" />
                        
                        <div className={`
                            w-16 h-16 mb-8 rounded-2xl
                            bg-gradient-to-br from-primary to-secondary
                            flex items-center justify-center shadow-lg shadow-primary/20
                            group-hover:scale-110 group-hover:rotate-3 transition-all duration-500
                        `}>
                            <div className="text-white">
                                {feature.icon}
                            </div>
                        </div>
                        <h3 className="text-white font-black text-lg mb-3 tracking-tight">
                            {t(`inclusive.features.${feature.key}.title`)}
                        </h3>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">
                            {t(`inclusive.features.${feature.key}.description`)}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-10"
                >
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tight">
                            {t('inclusive.findEvents') || 'Filter by Accessibility'}
                        </h3>
                        <p className="text-white/30 text-sm font-medium">Discover experiences tailored to your specific needs.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {[
                        'wheelchairAccessible',
                        'familyFriendly',
                        'womenOnly',
                        'sensoryFriendly',
                        'signLanguage',
                        'audioDescription'
                        ].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => toggleFilter(filter)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${
                                activeFilters.includes(filter) 
                                ? 'bg-primary border-primary text-white shadow-glow-primary/20' 
                                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            {t(`inclusive.filters.${filter}`)}
                        </button>
                        ))}
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{filteredEvents.length} {t('inclusive.eventsFound')}</p>
                                <button onClick={() => setActiveFilters([])} className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Clear All</button>
                            </div>
                            {filteredEvents.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredEvents.map(event => (
                                        <motion.div 
                                            key={event.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-500 flex gap-4 items-center group"
                                        >
                                            <img src={event.image} alt={event.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-500" />
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white mb-2 line-clamp-1">{event.title}</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                        <MapPin className="w-3 h-3 text-primary"/> {event.venue}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                        <Clock className="w-3 h-3 text-secondary"/> {format(event.date, 'MMM')} {format(event.date, 'd')}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-4 opacity-20">
                                    <X className="w-12 h-12 mx-auto text-white" />
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest">{t('inclusive.noEventsFound')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                <div className="space-y-8">
                    <ColorContrastChecker />
                    <VisualAccessibilitySettings highContrast={highContrast} setHighContrast={setHighContrast} />
                </div>
            </div>
        </div>
    </section>
    );
};