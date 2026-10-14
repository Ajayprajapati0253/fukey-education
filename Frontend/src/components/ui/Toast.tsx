import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function Toast({ show, message, type = 'success', onClose }: ToastProps) {
  if (!show) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30',
    error: 'bg-rose-600 text-white shadow-lg shadow-rose-600/30',
    info: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-white shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-white shrink-0" />,
    info: <Info className="w-5 h-5 text-white shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl transition-all transform animate-in slide-in-from-bottom duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${bgStyles[type]}`}>
        {icons[type]}
        <span className="text-sm font-semibold">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 p-1 rounded-md hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
