import React from 'react';
import { useBrand } from '../../context/BrandContext';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  id,
  ...props
}) => {
  const { brand, isDarkMode } = useBrand();

  let brandCardStyle = '';

  if (brand === 'islamic') {
    brandCardStyle = isDarkMode
      ? 'bg-[#052b20]/90 border border-emerald-900/60 shadow-lg text-emerald-50'
      : 'bg-[#fffefb] border border-[#e8dfcf] shadow-sm text-[#182921]';
  } else {
    // Mindscope (Psychology)
    brandCardStyle = isDarkMode
      ? 'bg-[#131929]/95 border border-indigo-950/80 shadow-lg text-slate-100'
      : 'bg-white border border-slate-200/80 shadow-sm text-slate-900';
  }

  const interactiveStyle = interactive
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] cursor-pointer'
    : '';

  return (
    <div
      id={id}
      className={`rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden ${brandCardStyle} ${interactiveStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
