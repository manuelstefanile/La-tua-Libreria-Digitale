
import React from 'react';
import { Book, BookStatus } from '../types';

interface BookCardProps {
  book: Book;
  onDelete?: (id: string) => void;
  onEdit?: (book: Book) => void;
  showActions?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, onDelete, onEdit, showActions = false }) => {
  const getStatusStyle = (status: BookStatus) => {
    switch (status) {
      case BookStatus.READING: return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case BookStatus.COMPLETED: return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case BookStatus.PUBLISHED: return 'bg-indigo-500/10 text-indigo-600 border-indigo-200';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col h-full overflow-hidden">
      {/* Immagine con Overlay Intelligente */}
      <div className="relative aspect-[3/4] overflow-hidden m-2 rounded-[1.5rem] bg-slate-50">
        <img 
          src={book.coverUrl || `https://picsum.photos/seed/${book.id}/400/600`} 
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        
        {/* Badge di Stato Glassmorphism */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border shadow-sm transition-all duration-300 ${getStatusStyle(book.status)}`}>
            {book.status}
          </span>
        </div>

        {/* Overlay Hover per Info Veloci */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-indigo-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
           <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Aggiunto il</span>
           <span className="text-white text-xs font-medium">{new Date(book.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Contenuto Testuale */}
      <div className="p-6 pt-2 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors duration-300">
            {book.title}
          </h3>
          <p className="text-sm font-semibold text-slate-400 mb-3">{book.author}</p>
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {book.description || 'Nessuna sinossi disponibile per questo titolo.'}
          </p>
        </div>
        
        {/* Sezione Azioni Dinamiche */}
        {showActions && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
            <div className="flex gap-1">
              <button 
                onClick={() => onEdit?.(book)}
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="text-[10px] font-bold uppercase">Modifica</span>
              </button>
            </div>
            
            <button 
              onClick={() => onDelete?.(book.id)}
              className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
              title="Rimuovi dalla libreria"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Accento Colore Hover */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
};

export default BookCard;
