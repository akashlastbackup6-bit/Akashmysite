import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandId, BrandConfig } from '../types';
import { BRANDS, DEFAULT_BRAND } from '../lib/brands';
import { getSessionUser, saveUserProfile } from '../lib/firebase';

interface BrandContextType {
  brand: BrandId;
  brandConfig: BrandConfig;
  setBrand: (brand: BrandId) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const LOCAL_STORAGE_BRAND_KEY = 'akash_brand_preference';
const LOCAL_STORAGE_DARK_KEY = 'akash_dark_mode';

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Brand state initialization: check user profile, then localStorage, then default
  const [brand, setBrandState] = useState<BrandId>(() => {
    const user = getSessionUser();
    if (user?.brandPreference) return user.brandPreference;
    const stored = localStorage.getItem(LOCAL_STORAGE_BRAND_KEY) as BrandId | null;
    if (stored && (stored === 'islamic' || stored === 'psychology')) return stored;
    return DEFAULT_BRAND;
  });

  // Dark mode initialization: check localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_DARK_KEY);
    if (stored !== null) return stored === 'true';
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Update brand
  const setBrand = async (newBrand: BrandId) => {
    setBrandState(newBrand);
    localStorage.setItem(LOCAL_STORAGE_BRAND_KEY, newBrand);

    // If user is logged in, sync to Firestore / local user profile
    const user = getSessionUser();
    if (user && user.brandPreference !== newBrand) {
      try {
        await saveUserProfile({ ...user, brandPreference: newBrand });
      } catch (err) {
        console.warn('Could not sync brand preference to user document:', err);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem(LOCAL_STORAGE_DARK_KEY, String(next));
      return next;
    });
  };

  // Sync class on document root for Tailwind dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Update theme meta color for mobile status bar
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (brand === 'islamic') {
        metaThemeColor.setAttribute('content', isDarkMode ? '#03231a' : '#064e3b');
      } else {
        metaThemeColor.setAttribute('content', isDarkMode ? '#0f172a' : '#312e81');
      }
    }
  }, [brand, isDarkMode]);

  const brandConfig = BRANDS[brand];

  return (
    <BrandContext.Provider value={{ brand, brandConfig, setBrand, isDarkMode, toggleDarkMode }}>
      <div
        className={`min-h-screen transition-colors duration-200 ${
          brand === 'islamic'
            ? isDarkMode
              ? 'bg-[#031d16] text-[#e6f4ea] font-sans selection:bg-emerald-800'
              : 'bg-[#faf8f2] text-[#1c2d25] font-sans selection:bg-emerald-200'
            : isDarkMode
            ? 'bg-[#0b0f19] text-[#e2e8f0] font-outfit selection:bg-indigo-800'
            : 'bg-[#f8fafc] text-[#0f172a] font-outfit selection:bg-indigo-200'
        }`}
        style={{
          fontFamily:
            brand === 'islamic'
              ? "'Plus Jakarta Sans', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif"
              : "'Outfit', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
        }}
      >
        {children}
      </div>
    </BrandContext.Provider>
  );
};

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
}
