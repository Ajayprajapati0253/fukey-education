import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  footer,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1E293B] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`flex justify-between pb-4 border-b border-[#e2e8f0] dark:border-[#334155] mb-4 ${
            subtitle ? 'items-start' : 'items-center'
          }`}
        >
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h3 className="text-lg font-semibold text-[#0f172a] dark:text-gray-100">{title}</h3>
            ) : (
              <div className="text-lg font-semibold text-[#0f172a] dark:text-gray-100">{title}</div>
            )}
            {subtitle && (
              <p className="text-xs text-[#686E7D] dark:text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0f172a] dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
        {footer && (
          <div className="mt-5 pt-4 border-t border-[#e2e8f0] dark:border-[#334155] flex flex-wrap items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;