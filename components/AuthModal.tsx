import React, { useMemo, useState } from 'react';
import { X, User, Briefcase, Mail, Lock, Phone, Building2, MapPin, Languages, CheckCircle } from './icons';
import { useTranslations } from '../hooks/useTranslations';

interface AuthModalProps {
    onClose: () => void;
    onLogin: (role: 'user' | 'owner') => void;
}

interface FormState {
    email: string;
    password: string;
    confirmPassword: string;
    businessName: string;
    category: string;
    phone: string;
    address: string;
    governorate: string;
    city: string;
    language: 'en' | 'ar' | 'ku' | '';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
    const [role, setRole] = useState<'user' | 'owner' | null>(null);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [form, setForm] = useState<FormState>({
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        category: '',
        phone: '',
        address: '',
        governorate: '',
        city: '',
        language: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { t } = useTranslations();

    const maxStep = role === 'owner' ? 4 : 3;

    const inputBase = 'w-full h-14 rounded-2xl bg-white/5 border border-white/15 text-white px-4 outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgba(109,91,255,0.2)]';

    const stepTitles = useMemo(() => ({
        1: 'Choose your role',
        2: 'Create your account',
        3: role === 'owner' ? 'Business details' : 'Choose your language',
        4: 'Choose your language',
    }), [role]);

    const setField = (key: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validateStep = () => {
        const nextErrors: Record<string, string> = {};

        if (step === 1 && !role) {
            nextErrors.role = 'Please choose a role to continue.';
        }

        if (step === 2) {
            if (!form.email.trim()) nextErrors.email = 'Email is required.';
            else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Please enter a valid email.';
            if (!form.password) nextErrors.password = 'Password is required.';
            else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
            if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
            else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';
        }

        if (step === 3 && role === 'owner') {
            if (!form.businessName.trim()) nextErrors.businessName = 'Business name is required.';
            if (!form.category.trim()) nextErrors.category = 'Category is required.';
            if (!form.phone.trim()) nextErrors.phone = 'Phone is required.';
            if (!form.address.trim()) nextErrors.address = 'Address is required.';
            if (!form.governorate.trim()) nextErrors.governorate = 'Governorate is required.';
            if (!form.city.trim()) nextErrors.city = 'City is required.';
        }

        const languageStep = role === 'owner' ? 4 : 3;
        if (step === languageStep && !form.language) {
            nextErrors.language = 'Please choose your language.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep()) return;
        setStep(prev => Math.min(prev + 1, maxStep));
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep() || !role) return;
        setIsSubmitting(true);
        setSuccessMessage('');

        setTimeout(() => {
            setIsSubmitting(false);
            setSuccessMessage('Account created successfully. Welcome to Iraq Compass!');
            onLogin(role);
        }, 900);
    };

    const progressPercent = (step / maxStep) * 100;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-dark-bg/95 border border-white/20 rounded-3xl p-8 shadow-glow-primary text-start rtl:text-right">
                <button onClick={onClose} className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
                    <X className="w-5 h-5 text-white" />
                </button>

                <p className="text-primary text-sm font-semibold mb-2">Step {step} / {maxStep}</p>
                <div className="w-full h-2 rounded-full bg-white/10 mb-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">{stepTitles[step as keyof typeof stepTitles]}</h2>
                <p className="text-white/60 text-sm mb-8">Create your account in a guided flow.</p>

                {step === 1 && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('user')}
                                className={`h-24 rounded-2xl border px-5 text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg ${role === 'user' ? 'bg-primary/20 border-primary text-white shadow-glow-primary' : 'bg-white/5 border-white/10 text-white/70'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5" />
                                    <div>
                                        <p className="font-semibold">User</p>
                                        <p className="text-xs opacity-70">Explore places and offers</p>
                                    </div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('owner')}
                                className={`h-24 rounded-2xl border px-5 text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg ${role === 'owner' ? 'bg-secondary/20 border-secondary text-white shadow-glow-secondary' : 'bg-white/5 border-white/10 text-white/70'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-5 h-5" />
                                    <div>
                                        <p className="font-semibold">Business Owner</p>
                                        <p className="text-xs opacity-70">Grow your business visibility</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                        {errors.role && <p className="text-red-400 text-sm">{errors.role}</p>}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm text-white/80 mb-2 block">Email</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-white/50 absolute top-1/2 -translate-y-1/2 left-4" />
                                <input className={`${inputBase} ps-12`} value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@example.com" />
                            </div>
                            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="text-sm text-white/80 mb-2 block">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-white/50 absolute top-1/2 -translate-y-1/2 left-4" />
                                <input type="password" className={`${inputBase} ps-12`} value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="At least 8 characters" />
                            </div>
                            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="text-sm text-white/80 mb-2 block">Confirm password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-white/50 absolute top-1/2 -translate-y-1/2 left-4" />
                                <input type="password" className={`${inputBase} ps-12`} value={form.confirmPassword} onChange={(e) => setField('confirmPassword', e.target.value)} placeholder="Repeat password" />
                            </div>
                            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                )}

                {step === 3 && role === 'owner' && (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                            <h3 className="text-white font-semibold">Business profile</h3>
                            <div>
                                <label className="text-sm text-white/80 mb-2 block">Business name</label>
                                <div className="relative">
                                    <Building2 className="w-5 h-5 text-white/50 absolute top-1/2 -translate-y-1/2 left-4" />
                                    <input className={`${inputBase} ps-12`} value={form.businessName} onChange={(e) => setField('businessName', e.target.value)} />
                                </div>
                                {errors.businessName && <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-white/80 mb-2 block">Category</label>
                                <input className={inputBase} value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="Restaurant, Cafe, Market..." />
                                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                            <h3 className="text-white font-semibold">Location & contact</h3>
                            <div>
                                <label className="text-sm text-white/80 mb-2 block">Phone</label>
                                <div className="relative">
                                    <Phone className="w-5 h-5 text-white/50 absolute top-1/2 -translate-y-1/2 left-4" />
                                    <input className={`${inputBase} ps-12`} value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+964 ..." />
                                </div>
                                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-white/80 mb-2 block">Address</label>
                                <div className="relative">
                                    <MapPin className="w-5 h-5 text-white/50 absolute top-1/2 -translate-y-1/2 left-4" />
                                    <input className={`${inputBase} ps-12`} value={form.address} onChange={(e) => setField('address', e.target.value)} />
                                </div>
                                {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-white/80 mb-2 block">Governorate</label>
                                    <input className={inputBase} value={form.governorate} onChange={(e) => setField('governorate', e.target.value)} />
                                    {errors.governorate && <p className="text-red-400 text-sm mt-1">{errors.governorate}</p>}
                                </div>
                                <div>
                                    <label className="text-sm text-white/80 mb-2 block">City</label>
                                    <input className={inputBase} value={form.city} onChange={(e) => setField('city', e.target.value)} />
                                    {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {((step === 3 && role === 'user') || step === 4) && (
                    <div className="space-y-4">
                        <label className="text-sm text-white/80 mb-2 block">Language</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'en', label: 'English' },
                                { id: 'ar', label: 'العربية' },
                                { id: 'ku', label: 'کوردی' },
                            ].map((language) => (
                                <button
                                    key={language.id}
                                    type="button"
                                    onClick={() => setField('language', language.id)}
                                    className={`h-16 rounded-2xl border transition-all cursor-pointer hover:-translate-y-0.5 ${form.language === language.id ? 'border-primary bg-primary/15 text-white' : 'border-white/15 bg-white/5 text-white/70'}`}
                                >
                                    <span className="inline-flex items-center gap-2 font-semibold"><Languages className="w-4 h-4" />{language.label}</span>
                                </button>
                            ))}
                        </div>
                        {errors.language && <p className="text-red-400 text-sm">{errors.language}</p>}
                    </div>
                )}

                {successMessage && (
                    <div className="mt-6 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 p-4 text-emerald-200 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <p>{successMessage}</p>
                    </div>
                )}

                <div className="mt-8 flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={step === 1 || isSubmitting}
                        className="px-6 h-12 rounded-xl bg-white/10 border border-white/15 text-white disabled:opacity-40 transition-all hover:bg-white/15 cursor-pointer"
                    >
                        Back
                    </button>

                    {step < maxStep ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-8 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all cursor-pointer hover:-translate-y-0.5"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-60 transition-all hover:shadow-glow-primary cursor-pointer"
                        >
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
