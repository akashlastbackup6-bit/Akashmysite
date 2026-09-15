import React from 'react';
import { Home, Compass, User, ShieldAlert, PlusCircle } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { haptic } from '../../lib/haptics';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
  onNewPostClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  onNewPostClick,
}) => {
  const { brand, isDarkMode } = useBrand();
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg px-2 py-1.5 transition-colors duration-200 ${
        brand === 'islamic'
          ? isDarkMode
            ? 'bg-[#031d16]/95 border-emerald-950/80 text-emerald-100'
            : 'bg-[#faf8f2]/95 border-[#e8dfcf] text-[#13231c]'
          : isDarkMode
          ? 'bg-[#0b0f19]/95 border-indigo-950/80 text-slate-100'
          : 'bg-[#ffffff]/95 border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home Tab */}
        <button
          onClick={() => {
            haptic.light();
            setCurrentTab('home');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'home'
              ? brand === 'islamic'
                ? 'text-emerald-500 font-bold scale-105'
                : 'text-indigo-500 font-bold scale-105'
              : 'opacity-65 hover:opacity-100'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-none">{t.navHome}</span>
        </button>

        {/* Feed Tab */}
        <button
          onClick={() => {
            haptic.light();
            setCurrentTab('feed');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'feed'
              ? brand === 'islamic'
                ? 'text-emerald-500 font-bold scale-105'
                : 'text-indigo-500 font-bold scale-105'
              : 'opacity-65 hover:opacity-100'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-none">{t.navFeed}</span>
        </button>

        {/* Quick Admin New Post Action (if admin) */}
        {isAdmin && onNewPostClick && (
          <button
            onClick={() => {
              haptic.admin();
              onNewPostClick();
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-w-[50px] min-h-[48px] transition-all cursor-pointer ${
              brand === 'islamic'
                ? 'text-amber-400 active:scale-95'
                : 'text-teal-400 active:scale-95'
            }`}
            title="Create New Post"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-zinc-950 flex items-center justify-center shadow-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">{t.navNewPost}</span>
          </button>
        )}

        {/* Admin Tab (if admin) */}
        {isAdmin && (
          <button
            onClick={() => {
              haptic.admin();
              setCurrentTab('admin');
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
              currentTab === 'admin'
                ? 'text-amber-500 font-bold scale-105'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-none">{t.navAdmin}</span>
          </button>
        )}

        {/* Profile Tab */}
        <button
          onClick={() => {
            haptic.light();
            if (user) {
              setCurrentTab('profile');
            } else {
              openAuthModal();
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'profile'
              ? brand === 'islamic'
                ? 'text-emerald-500 font-bold scale-105'
                : 'text-indigo-500 font-bold scale-105'
              : 'opacity-65 hover:opacity-100'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-none">{user ? t.navProfile : t.navSignIn}</span>
        </button>
      </div>
    </nav>
  );
};
