import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-surface w-full sm:rounded-[16px] border border-line ${maxWidthClasses[maxWidth]} max-h-[92vh] flex flex-col shadow-float rounded-t-[24px] sm:rounded-b-[16px] animate-in slide-in-from-bottom duration-200`}
      >
        {/* Grab handle for bottom sheet on mobile screens */}
        <div className="sm:hidden block pt-3">
          <div className="w-[44px] h-[4px] bg-[#C8B28C] rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-line/40">
          <div>
            <h3 className="font-serif text-[22px] sm:text-[24px] text-ink leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-text mt-1">{subtitle}</p>
            )}
            <div className="h-[3px] border-b-[3px] border-double border-line w-full mt-2" />
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted-text hover:text-ink rounded-full hover:bg-ground transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

