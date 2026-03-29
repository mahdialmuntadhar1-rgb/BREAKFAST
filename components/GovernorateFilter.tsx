import React from 'react';
import { governorates } from '../constants';
import { useTranslations } from '../hooks/useTranslations';
import { Globe } from './icons';

interface GovernorateFilterProps {
    selectedGovernorate: string;
    onGovernorateChange: (governorateId: string) => void;
}

export const GovernorateFilter: React.FC<GovernorateFilterProps> = ({ selectedGovernorate, onGovernorateChange }) => {
    const { t } = useTranslations();
    
    return (
        <div className="w-full space-y-6">
             <div className="relative group/select">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-0 group-focus-within/select:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
                    <Globe className="w-5 h-5 text-primary group-focus-within/select:text-white transition-colors duration-500" />
                </div>
                <select
                    id="governorate-select"
                    value={selectedGovernorate}
                    onChange={(e) => onGovernorateChange(e.target.value)}
                    className="relative w-full pl-16 pr-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest outline-none appearance-none focus:border-primary/50 focus:bg-white/[0.08] transition-all duration-500 cursor-pointer shadow-2xl backdrop-blur-2xl"
                >
                    {governorates.map(gov => (
                        <option key={gov.id} value={gov.id} className="bg-[#0A0A0B] text-white py-4 font-bold">
                            {t(gov.nameKey)}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-white/20 rotate-45 group-focus-within/select:border-primary transition-colors duration-500" />
                </div>
             </div>
             
             <div className="flex flex-wrap gap-3">
                {governorates.slice(0, 6).map(gov => (
                    <button
                        key={gov.id}
                        onClick={() => onGovernorateChange(gov.id)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${
                            selectedGovernorate === gov.id 
                            ? 'bg-white border-white text-black shadow-glow-white/20 scale-105' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white hover:scale-105'
                        }`}
                    >
                        {t(gov.nameKey)}
                    </button>
                ))}
             </div>
        </div>
    );
};