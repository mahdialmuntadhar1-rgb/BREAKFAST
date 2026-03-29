import React, { useMemo, useState } from 'react';
import { X } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (role: 'user' | 'owner') => void;
  initialView?: AuthView;
}

type AuthView = 'signin' | 'signup' | 'forgot' | 'reset';
type Language = 'en' | 'ar' | 'ku';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, initialView = 'signin' }) => {
  const [activeView, setActiveView] = useState<AuthView>(initialView);
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [language, setLanguage] = useState<Language>('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { t, setLang } = useTranslations();

  const redirectTo = import.meta.env.VITE_SITE_URL || window.location.origin;

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const validate = () => {
    if (!normalizedEmail) return t('auth.errors.emailRequired');
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return t('auth.errors.invalidEmail');

    if (activeView === 'forgot') return null;

    if (!password || password.length < 6) return t('auth.errors.passwordMin');

    if ((activeView === 'signup' || activeView === 'reset') && password !== confirmPassword) {
      return t('auth.errors.passwordMatch');
    }

    if (activeView === 'signup' && role === 'owner') {
      if (!businessName.trim()) return t('auth.errors.businessNameRequired');
      if (!businessCategory.trim()) return t('auth.errors.businessCategoryRequired');
      if (!phone.trim()) return t('auth.errors.phoneRequired');
      if (!address.trim()) return t('auth.errors.addressRequired');
      if (!governorate.trim() || !city.trim()) return t('auth.errors.locationRequired');
    }

    return null;
  };

  const handleEmailAuth = async () => {
    resetMessages();
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);

    try {
      if (activeView === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
        if (error) throw error;
        setSuccessMessage(t('auth.forgotSent'));
        return;
      }

      if (activeView === 'reset') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setSuccessMessage(t('auth.resetSuccess'));
        setActiveView('signin');
        setPassword('');
        setConfirmPassword('');
        return;
      }

      sessionStorage.setItem('pending_role', role);
      sessionStorage.setItem('pending_language', language);

      const result =
        activeView === 'signin'
          ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
          : await supabase.auth.signUp({
              email: normalizedEmail,
              password,
              options: {
                data: {
                  role,
                  preferredLanguage: language,
                  businessName,
                  businessCategory,
                  phone,
                  address,
                  governorate,
                  city,
                  socialLinks: { website, instagram, facebook },
                },
              },
            });

      if (result.error) throw result.error;

      setLang(language);
      onLogin(role);
    } catch (error: any) {
      console.error('Email auth error:', error);
      setErrorMessage(error?.message || t('auth.errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md max-h-[95vh] overflow-y-auto backdrop-blur-2xl bg-dark-bg/90 border border-white/20 rounded-3xl p-6 md:p-8 shadow-glow-primary text-start rtl:text-right">
        <button onClick={onClose} className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><X className="w-5 h-5 text-white" /></button>

        <h2 className="text-2xl font-bold text-white mb-2">
          {activeView === 'signin' && t('auth.signIn')}
          {activeView === 'signup' && t('auth.signUp')}
          {activeView === 'forgot' && t('auth.forgotPassword')}
          {activeView === 'reset' && t('auth.resetPassword')}
        </h2>
        <p className="text-white/60 text-sm mb-6">{activeView === 'signin' ? t('auth.welcomeBack') : t('auth.joinEcosystem')}</p>

        <div className="space-y-4">
          {activeView === 'signup' && (
            <>
              <div className="flex gap-4">
                <button type="button" onClick={() => setRole('user')} className={`flex-1 py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${role === 'user' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/60'}`}><span className="font-semibold text-sm">{t('auth.roleUser')}</span><span className="text-[10px] opacity-60">{t('auth.exploreConnect')}</span></button>
                <button type="button" onClick={() => setRole('owner')} className={`flex-1 py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${role === 'owner' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-white/10 text-white/60'}`}><span className="font-semibold text-sm">{t('auth.roleOwner')}</span><span className="text-[10px] opacity-60">{t('auth.growBusiness')}</span></button>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">{t('auth.language')}</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none">
                  <option value="ar">العربية</option>
                  <option value="ku">کوردی</option>
                  <option value="en">English</option>
                </select>
              </div>
            </>
          )}

          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t('auth.email')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />

          {activeView !== 'forgot' && (
            <>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t('auth.password')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
              {(activeView === 'signup' || activeView === 'reset') && (
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder={t('auth.confirmPassword')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
              )}
            </>
          )}

          {activeView === 'signup' && role === 'owner' && (
            <div className="grid grid-cols-1 gap-3">
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} type="text" placeholder={t('auth.businessName')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
              <input value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} type="text" placeholder={t('auth.businessCategory')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="text" placeholder={t('auth.phone')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
              <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" placeholder={t('auth.address')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={governorate} onChange={(e) => setGovernorate(e.target.value)} type="text" placeholder={t('auth.governorate')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                <input value={city} onChange={(e) => setCity(e.target.value)} type="text" placeholder={t('auth.city')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
              </div>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} type="url" placeholder={t('auth.websiteOptional')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={instagram} onChange={(e) => setInstagram(e.target.value)} type="text" placeholder={t('auth.instagramOptional')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                <input value={facebook} onChange={(e) => setFacebook(e.target.value)} type="text" placeholder={t('auth.facebookOptional')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
              </div>
            </div>
          )}

          {errorMessage && <p className="text-red-300 text-sm">{errorMessage}</p>}
          {successMessage && <p className="text-green-300 text-sm">{successMessage}</p>}

          <button onClick={handleEmailAuth} disabled={isLoading} className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold disabled:opacity-50">
            {isLoading ? t('directory.loading') : activeView === 'signin' ? t('auth.signIn') : activeView === 'signup' ? t('auth.createAccount') : activeView === 'forgot' ? t('auth.sendResetLink') : t('auth.resetPassword')}
          </button>

          <div className="space-y-1 text-center">
            {activeView === 'signin' && (
              <>
                <button onClick={() => { resetMessages(); setActiveView('forgot'); }} className="text-primary text-sm hover:underline">{t('auth.forgotPassword')}</button>
                <button onClick={() => { resetMessages(); setActiveView('signup'); }} className="block w-full text-primary text-sm font-medium hover:underline">{t('auth.noAccount')}</button>
              </>
            )}
            {activeView === 'signup' && <button onClick={() => { resetMessages(); setActiveView('signin'); }} className="text-primary text-sm font-medium hover:underline">{t('auth.haveAccount')}</button>}
            {activeView === 'forgot' && <button onClick={() => { resetMessages(); setActiveView('signin'); }} className="text-primary text-sm font-medium hover:underline">{t('auth.backToSignIn')}</button>}
            {activeView === 'reset' && <button onClick={() => { resetMessages(); setActiveView('signin'); }} className="text-primary text-sm font-medium hover:underline">{t('auth.backToSignIn')}</button>}
          </div>
        </div>
      </div>
    </div>
  );
};
