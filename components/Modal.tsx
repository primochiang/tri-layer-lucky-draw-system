import React from 'react';
import { X, AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, type, title, message, onConfirm, onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={type === 'alert' ? onClose : undefined} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in border border-slate-200 overflow-hidden">
        {/* Decorative background element */}
        <div className={`absolute top-0 left-0 w-full h-1 ${type === 'alert' ? 'bg-amber-500' : 'bg-red-500'}`} />

        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-3 rounded-full ${type === 'alert' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
            {type === 'alert' ? <Info className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-3">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors text-sm"
            >
              取消
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-6 py-2 rounded-lg text-white font-bold shadow-lg transition-transform active:scale-95 text-sm flex items-center ${
              type === 'alert' 
                ? 'bg-amber-500 hover:bg-amber-600' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {type === 'confirm' ? '確定執行' : '知道了'}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};