import React from 'react';
import { Search, Mic } from './icons';
import { useTranslations } from '../hooks/useTranslations';

const WaveformAnimation = () => <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>;

const SearchSuggestions = () => {
    const { t } = useTranslations();
    return (
        <div className="absolute top-full mt-4 w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 text-white text-start">
            <p className="text-sm text-white/60 mb-2">{t('hero.suggestionsTitle')}</p>
            <ul>
                <li className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">{t('categories.food_drink')}</li>
                <li className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">{t('categories.events_entertainment')}</li>
                <li className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">{t('categories.shopping')}</li>
            </ul>
        </div>
    );
}

interface SearchPortalProps {
    onSearch?: (query: string) => void;
}

export const SearchPortal: React.FC<SearchPortalProps> = ({ onSearch }) => {
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [isListening, setIsListening] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const { t, lang } = useTranslations();
    const recognitionRef = React.useRef<any>(null);

    const handleSearchSubmit = (query: string) => {
        if (query.trim()) {
            onSearch?.(query);
            setShowSuggestions(false);
        }
    };

    React.useEffect(() => {
        // FIX: Property 'SpeechRecognition' and 'webkitSpeechRecognition' do not exist on type 'Window'.
        // Cast window to `any` to access browser-specific speech recognition APIs without TypeScript errors.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        const langMap = {
            en: 'en-US',
            ar: 'ar-IQ',
            ku: 'ckb-IQ', // Sorani Kurdish (Iraq)
        };
        recognition.lang = langMap[lang];

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
            handleSearchSubmit(transcript);
        };
        
        recognitionRef.current = recognition;
    }, [lang]);

    const handleMicClick = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInputValue(''); // Clear input before listening
            recognitionRef.current.start();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(inputValue);
        }
    };

    return (
         <div className="container mx-auto px-4 py-6">
            <div className="max-w-3xl mx-auto w-full" onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
                <div className="relative group">
                    <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-full ps-4 pe-2 py-2 md:px-6 md:py-4 flex items-center gap-2 md:gap-4 transition-all duration-300 hover:bg-white/15 hover:border-primary/50 focus-within:border-primary focus-within:shadow-[0_0_30px_rgba(108,43,217,0.5)]">
                        <Search className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                        <input
                            type="text"
                            placeholder={t('hero.searchPlaceholder')}
                            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50 text-sm md:text-base"
                            onFocus={() => setShowSuggestions(true)}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button 
                            className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center hover:scale-110 transition-transform group-hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed" 
                            onClick={handleMicClick}
                            disabled={!recognitionRef.current}
                        >
                            <Mic className="w-5 h-5 text-white" />
                            {isListening && <WaveformAnimation />}
                        </button>
                    </div>
                    {showSuggestions && inputValue && <SearchSuggestions />}
                </div>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {[
                        t('hero.filters.eventsToday'), 
                        t('hero.filters.restaurants'), 
                        t('hero.filters.entertainment'), 
                        t('hero.filters.deals')
                    ].map(filter => (
                        <button 
                            key={filter} 
                            onClick={() => handleSearchSubmit(filter)}
                            className="px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-200 text-white/80 hover:text-white text-xs md:text-sm"
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
