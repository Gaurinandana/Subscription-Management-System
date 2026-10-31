import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#17191c] shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-4 h-4 text-[#5d2a1a] shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#5d2a1a] shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 text-[#17191c] shrink-0 mt-0.5" />,
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-[18px] bg-[#ffffff] border border-[#ececec] text-[#17191c] shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 animate-in slide-in-from-right-4"
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-[#17191c] leading-tight mb-1">{toast.title}</h4>
              <p className="text-xs text-[#777b86] leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#979799] hover:text-[#17191c] transition p-1 -mr-1 -mt-1 rounded-full hover:bg-[#f2f2f3]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
