import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { ChevronDown } from './icons';

const languages = {
    en: { nativeName: 'English', flag: '🇬🇧' },
    ar: { nativeName: 'العربية', flag: '🇮🇶' },
    ku: { nativeName: 'کوردی', flag: '☀️' },
}

export const LanguageSelector: React.FC = () => {
    const { lang, setLang } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLanguageChange = (newLang: 'en' | 'ar' | 'ku') => {
        setLang(newLang);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-glass-surface hover:bg-glass-hover border border-glass-border transition-colors"
            >
                <span className="text-xl">{languages[lang].flag}</span>
                <span className="hidden md:block text-sm font-medium">{languages[lang].nativeName}</span>
                <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                 <div className="absolute end-0 mt-2 w-40 backdrop-blur-2xl bg-dark-bg/90 border border-white/20 rounded-xl shadow-soft p-2">
                    {Object.entries(languages).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => handleLanguageChange(key as 'en' | 'ar' | 'ku')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-start rtl:text-right ${lang === key ? 'bg-primary/50' : ''}`}
                        >
                           <span className="text-xl">{value.flag}</span>
                           <span>{value.nativeName}</span>
                        </button>
                    ))}
                 </div>
            )}
        </div>
    );
};