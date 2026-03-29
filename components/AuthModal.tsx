import React, { useMemo, useState } from 'react';
import { X, User, Briefcase, Mail, Lock, Phone, MapPin, Globe } from './icons';
import { useTranslations } from '../hooks/useTranslations';

interface AuthModalProps {
    onClose: () => void;
    onLogin: (role: 'user' | 'owner') => void;
}

type Role = 'user' | 'owner';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
    const { t } = useTranslations();
    const [role, setRole] = useState<Role>('user');
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        category: '',
        phone: '',
        address: '',
        governorate: '',
        city: '',
        language: 'en'
    });

    const totalSteps = role === 'owner' ? 4 : 3;

    const stepTitle = useMemo(() => {
        if (step === 1) return 'Choose your account type';
        if (step === 2) return 'Create your login details';
        if (step === 3 && role === 'owner') return 'Tell us about your business';
        return 'Pick your app language';
    }, [role, step]);

    const updateField = (key: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: '' }));
        setSuccessMessage('');
    };

    const validateStep = () => {
        const nextErrors: Record<string, string> = {};

        if (step === 2) {
            if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Please enter a valid email address.';
            if (!form.password || form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
            if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';
        }

        if (step === 3 && role === 'owner') {
            if (!form.businessName.trim()) nextErrors.businessName = 'Business name is required.';
            if (!form.category.trim()) nextErrors.category = 'Category is required.';
            if (!form.phone.trim()) nextErrors.phone = 'Phone is required.';
            if (!form.address.trim()) nextErrors.address = 'Address is required.';
            if (!form.governorate.trim()) nextErrors.governorate = 'Governorate is required.';
            if (!form.city.trim()) nextErrors.city = 'City is required.';
        }

        if (step === totalSteps && !form.language) {
            nextErrors.language = 'Select a language to continue.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep()) return;
        if (step < totalSteps) {
            setStep(prev => prev + 1);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setSuccessMessage('Signup successful! Welcome to Iraq Compass.');
            setTimeout(() => onLogin(role), 800);
        }, 1200);
    };

    const showBusinessStep = step === 3 && role === 'owner';
    const showLanguageStep = (step === 3 && role === 'user') || (step === 4 && role === 'owner');

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl backdrop-blur-2xl bg-dark-bg/95 border border-white/20 rounded-3xl p-8 md:p-10 shadow-glow-primary text-start rtl:text-right">
                <button onClick={onClose} className="absolute top-4 end-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <X className="w-5 h-5 text-white" />
                </button>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-white/70 font-medium">Step {step} / {totalSteps}</span>
                        <span className="text-xs text-white/50">Guided signup</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">{t('auth.signUp') || 'Sign up'}</h2>
                <p className="text-white/60 text-base mb-8">{stepTitle}</p>

                <div className="space-y-8">
                    {step === 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('user')}
                                className={`p-6 rounded-2xl border transition-all text-start hover:-translate-y-0.5 hover:shadow-xl cursor-pointer ${role === 'user' ? 'bg-primary/20 border-primary shadow-glow-primary/20' : 'bg-white/5 border-white/15 hover:border-white/30'}`}
                            >
                                <User className="w-6 h-6 text-white mb-3" />
                                <div className="text-white font-semibold text-lg">User</div>
                                <div className="text-white/60 text-sm mt-1">Explore businesses, deals, and events.</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('owner')}
                                className={`p-6 rounded-2xl border transition-all text-start hover:-translate-y-0.5 hover:shadow-xl cursor-pointer ${role === 'owner' ? 'bg-secondary/20 border-secondary shadow-glow-primary/20' : 'bg-white/5 border-white/15 hover:border-white/30'}`}
                            >
                                <Briefcase className="w-6 h-6 text-white mb-3" />
                                <div className="text-white font-semibold text-lg">Business Owner</div>
                                <div className="text-white/60 text-sm mt-1">Grow your business and reach local customers.</div>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-white/85 text-sm mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 text-white/50 absolute start-4 top-1/2 -translate-y-1/2" />
                                    <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/5 border border-white/20 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                                </div>
                                {errors.email && <p className="mt-1 text-red-300 text-xs">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-white/85 text-sm mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="w-5 h-5 text-white/50 absolute start-4 top-1/2 -translate-y-1/2" />
                                    <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/5 border border-white/20 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                                </div>
                                {errors.password && <p className="mt-1 text-red-300 text-xs">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-white/85 text-sm mb-2">Confirm password</label>
                                <div className="relative">
                                    <Lock className="w-5 h-5 text-white/50 absolute start-4 top-1/2 -translate-y-1/2" />
                                    <input type="password" value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/5 border border-white/20 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-red-300 text-xs">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    )}

                    {showBusinessStep && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/85 text-sm mb-2">Business name</label>
                                    <input value={form.businessName} onChange={(e) => updateField('businessName', e.target.value)} className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/20 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                                    {errors.businessName && <p className="mt-1 text-red-300 text-xs">{errors.businessName}</p>}
                                </div>
                                <div>
                                    <label className="block text-white/85 text-sm mb-2">Category</label>
                                    <input value={form.category} onChange={(e) => updateField('category', e.target.value)} className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/20 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                                    {errors.category && <p className="mt-1 text-red-300 text-xs">{errors.category}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-white/85 text-sm mb-2">Phone</label>
                                <div className="relative">
                                    <Phone className="w-5 h-5 text-white/50 absolute start-4 top-1/2 -translate-y-1/2" />
                                    <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/5 border border-white/20 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                                </div>
                                {errors.phone && <p className="mt-1 text-red-300 text-xs">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-white/85 text-sm mb-2">Address</label>
                                <div className="relative">
                                    <MapPin className="w-5 h-5 text-white/50 absolute start-4 top-1/2 -translate-y-1/2" />
                                    <input value={form.address} onChange={(e) => updateField('address', e.target.value)} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/5 border border-white/20 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                                </div>
                                {errors.address && <p className="mt-1 text-red-300 text-xs">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/85 text-sm mb-2">Governorate</label>
                                    <input value={form.governorate} onChange={(e) => updateField('governorate', e.target.value)} className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/20 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                                    {errors.governorate && <p className="mt-1 text-red-300 text-xs">{errors.governorate}</p>}
                                </div>
                                <div>
                                    <label className="block text-white/85 text-sm mb-2">City</label>
                                    <input value={form.city} onChange={(e) => updateField('city', e.target.value)} className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/20 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                                    {errors.city && <p className="mt-1 text-red-300 text-xs">{errors.city}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {showLanguageStep && (
                        <div>
                            <label className="block text-white/85 text-sm mb-3">Language selection</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { code: 'en', label: 'English' },
                                    { code: 'ar', label: 'العربية' },
                                    { code: 'ku', label: 'کوردی' }
                                ].map((language) => (
                                    <button
                                        key={language.code}
                                        type="button"
                                        onClick={() => updateField('language', language.code)}
                                        className={`h-14 rounded-xl border font-semibold transition-all flex items-center justify-center gap-2 ${form.language === language.code ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/20 text-white/75 hover:bg-white/10'}`}
                                    >
                                        <Globe className="w-4 h-4" />
                                        {language.label}
                                    </button>
                                ))}
                            </div>
                            {errors.language && <p className="mt-1 text-red-300 text-xs">{errors.language}</p>}
                        </div>
                    )}
                </div>

                {successMessage && (
                    <div className="mt-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-300/30 text-emerald-200 text-sm">
                        {successMessage}
                    </div>
                )}

                <div className="mt-8 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setStep(prev => Math.max(1, prev - 1))}
                        disabled={step === 1 || isLoading}
                        className="px-6 h-12 rounded-xl bg-white/10 border border-white/20 text-white disabled:opacity-30 hover:bg-white/15 transition-all"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading}
                        className="min-w-40 px-7 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : step === totalSteps ? 'Create account' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};
