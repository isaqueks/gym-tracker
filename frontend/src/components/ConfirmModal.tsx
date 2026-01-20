import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'default';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const confirmButtonStyles = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    default: 'bg-primary-500 hover:bg-primary-600 text-white',
  };

  const iconStyles = {
    danger: 'bg-red-500/20 text-red-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    default: 'bg-primary-500/20 text-primary-400',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-dark-800 rounded-2xl border border-dark-700 shadow-xl animate-scale-in overflow-hidden">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6 pt-8 text-center">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-full ${iconStyles[variant]} flex items-center justify-center mx-auto mb-4`}
          >
            <AlertTriangle size={28} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

          {/* Message */}
          <p className="text-dark-400 text-sm mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl bg-dark-700 text-white font-medium hover:bg-dark-600 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${confirmButtonStyles[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

