
import React, { useEffect } from 'react';
import { Book, BookStatus } from '../types';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onClose }) => {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const getStatusStyle = (status: BookStatus) => {
    switch (status) {
      case BookStatus.READING: return 'bg-blue-600 text-white';
      case BookStatus.COMPLETED: return 'bg-emerald-600 text-white';
      case BookStatus.PUBLISHED: return 'bg-indigo-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-in fade-in duration-300 p-0 sm:p-4 overscroll-none">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* h-[92dvh] garantisce che il modale si adatti perfettamente allo schermo mobile dinamico */}
      <div className="relative bg-white w-full h-[92dvh] sm:h-auto sm:max-h-[85dvh] sm:max-w-4xl rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-500 ease-out">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] p-3 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-all active:scale-90 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="h-[30dvh] sm:h-auto md:w-[38%] bg-slate-200 relative flex-shrink-0">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden"></div>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/40 rounded-full md:hidden"></div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="px-6 pt-6 pb-2 sm:px-10 sm:pt-10 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${getStatusStyle(book.status)}`}>
                  {book.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-4xl font-black text-slate-900 font-serif leading-tight">
                {book.title}
              </h2>
              <p className="text-base font-bold text-indigo-600/80 italic">{book.author}</p>
            </div>
            
            <button 
              onClick={onClose}
              className="hidden md:flex p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-10 custom-scrollbar overscroll-contain">
            <div className="prose prose-slate max-w-none">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-4">Sinossi</h4>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-lg font-medium">
                {book.description || 'Nessun dettaglio aggiuntivo disponibile.'}
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white sm:hidden mb-[env(safe-area-inset-bottom)]">
            <button 
              onClick={onClose}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default BookDetail;
