import React, { useState } from 'react';
import {
  BookOpen,
  Brain,
  Sun,
  Moon,
  ShieldAlert,
  User,
  LogOut,
  ChevronDown,
  Languages,
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CapsuleButton } from '../common/CapsuleButton';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { haptic } from '../../lib/haptics';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
}) => {
  const { brand, brandConfig, setBrand, isDarkMode, toggleDarkMode } = useBrand();
  const { user, isAdmin, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b backdrop-blur-md ${
        brand === 'islamic'
          ? isDarkMode
            ? 'bg-[#031d16]/90 border-emerald-900/60 text-emerald-100'
            : 'bg-[#faf8f2]/90 border-[#e8dfcf] text-[#13231c]'
          : isDarkMode
          ? 'bg-[#0b0f19]/90 border-indigo-950/80 text-slate-100'
          : 'bg-[#ffffff]/90 border-slate-200/80 text-slate-900'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand identity emblem & title */}
        <div
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${
              brand === 'islamic'
                ? 'bg-gradient-to-br from-emerald-700 to-emerald-950 text-amber-300 border border-emerald-600/40'
                : 'bg-gradient-to-br from-indigo-600 to-teal-500 text-white border border-indigo-400/40'
            }`}
          >
            {brand === 'islamic' ? (
              <BookOpen className="w-5 h-5 text-amber-300" />
            ) : (
              <Brain className="w-5 h-5 text-teal-200" />
            )}
          </div>

          <div className="flex flex-col">
            <span
              className={`font-bold tracking-tight text-sm sm:text-base leading-tight ${
                brand === 'islamic'
                  ? 'font-serif text-emerald-900 dark:text-emerald-100'
                  : 'font-sans text-indigo-950 dark:text-indigo-100'
              }`}
            >
              {language === 'bn' ? (brandConfig.nameBn || brandConfig.name) : brandConfig.name}
            </span>
            <span className="text-[10px] sm:text-xs opacity-70 hidden min-[360px]:block font-medium truncate max-w-[140px] sm:max-w-xs">
              {language === 'bn' ? (brandConfig.taglineBn || brandConfig.tagline) : brandConfig.tagline}
            </span>
          </div>
        </div>

        {/* Brand Switcher Toggle in Top Nav */}
        <div className="flex items-center bg-black/5 dark:bg-white/10 p-1 rounded-full border border-black/5 dark:border-white/10 shrink-0">
          <button
            onClick={() => {
              haptic.light();
              setBrand('islamic');
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              brand === 'islamic'
                ? 'bg-emerald-700 text-amber-200 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
            title="Switch to Akash Islamic Center brand"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'bn' ? 'আকাশ ইসলামিক' : 'Akash Islamic'}
            </span>
            <span className="sm:hidden">
              {language === 'bn' ? 'ইসলামিক' : 'Islamic'}
            </span>
          </button>

          <button
            onClick={() => {
              haptic.light();
              setBrand('psychology');
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              brand === 'psychology'
                ? 'bg-indigo-600 text-teal-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300'
            }`}
            title="Switch to Mindscope Psychology brand"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'bn' ? 'মাইন্ডস্কোপ' : 'Mindscope'}
            </span>
            <span className="sm:hidden">
              {language === 'bn' ? 'মাইন্ড' : 'Mind'}
            </span>
          </button>
        </div>

        {/* Right Action Controls: Desktop links + dark mode + profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 mr-1 text-sm font-medium">
            <button
              onClick={() => {
                haptic.light();
                setCurrentTab('home');
              }}
              className={`px-3 py-1.5 rounded-full transition ${
                currentTab === 'home'
                  ? 'bg-black/5 dark:bg-white/10 font-bold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              {t.navFeed}
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  haptic.admin();
                  setCurrentTab('admin');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition text-xs font-bold uppercase tracking-wider ${
                  currentTab === 'admin'
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    : 'text-amber-500 hover:bg-amber-500/10'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {t.navAdmin}
              </button>
            )}
          </nav>

          {/* Language Toggle: বাংলা / EN */}
          <button
            onClick={() => {
              haptic.light();
              toggleLanguage();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            title="ভাষা পরিবর্তন / Switch Language"
          >
            <Languages className="w-3.5 h-3.5 opacity-70" />
            <span>{language === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => {
              haptic.light();
              toggleDarkMode();
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer text-zinc-600 dark:text-zinc-300"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Auth / Profile menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  haptic.medium();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-black/10 dark:border-white/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* User dropdown popup */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-2xl z-40 border transition-all text-xs font-medium animate-in fade-in slide-in-from-top-2 ${
                      isDarkMode
                        ? 'bg-[#0f172a] text-slate-100 border-slate-700'
                        : 'bg-white text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="px-3 py-2 border-b border-black/5 dark:border-white/10 mb-1">
                      <p className="font-bold text-sm truncate">{user.displayName}</p>
                      <p className="text-[11px] opacity-70 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        haptic.light();
                        setCurrentTab('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition text-left"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      {t.navProfile}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          haptic.admin();
                          setCurrentTab('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition text-left text-amber-500 font-semibold"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        {t.navAdmin}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        haptic.light();
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition text-left mt-1 border-t border-black/5 dark:border-white/10"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.navSignOut}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <CapsuleButton
              variant="primary"
              size="sm"
              onClick={() => {
                haptic.light();
                openAuthModal();
              }}
              icon={<User className="w-3.5 h-3.5" />}
            >
              {t.navSignIn}
            </CapsuleButton>
          )}
        </div>
      </div>
    </header>
  );
};
