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
        <section className="py-12 bg-dark-bg/50 border-b border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-primary/20">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-widest text-white">
                            {t('governorates.exploreBy') || 'Explore by Governorate'}
                        </h2>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
                            {t('governorates.selectRegion') || 'Select a region to discover local gems'}
                        </p>
                    </div>
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4">
                    {governorates.map((gov, i) => (
                        <motion.button
                            key={gov.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => onGovernorateChange(gov.id)}
                            className={`flex-shrink-0 group relative w-40 h-48 rounded-2xl overflow-hidden transition-all duration-500 ${
                                selectedGovernorate === gov.id 
                                ? 'ring-2 ring-primary ring-offset-4 ring-offset-dark-bg scale-105' 
                                : 'hover:scale-105'
                            }`}
                        >
                            <img 
                                src={`https://picsum.photos/seed/gov-${gov.id}/400/600`} 
                                alt={t(gov.nameKey)}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${
                                selectedGovernorate === gov.id 
                                ? 'from-primary/90 via-primary/40 to-transparent opacity-100' 
                                : 'from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100'
                            }`} />
                            
                            <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                <span className={`text-xs font-black uppercase tracking-widest mb-1 transition-colors ${
                                    selectedGovernorate === gov.id ? 'text-white' : 'text-white/60 group-hover:text-white'
                                }`}>
                                    {t('governorates.iraq') || 'Iraq'}
                                </span>
                                <h3 className="text-lg font-black text-white uppercase italic leading-tight">
                                    {t(gov.nameKey)}
                                </h3>
                            </div>

                            {selectedGovernorate === gov.id && (
                                <div className="absolute top-3 right-3">
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    </motion.div>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </section>
    );
};
