
import React, { useState, useEffect, useRef } from 'react';
import { BookStatus, Book } from '../types';

interface BookFormProps {
  userId: string;
  onAdd: (book: Book) => void;
  onUpdate: (book: Book) => void;
  onClose: () => void;
  editBook?: Book | null;
}

const BookForm: React.FC<BookFormProps> = ({ userId, onAdd, onUpdate, onClose, editBook }) => {
  const [title, setTitle] = useState(editBook?.title || '');
  const [author, setAuthor] = useState(editBook?.author || '');
  const [description, setDescription] = useState(editBook?.description || '');
  const [status, setStatus] = useState<BookStatus>(editBook?.status || BookStatus.READING);
  const [coverUrl, setCoverUrl] = useState(editBook?.coverUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'immagine è troppo grande. Massimo 5MB.");
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert("Errore nel caricamento dell'immagine.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bookData: Book = {
      id: editBook ? editBook.id : Math.random().toString(36).substr(2, 9),
      title, author, description, status, userId,
      coverUrl: coverUrl || `https://picsum.photos/seed/${title}/400/600`,
      createdAt: editBook ? editBook.createdAt : Date.now()
    };
    if (editBook) onUpdate(bookData);
    else onAdd(bookData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl rounded-none sm:rounded-[3.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col md:flex-row">
        
        {/* Sezione Caricamento Immagine - Ottimizzata Mobile */}
        <div className="md:w-[40%] bg-slate-900 p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
          
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative aspect-[3/4] w-full max-w-[140px] sm:max-w-[240px] bg-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-dashed ${isUploading ? 'border-indigo-500 animate-pulse' : 'border-white/20'} flex items-center justify-center cursor-pointer overflow-hidden group hover:border-indigo-500/50 transition-all z-10 shadow-2xl`}
          >
            {coverUrl ? (
              <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-white/20 mx-auto mb-2 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 block">
                  {isUploading ? 'Elaborazione...' : 'Carica Copertina'}
                </span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
          <p className="mt-4 sm:mt-8 text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] z-10 hidden sm:block">Salvataggio su Cloud/Locale</p>
        </div>

        {/* Form Dati */}
        <div className="flex-1 p-8 sm:p-14 overflow-y-auto bg-white flex flex-col">
          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif tracking-tighter">
              {editBook ? 'Aggiorna Opera' : 'Nuovo Ingresso'}
            </h2>
            <button onClick={onClose} className="p-2 sm:p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl sm:rounded-2xl transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 flex-1">
            <div className="space-y-4 sm:space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 group-focus-within:text-indigo-600 transition-colors">Titolo Opera</label>
                <input 
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-[1.2rem] px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="Esempio: Il Nome della Rosa"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 group-focus-within:text-indigo-600 transition-colors">Autore</label>
                <input 
                  type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-[1.2rem] px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="Umberto Eco"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3">Stato Lettura</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                   {Object.values(BookStatus).map(s => (
                     <button 
                       key={s} type="button" onClick={() => setStatus(s)}
                       className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border ${status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                     >
                       {s}
                     </button>
                   ))}
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 group-focus-within:text-indigo-600 transition-colors">Sinossi</label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                  className="w-full bg-slate-50 border-none rounded-[1.2rem] px-6 py-4 font-medium text-slate-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                  placeholder="Descrivi brevemente l'opera..."
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[1.8rem] font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 active:scale-95 transition-all mt-4 sm:mt-6 mb-4 md:mb-0">
              Salva Opera
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookForm;
