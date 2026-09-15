import React from 'react';
import { useBrand } from '../../context/BrandContext';

interface SkeletonLoaderProps {
  type?: 'card' | 'post-detail' | 'text-lines';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
}) => {
  const { isDarkMode, brand } = useBrand();

  const shimmerBase = isDarkMode
    ? brand === 'islamic'
      ? 'bg-emerald-950/40'
      : 'bg-slate-800/50'
    : brand === 'islamic'
    ? 'bg-emerald-100/60'
    : 'bg-slate-200/70';

  const pulseClass = 'animate-pulse rounded-xl ' + shimmerBase;

  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          {type === 'card' && (
            <div className={`p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-black/5 dark:border-white/5 space-y-3.5 ${isDarkMode ? 'bg-black/20' : 'bg-white/60'}`}>
              <div className={`w-full h-44 sm:h-52 ${pulseClass} rounded-2xl`} />
              <div className="space-y-2 pt-1">
                <div className={`w-1/4 h-4 ${pulseClass}`} />
                <div className={`w-3/4 h-6 ${pulseClass}`} />
                <div className={`w-full h-4 ${pulseClass}`} />
                <div className={`w-5/6 h-4 ${pulseClass}`} />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full ${pulseClass}`} />
                  <div className={`w-24 h-3.5 ${pulseClass}`} />
                </div>
                <div className={`w-16 h-3.5 ${pulseClass}`} />
              </div>
            </div>
          )}

          {type === 'post-detail' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className={`w-full h-60 sm:h-80 ${pulseClass} rounded-2xl sm:rounded-3xl`} />
              <div className={`w-1/3 h-4 ${pulseClass}`} />
              <div className={`w-5/6 h-8 ${pulseClass}`} />
              <div className="space-y-2 pt-3">
                <div className={`w-full h-4 ${pulseClass}`} />
                <div className={`w-full h-4 ${pulseClass}`} />
                <div className={`w-4/5 h-4 ${pulseClass}`} />
                <div className={`w-full h-4 ${pulseClass}`} />
              </div>
            </div>
          )}

          {type === 'text-lines' && (
            <div className="space-y-2.5">
              <div className={`w-full h-4 ${pulseClass}`} />
              <div className={`w-5/6 h-4 ${pulseClass}`} />
              <div className={`w-4/6 h-4 ${pulseClass}`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
