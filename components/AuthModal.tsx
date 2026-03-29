import React, { useState } from 'react';
import { 
    X, 
    User, 
    Briefcase, 
    Mail, 
    Lock, 
    Phone, 
    Building, 
    Map, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle2, 
    Loader2,
    Languages,
    Globe,
    AlertCircle,
    MapPin,
    Sparkles
} from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
    onClose: () => void;
    onLogin: (role: 'user' | 'owner') => void;
}

type Step = 'role' | 'credentials' | 'business' | 'language' | 'success';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
    const [step, setStep] = useState<Step>('role');
    const [role, setRole] = useState<'user' | 'owner'>('user');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t, setLang, lang } = useTranslations();

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        category: '',
        phone: '',
        address: '',
        governorate: '',
        city: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const validateCredentials = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError(t('auth.error.allFields') || 'All fields are required');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.error.passwordMismatch') || 'Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError(t('auth.error.passwordShort') || 'Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const validateBusiness = () => {
        if (!formData.businessName || !formData.category || !formData.phone || !formData.governorate) {
            setError(t('auth.error.businessFields') || 'Please fill in all business details');
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (step === 'role') setStep('credentials');
        else if (step === 'credentials') {
            if (validateCredentials()) {
                if (role === 'owner') setStep('business');
                else setStep('language');
            }
        } else if (step === 'business') {
            if (validateBusiness()) setStep('language');
        } else if (step === 'language') {
            handleFinalSubmit();
        }
    };

    const prevStep = () => {
        if (step === 'credentials') setStep('role');
        else if (step === 'business') setStep('credentials');
        else if (step === 'language') {
            if (role === 'owner') setStep('business');
            else setStep('credentials');
        }
    };

    const handleFinalSubmit = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setStep('success');
        setTimeout(() => {
            onLogin(role);
            onClose();
        }, 2000);
    };

    const steps: Step[] = role === 'owner' 
        ? ['role', 'credentials', 'business', 'language'] 
        : ['role', 'credentials', 'language'];
    
    const currentStepIndex = steps.indexOf(step);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const titleId = `auth-modal-title-${step}`;
    const descriptionId = `auth-modal-description-${step}`;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-xl bg-dark-bg border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-primary to-secondary shadow-glow-primary"
                    />
                </div>

                <button 
                    onClick={onClose} 
                    aria-label={t('common.close') || 'Close dialog'}
                    className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all z-10"
                >
                    <X className="w-5 h-5 text-white/50" />
                </button>

                <div className="p-8 sm:p-12">
                    <AnimatePresence mode="wait">
                        {step === 'role' && (
                            <motion.div 
                                key="role"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <h2 id={titleId} className="text-3xl font-black text-white tracking-tighter">{t('auth.chooseRole') || 'Join Iraq Compass'}</h2>
                                    <p id={descriptionId} className="text-white/40 font-medium">{t('auth.roleSubtitle') || 'Tell us how you want to use the platform'}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setRole('user')}
                                        className={`group p-6 rounded-3xl border-2 transition-all text-start space-y-4 ${role === 'user' ? 'bg-primary/10 border-primary shadow-glow-primary/20' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${role === 'user' ? 'bg-primary text-white' : 'bg-white/10 text-white/40 group-hover:text-white'}`}>
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{t('auth.roleUser') || 'Explorer'}</h3>
                                            <p className="text-white/40 text-xs leading-relaxed">{t('auth.roleUserDesc') || 'Discover hidden gems, events, and local deals across Iraq.'}</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setRole('owner')}
                                        className={`group p-6 rounded-3xl border-2 transition-all text-start space-y-4 ${role === 'owner' ? 'bg-secondary/10 border-secondary shadow-glow-secondary/20' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${role === 'owner' ? 'bg-secondary text-white' : 'bg-white/10 text-white/40 group-hover:text-white'}`}>
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{t('auth.roleOwner') || 'Business Owner'}</h3>
                                            <p className="text-white/40 text-xs leading-relaxed">{t('auth.roleOwnerDesc') || 'List your business, reach thousands, and grow your presence.'}</p>
                                        </div>
                                    </button>
                                </div>

                                <button 
                                    onClick={nextStep}
                                    className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-xl"
                                >
                                    {t('common.continue') || 'Continue'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {step === 'credentials' && (
                            <motion.div 
                                key="credentials"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-black text-white tracking-tighter">{t('auth.createAccount') || 'Your Credentials'}</h2>
                                    <p className="text-white/40 font-medium">{t('auth.credentialsSubtitle') || 'Secure your access to the platform'}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('auth.email')}</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="email@example.com" 
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('auth.password')}</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                                <input 
                                                    type="password" 
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="••••••••" 
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('auth.confirmPassword') || 'Confirm'}</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                                <input 
                                                    type="password" 
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="••••••••" 
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </motion.div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={prevStep}
                                        className="flex-1 py-5 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        {t('common.back') || 'Back'}
                                    </button>
                                    <button 
                                        onClick={nextStep}
                                        className="flex-[2] py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-xl"
                                    >
                                        {t('common.next') || 'Next Step'}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'business' && (
                            <motion.div 
                                key="business"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-black text-white tracking-tighter">{t('auth.businessInfo') || 'Business Profile'}</h2>
                                    <p className="text-white/40 font-medium">{t('auth.businessSubtitle') || 'Tell the world about your business'}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('auth.businessName') || 'Business Name'}</label>
                                            <div className="relative group">
                                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-secondary transition-colors" />
                                                <input 
                                                    type="text" 
                                                    name="businessName"
                                                    value={formData.businessName}
                                                    onChange={handleInputChange}
                                                    placeholder="My Awesome Shop" 
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('auth.category') || 'Category'}</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-secondary transition-colors" />
                                                <select 
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all appearance-none"
                                                >
                                                    <option value="" className="bg-dark-bg">Select Category</option>
                                                    <option value="restaurant" className="bg-dark-bg">Restaurant</option>
                                                    <option value="cafe" className="bg-dark-bg">Café</option>
                                                    <option value="hotel" className="bg-dark-bg">Hotel</option>
                                                    <option value="shopping" className="bg-dark-bg">Shopping</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('auth.phone') || 'Phone Number'}</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-secondary transition-colors" />
                                            <input 
                                                type="tel" 
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+964 7XX XXX XXXX" 
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('auth.governorate') || 'Governorate'}</label>
                                            <div className="relative group">
                                                <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-secondary transition-colors" />
                                                <input 
                                                    type="text" 
                                                    name="governorate"
                                                    value={formData.governorate}
                                                    onChange={handleInputChange}
                                                    placeholder="Baghdad" 
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">{t('auth.city') || 'City'}</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-secondary transition-colors" />
                                                <input 
                                                    type="text" 
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="Karrada" 
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </motion.div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={prevStep}
                                        className="flex-1 py-5 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        {t('common.back') || 'Back'}
                                    </button>
                                    <button 
                                        onClick={nextStep}
                                        className="flex-[2] py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-all shadow-xl"
                                    >
                                        {t('common.next') || 'Final Step'}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'language' && (
                            <motion.div 
                                key="language"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-black text-white tracking-tighter">{t('auth.languagePref') || 'Preferred Language'}</h2>
                                    <p className="text-white/40 font-medium">{t('auth.languageSubtitle') || 'Choose how you want to experience Iraq Compass'}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
                                        { id: 'ar', name: 'Arabic', native: 'العربية', flag: '🇮🇶' },
                                        { id: 'ku', name: 'Kurdish', native: 'کوردی', flag: '☀️' }
                                    ].map((l) => (
                                        <button
                                            key={l.id}
                                            onClick={() => setLang(l.id as any)}
                                            className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${lang === l.id ? 'bg-primary/10 border-primary shadow-glow-primary/20' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">{l.flag}</span>
                                                <div className="text-start">
                                                    <p className="text-white font-bold">{l.native}</p>
                                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{l.name}</p>
                                                </div>
                                            </div>
                                            {lang === l.id && <CheckCircle2 className="w-6 h-6 text-primary" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={prevStep}
                                        className="flex-1 py-5 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        {t('common.back') || 'Back'}
                                    </button>
                                    <button 
                                        onClick={handleFinalSubmit}
                                        disabled={isLoading}
                                        className="flex-[2] py-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:shadow-glow-primary transition-all shadow-xl disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {t('auth.completeSignup') || 'Complete Signup'}
                                                <Sparkles className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8 py-12"
                            >
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
                                    <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
                                        <CheckCircle2 className="w-12 h-12 text-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black text-white tracking-tighter">{t('auth.welcome') || 'Welcome Aboard!'}</h2>
                                    <p className="text-white/40 font-medium">{t('auth.successSubtitle') || 'Your account has been created successfully.'}</p>
                                </div>

                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                    <p className="text-white/60 text-sm italic">"The journey of a thousand miles begins with a single step."</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
