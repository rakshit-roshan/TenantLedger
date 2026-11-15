import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-[12px] border shadow-float bg-surface animate-in slide-in-from-bottom-2 duration-200 ${
              isSuccess
                ? 'border-[#5F7A3E] text-[#3E5525]'
                : isError
                ? 'border-[#9C2F2A] text-[#7D1E1A]'
                : 'border-line text-ink'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isSuccess && <CheckCircle2 size={18} className="text-[#5F7A3E]" />}
              {isError && <AlertCircle size={18} className="text-[#9C2F2A]" />}
              {!isSuccess && !isError && <Info size={18} className="text-terracotta" />}
            </div>
            <div className="text-xs sm:text-sm font-medium flex-1 text-ink leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-muted-text hover:text-ink p-1 -mr-1 -mt-1"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

