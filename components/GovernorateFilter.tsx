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
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-md mx-auto">
                 <label htmlFor="governorate-select" className="sr-only">{t('filter.governorate')}</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <Globe className="w-5 h-5 text-white/50" />
                    </div>
                    <select
                        id="governorate-select"
                        value={selectedGovernorate}
                        onChange={(e) => onGovernorateChange(e.target.value)}
                        className="w-full ps-10 p-3 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none appearance-none focus:border-primary transition-colors"
                    >
                        {governorates.map(gov => (
                            <option key={gov.id} value={gov.id} className="bg-dark-bg">
                                {t(gov.nameKey)}
                            </option>
                        ))}
                    </select>
                 </div>
            </div>
        </div>
    );
};