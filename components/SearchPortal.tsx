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
            <div className="max-w-4xl mx-auto w-full" onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative backdrop-blur-2xl bg-white/5 border-2 border-white/10 rounded-full ps-5 pe-2 py-2 md:px-8 md:py-5 flex items-center gap-3 md:gap-6 transition-all duration-500 hover:bg-white/10 hover:border-white/20 focus-within:border-primary/50 focus-within:bg-white/10 focus-within:shadow-[0_0_50px_rgba(108,43,217,0.3)]">
                        <Search className="w-6 h-6 md:w-7 md:h-7 text-secondary drop-shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
                        <input
                            type="text"
                            placeholder={t('hero.searchPlaceholder') || 'Search for restaurants, events, or places...'}
                            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-base md:text-xl font-light tracking-wide"
                            onFocus={() => setShowSuggestions(true)}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="flex items-center gap-2">
                            <button 
                                className="relative w-10 h-10 md:w-14 md:h-14 flex-shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all duration-300 disabled:opacity-50" 
                                onClick={handleMicClick}
                                disabled={!recognitionRef.current}
                                title="Voice Search"
                            >
                                <Mic className={`w-5 h-5 md:w-6 md:h-6 ${isListening ? 'text-accent' : 'text-white/70'}`} />
                                {isListening && <WaveformAnimation />}
                            </button>
                            <button 
                                className="hidden md:flex w-14 h-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-glow-secondary hover:scale-105 active:scale-95 transition-all duration-300"
                                onClick={() => handleSearchSubmit(inputValue)}
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    {showSuggestions && inputValue && <SearchSuggestions />}
                </div>
                
                <div className="flex flex-wrap gap-3 mt-8 justify-center items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/30 mr-2">{t('hero.trending') || 'Trending'}:</span>
                    {[
                        t('hero.filters.eventsToday'), 
                        t('hero.filters.restaurants'), 
                        t('hero.filters.entertainment'), 
                        t('hero.filters.deals')
                    ].map(filter => (
                        <button 
                            key={filter} 
                            onClick={() => handleSearchSubmit(filter)}
                            className="px-5 py-2 rounded-full backdrop-blur-md bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 hover:text-white transition-all duration-300 text-white/60 text-xs md:text-sm font-medium hover:shadow-glow-primary/20"
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
