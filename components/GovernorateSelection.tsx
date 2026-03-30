import React from 'react';
import { motion } from 'motion/react';
import { useTranslations } from '../hooks/useTranslations';
import { governorates } from '../constants';
import { MapPin } from './icons';

interface GovernorateSelectionProps {
    selectedGovernorate: string;
    onGovernorateChange: (gov: string) => void;
}

export const GovernorateSelection: React.FC<GovernorateSelectionProps> = ({ 
    selectedGovernorate, 
    onGovernorateChange 
}) => {
    const { t } = useTranslations();

    return (
        <section className="py-8 bg-dark-bg border-b border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">
                            {t('governorates.chooseCity') || 'Choose your city'}
                        </h2>
                    </div>
                    {selectedGovernorate !== 'all' && (
                        <button 
                            onClick={() => onGovernorateChange('all')}
                            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
                        >
                            {t('governorates.clear') || 'Clear Filter'}
                        </button>
                    )}
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-4 px-4 scroll-smooth">
                    {/* "All Iraq" Chip */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => onGovernorateChange('all')}
                        className={`flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 border ${
                            selectedGovernorate === 'all' 
                            ? 'bg-primary border-primary text-white shadow-glow-primary/20' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${selectedGovernorate === 'all' ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
                        <span className="text-xs font-black uppercase tracking-widest">
                            {t('governorates.allIraq') || 'All Iraq'}
                        </span>
                    </motion.button>

                    {governorates.map((gov, i) => (
                        <motion.button
                            key={gov.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => onGovernorateChange(gov.id)}
                            className={`flex-shrink-0 group relative flex items-center gap-3 pl-2 pr-6 py-2 rounded-2xl transition-all duration-300 border ${
                                selectedGovernorate === gov.id 
                                ? 'bg-primary/20 border-primary shadow-glow-primary/10' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                                <img 
                                    src={`https://picsum.photos/seed/gov-${gov.id}/100/100`} 
                                    alt={t(gov.nameKey)}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <span className={`text-xs font-black uppercase tracking-widest transition-colors ${
                                selectedGovernorate === gov.id ? 'text-white' : 'text-white/60 group-hover:text-white'
                            }`}>
                                {t(gov.nameKey)}
                            </span>
                            
                            {selectedGovernorate === gov.id && (
                                <motion.div 
                                    layoutId="active-gov"
                                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-dark-bg shadow-lg"
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </section>
    );
};
