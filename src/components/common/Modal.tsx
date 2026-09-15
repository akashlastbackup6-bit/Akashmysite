import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  id,
}) => {
  const { isDarkMode, brand } = useBrand();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Performance Glass-Blur Backdrop reserved specifically for modals */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-200"
      />

      {/* Modal Card content */}
      <div
        className={`relative w-full ${maxWidthClass} rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col transition-all transform animate-in fade-in slide-in-from-bottom-6 duration-200 ${
          isDarkMode
            ? brand === 'islamic'
              ? 'bg-[#04241b] text-emerald-50 border border-emerald-800/60'
              : 'bg-[#111625] text-slate-100 border border-indigo-900/60'
            : brand === 'islamic'
            ? 'bg-[#fefdfa] text-[#1c2d25] border border-[#e5dccb]'
            : 'bg-white text-slate-900 border border-slate-200'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/10 dark:border-white/10 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto mt-4 py-1 pr-1 flex-1">{children}</div>
      </div>
    </div>
  );
};
