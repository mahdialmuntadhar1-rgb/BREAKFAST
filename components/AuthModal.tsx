import React, { useState } from 'react';
import { X } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (role: 'user' | 'owner') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslations();

  const redirectTo = (window as any).__SITE_URL__ || window.location.origin;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('pending_role', role);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
      onLogin(role);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      localStorage.removeItem('pending_role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    try {
      localStorage.setItem('pending_role', role);
      const result =
        activeTab === 'signin'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });

      if (result.error) throw result.error;
      onLogin(role);
    } catch (error) {
      console.error('Email auth error:', error);
      localStorage.removeItem('pending_role');
    } finally {
      setIsLoading(false);
    }
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
          {activeTab === 'signup' && (
            <div className="flex gap-4">
              <button type="button" onClick={() => setRole('user')} className={`flex-1 py-3 rounded-xl border transition-all ${role === 'user' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/60'}`}>
                {t('auth.roleUser')}
              </button>
              <button type="button" onClick={() => setRole('owner')} className={`flex-1 py-3 rounded-xl border transition-all ${role === 'owner' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-white/10 text-white/60'}`}>
                {t('auth.roleOwner')}
              </button>
            </div>
          )}

          <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>{t('auth.continueGoogle')}</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-dark-bg px-2 text-white/40">{t('auth.orEmail')}</span></div>
          </div>

          <div className="space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t('auth.email')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t('auth.password')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
            <button onClick={handleEmailAuth} disabled={isLoading} className="w-full py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50">
              {activeTab === 'signin' ? t('auth.signIn') : t('auth.createAccount')}
            </button>
          </div>

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
