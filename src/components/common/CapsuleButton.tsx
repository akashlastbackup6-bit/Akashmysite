import React from 'react';
import { useBrand } from '../../context/BrandContext';

interface CapsuleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const CapsuleButton: React.FC<CapsuleButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const { brand, isDarkMode } = useBrand();

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs font-medium gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-sm font-semibold gap-2 min-h-[44px]', // Mobile 44px min touch target
    lg: 'px-6 py-3 text-base font-bold gap-2.5 min-h-[48px]',
  };

  // Dual-brand responsive color maps
  let variantClasses = '';

  if (variant === 'primary') {
    if (brand === 'islamic') {
      variantClasses = isDarkMode
        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md hover:from-emerald-500 hover:to-teal-600 border border-emerald-500/30'
        : 'bg-emerald-800 text-white shadow-md hover:bg-emerald-900 border border-emerald-700/50';
    } else {
      // Mindscope (Psychology)
      variantClasses = isDarkMode
        ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-md hover:from-indigo-500 hover:to-teal-500 border border-indigo-500/30'
        : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md hover:from-indigo-700 hover:to-indigo-800 border border-indigo-500/30';
    }
  } else if (variant === 'secondary') {
    if (brand === 'islamic') {
      variantClasses = isDarkMode
        ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60 hover:bg-emerald-900/50'
        : 'bg-emerald-100/70 text-emerald-900 border border-emerald-300/80 hover:bg-emerald-200/60';
    } else {
      variantClasses = isDarkMode
        ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-800/60 hover:bg-indigo-900/50'
        : 'bg-indigo-100/70 text-indigo-950 border border-indigo-300/80 hover:bg-indigo-200/60';
    }
  } else if (variant === 'ghost') {
    if (brand === 'islamic') {
      variantClasses = isDarkMode
        ? 'text-emerald-300 hover:bg-emerald-950/60'
        : 'text-emerald-900 hover:bg-emerald-100/60';
    } else {
      variantClasses = isDarkMode
        ? 'text-indigo-300 hover:bg-indigo-950/60'
        : 'text-indigo-900 hover:bg-indigo-100/60';
    }
  } else if (variant === 'danger') {
    variantClasses = isDarkMode
      ? 'bg-rose-900/80 text-rose-100 border border-rose-700/50 hover:bg-rose-800'
      : 'bg-rose-600 text-white shadow-sm hover:bg-rose-700';
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`rounded-full inline-flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed active:scale-100' : ''
      } ${sizeClasses[size]} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
