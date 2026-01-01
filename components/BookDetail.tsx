
import React, { useEffect } from 'react';
import { Book, BookStatus } from '../types';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onClose }) => {
  // Blocca lo scroll del body quando il componente è montato
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
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm sm:backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Container - Full height on mobile, constrained on desktop */}
      <div className="relative bg-white w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-4xl md:max-w-5xl sm:rounded-[2.5rem] rounded-t-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-500 ease-out">
        
        {/* Pulsante Chiusura Universale (Visibile sempre in alto a dx su mobile sopra l'immagine) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* LATO SINISTRO / SUPERIORE: Copertina */}
        <div className="h-[35vh] md:h-auto md:w-[40%] bg-slate-200 relative overflow-hidden flex-shrink-0">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover"
          />
          {/* Sfumatura per migliorare la visibilità degli elementi sopra */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
          
          {/* Handle per scroll mobile (estetico) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/30 rounded-full md:hidden"></div>
        </div>

        {/* LATO DESTRO / INFERIORE: Info */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          
          {/* Header del contenuto */}
          <div className="px-6 pt-6 pb-2 sm:px-10 sm:pt-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyle(book.status)}`}>
                {book.status}
              </span>
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                {new Date(book.createdAt).toLocaleDateString('it-IT')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 font-serif leading-tight tracking-tight mb-1">
              {book.title}
            </h2>
            <p className="text-lg sm:text-xl font-bold text-indigo-600/80 italic">{book.author}</p>
          </div>

          {/* Area testo scrollabile */}
          <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-10 custom-scrollbar overscroll-contain">
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Sinossi</h4>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed text-base md:text-lg font-medium whitespace-pre-wrap">
                    {book.description || 'Nessuna descrizione disponibile per questo titolo.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-50">
                <div className="bg-slate-50/50 p-3 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Archivio</span>
                  <span className="text-[10px] font-bold text-slate-600 truncate block">#{book.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo</span>
                  <span className="text-[10px] font-bold text-slate-600 block">Digitale</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer fisso */}
          <div className="p-6 sm:p-10 border-t border-slate-100 bg-white">
            <button 
              onClick={onClose}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default BookDetail;
