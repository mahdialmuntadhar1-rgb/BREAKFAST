import React, { useState, useMemo } from 'react';
import { inclusiveFeaturesList, events, format } from '../constants';
import type { Event } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { Check, X, MapPin, Clock } from './icons';
import { GlassCard } from './GlassCard';

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
        <section className="py-16">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">
            {t('inclusive.title')}
            </h2>
            <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
            {t('inclusive.subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {inclusiveFeaturesList.map((feature) => (
                    <GlassCard
                        key={feature.key}
                        className="p-6 hover:shadow-glow-primary text-center group"
                    >
                        <div className={`
                            w-16 h-16 mx-auto mb-4 rounded-2xl
                            bg-gradient-to-br from-${feature.color}/70 to-${feature.color}/40
                            flex items-center justify-center
                            group-hover:scale-110 transition-transform
                        `}>
                            <div className="text-white">
                            {feature.icon}
                            </div>
                        </div>
                        <h3 className="text-white font-semibold mb-2">
                            {t(`inclusive.features.${feature.key}.title`)}
                        </h3>
                        <p className="text-white/60 text-sm">
                            {t(`inclusive.features.${feature.key}.description`)}
                        </p>
                    </GlassCard>
                ))}
            </div>

            <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center md:text-start rtl:md:text-right">
                    {t('inclusive.findEvents')}
                </h3>
                <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
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
                        className={`px-6 py-3 rounded-full backdrop-blur-xl border transition-all duration-200 ${activeFilters.includes(filter) ? 'bg-primary border-primary text-white shadow-glow-primary' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
                    >
                        {t(`inclusive.filters.${filter}`)}
                    </button>
                    ))}
                </div>
                 {activeFilters.length > 0 && (
                    <div className="border-t border-white/10 pt-6">
                        <p className="text-white/80 mb-4">{filteredEvents.length} {t('inclusive.eventsFound')}</p>
                        {filteredEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredEvents.map(event => (
                                    <GlassCard key={event.id} className="p-4 text-start flex gap-3 items-center">
                                        <img src={event.image} alt={event.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-white mb-1 line-clamp-2">{event.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-white/60"><MapPin className="w-3 h-3"/> {event.venue}</div>
                                            <div className="flex items-center gap-2 text-xs text-white/60"><Clock className="w-3 h-3"/> {format(event.date, 'MMM')} {format(event.date, 'd')}</div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-white/60 py-8">{t('inclusive.noEventsFound')}</p>
                        )}
                    </div>
                )}
            </GlassCard>
            <ColorContrastChecker />
            <VisualAccessibilitySettings highContrast={highContrast} setHighContrast={setHighContrast} />
        </div>
        </section>
    );
};