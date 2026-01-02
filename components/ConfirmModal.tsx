
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  isDestructive = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
        onClick={onCancel}
      ></div>
      
      <div className="relative bg-white w-full max-w-md rounded-[3.5rem] p-10 sm:p-12 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.25)] border border-white animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <div className={`w-20 h-20 ${isDestructive ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'} rounded-[2rem] flex items-center justify-center mx-auto mb-8`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-3xl font-black text-slate-950 font-serif mb-4 leading-tight">{title}</h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">{message}</p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              className={`w-full ${isDestructive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-900 hover:bg-indigo-700'} text-white py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95`}
            >
              {confirmLabel}
            </button>
            <button 
              onClick={onCancel}
              className="w-full bg-slate-50 text-slate-400 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
