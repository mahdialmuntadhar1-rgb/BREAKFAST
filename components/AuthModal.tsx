import React, { useMemo, useState } from 'react';
import { X, User, Briefcase, Mail, Lock, Phone, Building2, MapPinned, Globe, CheckCircle, ArrowLeft } from './icons';
import { governorates } from '../constants';
import { useTranslations } from '../hooks/useTranslations';

interface AuthModalProps {
    onClose: () => void;
    onLogin: (role: 'user' | 'owner') => void;
}

type FormData = {
    role: 'user' | 'owner';
    email: string;
    password: string;
    confirmPassword: string;
    businessName: string;
    category: string;
    phone: string;
    address: string;
    governorate: string;
    city: string;
    language: 'en' | 'ar' | 'ku';
};

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
    const { t } = useTranslations();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<FormData>({
        role: 'user',
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        category: '',
        phone: '',
        address: '',
        governorate: 'all',
        city: '',
        language: 'en',
    });

    const totalSteps = formData.role === 'owner' ? 4 : 3;
    const progressStep = Math.min(step, totalSteps);

    const stepTitle = useMemo(() => {
        if (step === 1) return 'Choose account type';
        if (step === 2) return 'Create your login';
        if (step === 3 && formData.role === 'owner') return 'Business details';
        return 'Choose language';
    }, [step, formData.role]);

    const validateStep = () => {
        const nextErrors: Record<string, string> = {};

        if (step === 2) {
            if (!formData.email.trim()) nextErrors.email = 'Email is required.';
            if (!/^\S+@\S+\.\S+$/.test(formData.email)) nextErrors.email = 'Enter a valid email address.';
            if (formData.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
            if (formData.confirmPassword !== formData.password) nextErrors.confirmPassword = 'Passwords do not match.';
        }

        if (step === 3 && formData.role === 'owner') {
            if (!formData.businessName.trim()) nextErrors.businessName = 'Business name is required.';
            if (!formData.category.trim()) nextErrors.category = 'Category is required.';
            if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required.';
            if (!formData.address.trim()) nextErrors.address = 'Address is required.';
            if (!formData.city.trim()) nextErrors.city = 'City is required.';
            if (!formData.governorate || formData.governorate === 'all') nextErrors.governorate = 'Please select a governorate.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const nextStep = () => {
        if (!validateStep()) return;
        setStep((prev) => Math.min(prev + 1, totalSteps));
    };

    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const submit = async () => {
        if (!validateStep()) return;
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        localStorage.setItem('iraq-compass-lang', formData.language);
        sessionStorage.setItem('pending_role', formData.role);
        setIsSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => {
            onLogin(formData.role);
        }, 1000);
    };

    const FieldLabel: React.FC<{ htmlFor: string; label: string }> = ({ htmlFor, label }) => (
        <label htmlFor={htmlFor} className="block text-white/85 text-sm font-semibold mb-2">{label}</label>
    );

    const FieldError: React.FC<{ id: string }> = ({ id }) => errors[id] ? <p className="text-red-300 text-xs mt-2">{errors[id]}</p> : null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl backdrop-blur-2xl bg-dark-bg/95 border border-white/15 rounded-3xl p-8 shadow-glow-primary text-start rtl:text-right">
                <button onClick={onClose} className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer flex items-center justify-center transition-all hover:-translate-y-0.5">
                    <X className="w-5 h-5 text-white" />
                </button>

                <h2 className="text-3xl font-black text-white mb-1">{t('auth.signUp') || 'Create account'}</h2>
                <p className="text-white/65 text-sm mb-6">Guided setup in a few quick steps.</p>

                <div className="mb-8">
                    <div className="flex items-center justify-between text-xs text-white/70 font-semibold mb-2">
                        <span>Step {progressStep} / {totalSteps}</span>
                        <span>{stepTitle}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: `${(progressStep / totalSteps) * 100}%` }} />
                    </div>
                </div>

                {isSuccess ? (
                    <div className="rounded-2xl border border-green-400/30 bg-green-400/10 p-8 text-center">
                        <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                        <h3 className="text-white text-2xl font-bold mb-2">Account created successfully</h3>
                        <p className="text-white/70">Welcome to Iraq Compass. Redirecting now...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {step === 1 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: 'user', label: 'User', desc: 'Explore businesses and events', icon: User, theme: 'primary' },
                                    { id: 'owner', label: 'Business Owner', desc: 'Grow your business visibility', icon: Briefcase, theme: 'secondary' },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    const active = formData.role === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: item.id as 'user' | 'owner' })}
                                            className={`p-6 rounded-2xl border text-left transition-all cursor-pointer hover:-translate-y-1 ${active
                                                ? item.theme === 'primary'
                                                    ? 'bg-primary/20 border-primary shadow-glow-primary'
                                                    : 'bg-secondary/20 border-secondary shadow-glow-secondary'
                                                : 'bg-white/5 border-white/15 hover:border-white/40'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6 text-white mb-3" />
                                            <p className="text-white text-lg font-bold">{item.label}</p>
                                            <p className="text-white/65 text-sm mt-1">{item.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
                                <div>
                                    <FieldLabel htmlFor="email" label="Email" />
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/8 border border-white/15 text-white outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(88,99,255,0.2)] transition-all" />
                                    </div>
                                    <FieldError id="email" />
                                </div>
                                <div>
                                    <FieldLabel htmlFor="password" label="Password" />
                                    <div className="relative">
                                        <Lock className="w-5 h-5 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/8 border border-white/15 text-white outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(88,99,255,0.2)] transition-all" />
                                    </div>
                                    <FieldError id="password" />
                                </div>
                                <div>
                                    <FieldLabel htmlFor="confirmPassword" label="Confirm password" />
                                    <div className="relative">
                                        <Lock className="w-5 h-5 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/8 border border-white/15 text-white outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(88,99,255,0.2)] transition-all" />
                                    </div>
                                    <FieldError id="confirmPassword" />
                                </div>
                            </div>
                        )}

                        {step === 3 && formData.role === 'owner' && (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
                                <h4 className="text-white font-semibold">Business information</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <FieldLabel htmlFor="businessName" label="Business name" />
                                        <div className="relative">
                                            <Building2 className="w-5 h-5 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input id="businessName" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/8 border border-white/15 text-white outline-none focus:border-secondary focus:shadow-[0_0_0_4px_rgba(8,217,214,0.2)] transition-all" />
                                        </div>
                                        <FieldError id="businessName" />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="category" label="Category" />
                                        <input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full h-14 px-4 rounded-xl bg-white/8 border border-white/15 text-white outline-none focus:border-secondary focus:shadow-[0_0_0_4px_rgba(8,217,214,0.2)] transition-all" />
                                        <FieldError id="category" />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="phone" label="Phone" />
                                        <div className="relative">
                                            <Phone className="w-5 h-5 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full h-14 ps-12 pe-4 rounded-xl bg-white/8 border border-white/15 text-white outline-none focus:border-secondary focus:shadow-[0_0_0_4px_rgba(8,217,214,0.2)] transition-all" />
                                        </div>
                                        <FieldError id="phone" />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="city" label="City" />
                                        <input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full h-14 px-4 rounded-xl bg-white/8 border border-white/15 text-white outline-none focus:border-secondary focus:shadow-[0_0_0_4px_rgba(8,217,214,0.2)] transition-all" />
                                        <FieldError id="city" />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel htmlFor="address" label="Address" />
                                    <div className="relative">
                                        <MapPinned className="w-5 h-5 text-white/50 absolute left-4 top-5" />
                                        <textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} className="w-full ps-12 pe-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white outline-none focus:border-secondary focus:shadow-[0_0_0_4px_rgba(8,217,214,0.2)] transition-all" />
                                    </div>
                                    <FieldError id="address" />
                                </div>
                                <div>
                                    <FieldLabel htmlFor="governorate" label="Governorate" />
                                    <select id="governorate" value={formData.governorate} onChange={(e) => setFormData({ ...formData, governorate: e.target.value })} className="w-full h-14 px-4 rounded-xl bg-white/8 border border-white/15 text-white outline-none focus:border-secondary transition-all">
                                        {governorates.map((gov) => <option className="bg-dark-bg" key={gov.id} value={gov.id}>{t(gov.nameKey)}</option>)}
                                    </select>
                                    <FieldError id="governorate" />
                                </div>
                            </div>
                        )}

                        {((step === 3 && formData.role === 'user') || step === 4) && (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                                <FieldLabel htmlFor="language" label="App language" />
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'en', label: 'English' },
                                        { id: 'ar', label: 'العربية' },
                                        { id: 'ku', label: 'کوردی' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, language: item.id as 'en' | 'ar' | 'ku' })}
                                            className={`h-12 rounded-xl border font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 ${formData.language === item.id ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/15 text-white/70 hover:border-white/40'}`}
                                        >
                                            <Globe className="w-4 h-4" />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3 pt-2">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1 || isSubmitting}
                                className="h-12 px-5 rounded-xl border border-white/15 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>

                            {progressStep < totalSteps ? (
                                <button type="button" onClick={nextStep} className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:-translate-y-0.5 hover:shadow-glow-primary transition-all cursor-pointer">
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={isSubmitting}
                                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:-translate-y-0.5 hover:shadow-glow-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {isSubmitting ? 'Creating account...' : 'Sign up'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
