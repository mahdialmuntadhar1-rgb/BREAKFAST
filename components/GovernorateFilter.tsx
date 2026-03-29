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
        <div className="w-full">
             <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                    <Globe className="w-5 h-5 text-primary group-focus-within:text-white transition-colors duration-500" />
                </div>
                <select
                    id="governorate-select"
                    value={selectedGovernorate}
                    onChange={(e) => onGovernorateChange(e.target.value)}
                    className="w-full pl-14 pr-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none appearance-none focus:border-primary/50 focus:bg-white/10 transition-all duration-500 cursor-pointer shadow-xl backdrop-blur-xl"
                >
                    {governorates.map(gov => (
                        <option key={gov.id} value={gov.id} className="bg-black text-white py-4">
                            {t(gov.nameKey)}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-white/20 rotate-45 group-focus-within:border-primary transition-colors duration-500" />
                </div>
             </div>
             
             <div className="mt-4 flex flex-wrap gap-2">
                {governorates.slice(0, 5).map(gov => (
                    <button
                        key={gov.id}
                        onClick={() => onGovernorateChange(gov.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${
                            selectedGovernorate === gov.id 
                            ? 'bg-primary border-primary text-white shadow-glow-primary/20' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white'
                        }`}
                    >
                        {t(gov.nameKey)}
                    </button>
                ))}
             </div>
        </div>
    );
};