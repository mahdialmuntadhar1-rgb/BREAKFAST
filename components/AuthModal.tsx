import React, { useMemo, useState } from 'react';
import { X, User, Briefcase, Mail, Lock, Phone, Building2, MapPin, Store, LanguagesIcon, Loader2, CheckCircle } from './icons';

interface AuthModalProps {
    onClose: () => void;
    onLogin: (role: 'user' | 'owner') => void;
}

type Role = 'user' | 'owner' | null;

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    businessName: string;
    category: string;
    phone: string;
    address: string;
    governorate: string;
    city: string;
    language: string;
}

const initialData: FormData = {
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
};

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<Role>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState<FormData>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const totalSteps = role === 'owner' ? 4 : 3;

    const stepTitle = useMemo(() => {
        if (isSuccess) return 'Account created';
        if (step === 1) return 'Choose your role';
        if (step === 2) return 'Create your account';
        if (step === 3 && role === 'owner') return 'Business details';
        if ((step === 3 && role === 'user') || (step === 4 && role === 'owner')) return 'Choose language';
        return 'Create account';
    }, [step, role, isSuccess]);

    const stepDescription = useMemo(() => {
        if (isSuccess) return 'Welcome to Iraq Compass. You can now explore and connect.';
        if (step === 1) return 'Select how you want to use Iraq Compass.';
        if (step === 2) return 'Use a secure email and password to continue.';
        if (step === 3 && role === 'owner') return 'Help people discover your business faster.';
        return 'Set your preferred language for a personalized experience.';
    }, [step, role, isSuccess]);

    const updateField = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validateStep = () => {
        const nextErrors: Record<string, string> = {};

        if (step === 1 && !role) {
            nextErrors.role = 'Please choose a role to continue.';
        }

        if (step === 2) {
            if (!formData.email.trim()) nextErrors.email = 'Email is required.';
            else if (!/^\S+@\S+\.\S+$/.test(formData.email)) nextErrors.email = 'Enter a valid email address.';

            if (!formData.password) nextErrors.password = 'Password is required.';
            else if (formData.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';

            if (!formData.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
            else if (formData.confirmPassword !== formData.password) nextErrors.confirmPassword = 'Passwords do not match.';
        }

        if (step === 3 && role === 'owner') {
            if (!formData.businessName.trim()) nextErrors.businessName = 'Business name is required.';
            if (!formData.category.trim()) nextErrors.category = 'Category is required.';
            if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required.';
            if (!formData.address.trim()) nextErrors.address = 'Address is required.';
            if (!formData.governorate.trim()) nextErrors.governorate = 'Governorate is required.';
            if (!formData.city.trim()) nextErrors.city = 'City is required.';
        }

        if ((step === 3 && role === 'user') || (step === 4 && role === 'owner')) {
            if (!formData.language.trim()) nextErrors.language = 'Please choose a language.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        if (step < totalSteps) {
            setStep((prev) => prev + 1);
            return;
        }

        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 900));
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const handleBack = () => {
        setErrors({});
        setStep((prev) => Math.max(1, prev - 1));
    };

    const Field: React.FC<{ label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }> = ({ label, icon, error, children }) => (
        <div className="space-y-2">
            <label className="text-white/80 text-sm font-semibold">{label}</label>
            <div className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 h-14 transition-all ${error ? 'border-red-400/60 ring-2 ring-red-400/20' : 'border-white/20 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20'}`}>
                <span className="text-white/50">{icon}</span>
                {children}
            </div>
            {error && <p className="text-red-300 text-xs font-medium">{error}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-dark-bg/95 border border-white/20 rounded-3xl p-8 md:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.65)] text-start">
                <button onClick={onClose} className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer">
                    <X className="w-5 h-5 text-white" />
                </button>

                <div className="mb-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">
                            Step {Math.min(step, totalSteps)} / {totalSteps}
                        </p>
                        {!isSuccess && role && (
                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                                {role === 'owner' ? 'Business owner' : 'User'}
                            </span>
                        )}
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{stepTitle}</h2>
                        <p className="text-white/65 text-sm">{stepDescription}</p>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-green-400/40 bg-green-500/10 p-8 text-center">
                            <CheckCircle className="w-14 h-14 text-green-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">Signup successful</h3>
                            <p className="text-white/70">Your account is ready. Continue to explore trusted local businesses.</p>
                        </div>
                        <button
                            onClick={() => onLogin(role || 'user')}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-glow-primary transition-all cursor-pointer"
                        >
                            Continue to Iraq Compass
                        </button>
                    </div>
                ) : (
                    <div className="space-y-7">
                        {step === 1 && (
                            <div className="space-y-3">
                                <p className="text-white/70 text-sm">Choose the account that fits your goals.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole('user')}
                                        className={`h-28 p-5 rounded-2xl border text-start transition-all hover:-translate-y-0.5 hover:shadow-xl cursor-pointer ${role === 'user' ? 'bg-primary/20 border-primary ring-4 ring-primary/20' : 'bg-white/5 border-white/15 hover:border-white/30'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <User className="w-5 h-5 text-primary" />
                                            <span className="text-white font-bold">User</span>
                                        </div>
                                        <p className="text-white/60 text-sm">Discover cafés, offers, events and stories near you.</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('owner')}
                                        className={`h-28 p-5 rounded-2xl border text-start transition-all hover:-translate-y-0.5 hover:shadow-xl cursor-pointer ${role === 'owner' ? 'bg-secondary/20 border-secondary ring-4 ring-secondary/20' : 'bg-white/5 border-white/15 hover:border-white/30'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <Briefcase className="w-5 h-5 text-secondary" />
                                            <span className="text-white font-bold">Business Owner</span>
                                        </div>
                                        <p className="text-white/60 text-sm">Showcase your business and attract nearby customers.</p>
                                    </button>
                                </div>
                                {errors.role && <p className="text-red-300 text-xs font-medium">{errors.role}</p>}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <Field label="Email" icon={<Mail className="w-4 h-4" />} error={errors.email}>
                                    <input className="bg-transparent w-full outline-none text-white placeholder:text-white/35" placeholder="you@example.com" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
                                </Field>
                                <Field label="Password" icon={<Lock className="w-4 h-4" />} error={errors.password}>
                                    <input type="password" className="bg-transparent w-full outline-none text-white placeholder:text-white/35" placeholder="At least 8 characters" value={formData.password} onChange={(e) => updateField('password', e.target.value)} />
                                </Field>
                                <Field label="Confirm password" icon={<Lock className="w-4 h-4" />} error={errors.confirmPassword}>
                                    <input type="password" className="bg-transparent w-full outline-none text-white placeholder:text-white/35" placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} />
                                </Field>
                            </div>
                        )}

                        {step === 3 && role === 'owner' && (
                            <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <Field label="Business name" icon={<Building2 className="w-4 h-4" />} error={errors.businessName}>
                                    <input className="bg-transparent w-full outline-none text-white" value={formData.businessName} onChange={(e) => updateField('businessName', e.target.value)} />
                                </Field>
                                <Field label="Category" icon={<Store className="w-4 h-4" />} error={errors.category}>
                                    <input className="bg-transparent w-full outline-none text-white" value={formData.category} onChange={(e) => updateField('category', e.target.value)} />
                                </Field>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Field label="Phone" icon={<Phone className="w-4 h-4" />} error={errors.phone}>
                                        <input className="bg-transparent w-full outline-none text-white" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
                                    </Field>
                                    <Field label="Address" icon={<MapPin className="w-4 h-4" />} error={errors.address}>
                                        <input className="bg-transparent w-full outline-none text-white" value={formData.address} onChange={(e) => updateField('address', e.target.value)} />
                                    </Field>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Field label="Governorate" icon={<MapPin className="w-4 h-4" />} error={errors.governorate}>
                                        <input className="bg-transparent w-full outline-none text-white" value={formData.governorate} onChange={(e) => updateField('governorate', e.target.value)} />
                                    </Field>
                                    <Field label="City" icon={<MapPin className="w-4 h-4" />} error={errors.city}>
                                        <input className="bg-transparent w-full outline-none text-white" value={formData.city} onChange={(e) => updateField('city', e.target.value)} />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {((step === 3 && role === 'user') || (step === 4 && role === 'owner')) && (
                            <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <Field label="Language" icon={<LanguagesIcon className="w-4 h-4" />} error={errors.language}>
                                    <select
                                        value={formData.language}
                                        onChange={(e) => updateField('language', e.target.value)}
                                        className="bg-transparent w-full outline-none text-white"
                                    >
                                        <option value="en" className="bg-dark-bg">English</option>
                                        <option value="ar" className="bg-dark-bg">العربية</option>
                                        <option value="ku" className="bg-dark-bg">کوردی</option>
                                    </select>
                                </Field>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3 pt-2">
                            <button
                                type="button"
                                onClick={step === 1 ? onClose : handleBack}
                                className="h-12 px-6 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition-all cursor-pointer"
                            >
                                {step === 1 ? 'Cancel' : 'Back'}
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="min-w-[160px] h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-glow-primary transition-all disabled:opacity-70 inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {step === totalSteps ? 'Create account' : 'Next'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
