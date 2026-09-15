import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useBrand } from '../../context/BrandContext';
import { useLanguage } from '../../context/LanguageContext';
import { CapsuleButton } from './CapsuleButton';
import { haptic } from '../../lib/haptics';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { isDarkMode } = useBrand();
  const { t, language } = useLanguage();

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <CapsuleButton
        variant="secondary"
        size="sm"
        onClick={() => {
          haptic.light();
          install();
        }}
        icon={<Download className="w-3.5 h-3.5" />}
        aria-label={t.navInstallApp}
      >
        {t.navInstallApp}
      </CapsuleButton>
    );
  }

  if (isIOS) {
    return (
      <>
        <CapsuleButton
          variant="secondary"
          size="sm"
          onClick={() => {
            haptic.light();
            setShowIOSGuide(true);
          }}
          icon={<Download className="w-3.5 h-3.5" />}
          aria-label={t.navInstallApp}
        >
          {language === 'bn' ? 'ইনস্টল' : 'Install'}
        </CapsuleButton>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
              className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl transition-all ${
                isDarkMode ? 'bg-[#0f172a] text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                <h3 className="text-base font-bold">
                  {language === 'bn' ? 'আইফোন / আইপ্যাডে ইনস্টল করুন' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <p>
                    {language === 'bn' ? (
                      <>১. সাফারির নিচে থাকা <strong>Share (শেয়ার)</strong> আইকনে ট্যাপ করুন।</>
                    ) : (
                      <>1. Tap the <strong>Share</strong> icon in the Safari navigation bar at the bottom.</>
                    )}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <p>
                    {language === 'bn' ? (
                      <>২. নিচে স্ক্রল করে <strong>Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</strong> নির্বাচন করুন।</>
                    ) : (
                      <>2. Scroll down and choose <strong>Add to Home Screen</strong>.</>
                    )}
                  </p>
                </div>
              </div>

              <CapsuleButton
                variant="primary"
                size="md"
                onClick={() => {
                  haptic.light();
                  setShowIOSGuide(false);
                }}
                className="w-full mt-5"
              >
                {language === 'bn' ? 'বুঝেছি' : 'Got It'}
              </CapsuleButton>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
