import React, { useState } from 'react';
import { X } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (role: 'user' | 'owner') => void;
}

const mapAuthError = (message: string) => {
  if (message.includes('Invalid login credentials')) return 'Invalid email or password.';
  if (message.includes('Email not confirmed')) return 'Please verify your email before signing in.';
  if (message.includes('User already registered')) return 'This email is already registered. Please sign in.';
  return 'Authentication failed. Please try again.';
};

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { t } = useTranslations();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    sessionStorage.setItem('pending_role', role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      sessionStorage.removeItem('pending_role');
      setErrorMessage(mapAuthError(error.message));
      setIsLoading(false);
      return;
    }

    onLogin(role);
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    sessionStorage.setItem('pending_role', role);

    if (activeTab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);
      if (error) {
        sessionStorage.removeItem('pending_role');
        setErrorMessage(mapAuthError(error.message));
        return;
      }
      onLogin(role);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: window.location.origin,
      },
    });

    setIsLoading(false);
    if (error) {
      sessionStorage.removeItem('pending_role');
      setErrorMessage(mapAuthError(error.message));
      return;
    }

    setSuccessMessage('Account created. Check your email to confirm your account if required.');
    onLogin(role);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md backdrop-blur-2xl bg-dark-bg/90 border border-white/20 rounded-3xl p-8 shadow-glow-primary text-start rtl:text-right">
        <button onClick={onClose} className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">{activeTab === 'signin' ? t('auth.signIn') : t('auth.signUp')}</h2>
        <p className="text-white/60 text-sm mb-8">{activeTab === 'signin' ? t('auth.welcomeBack') : t('auth.joinEcosystem')}</p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <button type="button" onClick={() => setRole('user')} className={`flex-1 py-3 rounded-xl border transition-all ${role === 'user' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/60'}`}>{t('auth.roleUser')}</button>
            <button type="button" onClick={() => setRole('owner')} className={`flex-1 py-3 rounded-xl border transition-all ${role === 'owner' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-white/10 text-white/60'}`}>{t('auth.roleOwner')}</button>
          </div>

          <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50">
            {isLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <><img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" /><span>{t('auth.continueGoogle')}</span></>}
          </button>

          <div className="space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t('auth.email')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t('auth.password')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
            <button onClick={handleEmailAuth} disabled={isLoading} className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold disabled:opacity-60">
              {activeTab === 'signin' ? t('auth.signIn') : t('auth.createAccount')}
            </button>
          </div>

          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
          {successMessage && <p className="text-sm text-green-400">{successMessage}</p>}

          <div className="text-center">
            <button onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')} className="text-primary text-sm font-medium hover:underline">
              {activeTab === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
