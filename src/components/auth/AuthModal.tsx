import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useBrand } from '../../context/BrandContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { CapsuleButton } from '../common/CapsuleButton';
import { haptic } from '../../lib/haptics';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginEmail, signupEmail, loginGoogle } = useAuth();
  const { showToast } = useToast();
  const { brand } = useBrand();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দিন।' : 'Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && !displayName.trim()) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম প্রদান করুন।' : 'Please provide your display name.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const u = await loginEmail(email, password);
        haptic.signIn();
        showToast(language === 'bn' ? `স্বাগতম, ${u.displayName}!` : `Welcome back, ${u.displayName}!`, 'success');
      } else {
        const u = await signupEmail(email, password, displayName);
        haptic.signIn();
        showToast(language === 'bn' ? `অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম, ${u.displayName}!` : `Account created! Welcome, ${u.displayName}!`, 'success');
      }
      resetForm();
      onClose();
    } catch (err: any) {
      haptic.error();
      setErrorMessage(err?.message || (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য দিন।' : 'Authentication failed.'));
      showToast(language === 'bn' ? 'প্রমাণীকরণ ব্যর্থ হয়েছে' : 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const u = await loginGoogle();
      haptic.signIn();
      showToast(language === 'bn' ? `গুগল দিয়ে সাইন ইন সম্পন্ন: ${u.displayName}` : `Signed in with Google as ${u.displayName}`, 'success');
      resetForm();
      onClose();
    } catch (err: any) {
      haptic.error();
      setErrorMessage(err?.message || (language === 'bn' ? 'গুগল সাইন ইন বাতিল হয়েছে।' : 'Google sign-in was cancelled.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={mode === 'login' ? t.signInHeading : t.signUpHeading}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Tab switch between Sign In and Sign Up */}
        <div className="flex p-1 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={() => {
              haptic.light();
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
              mode === 'login'
                ? brand === 'islamic'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-indigo-600 text-white shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            {t.navSignIn}
          </button>
          <button
            type="button"
            onClick={() => {
              haptic.light();
              setMode('signup');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
              mode === 'signup'
                ? brand === 'islamic'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-indigo-600 text-white shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            {t.signUpSubmit}
          </button>
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">{t.displayNameLabel}</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: আকাশ আহমেদ' : 'e.g. Akash Ahmed'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">{t.passwordLabel}</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <CapsuleButton
            variant="primary"
            size="md"
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            {mode === 'login' ? t.signInSubmit : t.signUpSubmit}
          </CapsuleButton>
        </form>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-black/10 dark:border-white/10 w-full" />
          <span className="bg-transparent px-3 text-[11px] uppercase tracking-wider opacity-60 shrink-0">
            {language === 'bn' ? 'অথবা' : 'or'}
          </span>
          <div className="border-t border-black/10 dark:border-white/10 w-full" />
        </div>

        {/* Google Sign-In button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-full border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer active:scale-98"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {t.continueWithGoogle}
        </button>
      </div>
    </Modal>
  );
};
