import React, { useState } from 'react';
import { X } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (role: 'user' | 'owner') => void;
}

const getErrorMessage = (message: string) => {
  if (message.toLowerCase().includes('invalid login credentials')) return 'Invalid email or password.';
  if (message.toLowerCase().includes('email not confirmed')) return 'Please verify your email before signing in.';
  if (message.toLowerCase().includes('already registered')) return 'This email is already registered. Please sign in.';
  return message;
};

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { t } = useTranslations();

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      sessionStorage.setItem('pending_role', role);
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      onLogin(role);
    } catch (error: any) {
      setErrorMsg(getErrorMessage(error.message || 'Failed to sign in with Google.'));
      sessionStorage.removeItem('pending_role');
    } finally { setIsLoading(false); }
  };

  const handleEmailAuth = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      if (activeTab === 'signup') {
        sessionStorage.setItem('pending_role', role);
        const { error } = await supabase.auth.signUp(email, password);
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword(email, password);
        if (error) throw error;
      }
      onLogin(role);
    } catch (error: any) {
      setErrorMsg(getErrorMessage(error.message || 'Authentication failed.'));
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md backdrop-blur-2xl bg-dark-bg/90 border border-white/20 rounded-3xl p-8 shadow-glow-primary text-start rtl:text-right">
        <button onClick={onClose} className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><X className="w-5 h-5 text-white" /></button>
        <h2 className="text-2xl font-bold text-white mb-2">{activeTab === 'signin' ? t('auth.signIn') : t('auth.signUp')}</h2>
        <p className="text-white/60 text-sm mb-8">{activeTab === 'signin' ? t('auth.welcomeBack') : t('auth.joinEcosystem')}</p>

        <div className="space-y-6">
          {activeTab === 'signup' && <div className="flex gap-4"><button type="button" onClick={() => setRole('user')} className={`flex-1 py-3 rounded-xl border ${role === 'user' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/60'}`}><span className="font-semibold text-sm">{t('auth.roleUser')}</span></button><button type="button" onClick={() => setRole('owner')} className={`flex-1 py-3 rounded-xl border ${role === 'owner' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-white/10 text-white/60'}`}><span className="font-semibold text-sm">{t('auth.roleOwner')}</span></button></div>}

          <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-white/90 disabled:opacity-50">
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
            <span>{t('auth.continueGoogle')}</span>
          </button>

          <div className="space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t('auth.email')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t('auth.password')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
            <button onClick={handleEmailAuth} disabled={isLoading || !email || !password} className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold disabled:opacity-50">{activeTab === 'signin' ? t('auth.signIn') : t('auth.createAccount')}</button>
          </div>

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <div className="text-center"><button onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')} className="text-primary text-sm font-medium hover:underline">{activeTab === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}</button></div>
        </div>
      </div>
    </div>
  );
};
