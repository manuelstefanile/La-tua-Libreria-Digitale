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
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<BookStatus>(BookStatus.READING);
  const [coverUrl, setCoverUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    if (editBook) {
      setTitle(editBook.title);
      setAuthor(editBook.author);
      setDescription(editBook.description);
      setStatus(editBook.status);
      setCoverUrl(editBook.coverUrl);
    }
  }, [editBook]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    const bookData: Book = {
      id: editBook ? editBook.id : Math.random().toString(36).substr(2, 9),
      title,
      author,
      description,
      status,
      userId,
      coverUrl: coverUrl || `https://picsum.photos/seed/${title}/400/600`,
      createdAt: editBook ? editBook.createdAt : Date.now()
    };

    if (editBook) onUpdate(bookData);
    else onAdd(bookData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-white w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-5xl rounded-t-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom-full duration-500">
        
        {/* Preview Immagine */}
        <div className="h-[25vh] md:h-auto md:w-[35%] bg-slate-900 relative p-6 flex flex-col items-center justify-center flex-shrink-0">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-[3/4] h-full sm:h-auto sm:w-full max-w-[200px] bg-white/5 rounded-[1.5rem] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group"
          >
            {coverUrl ? (
              <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/40 text-[10px] font-black uppercase tracking-widest text-center px-4">Carica Copertina</span>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
        </div>

        {/* Form Editor */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              {editBook ? 'Modifica Libro' : 'Nuovo Volume'}
            </h2>
            <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:rotate-90 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Titolo</label>
                <input 
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  placeholder="Inserisci titolo..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Autore</label>
                <input 
                  type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  placeholder="Inserisci autore..."
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Sinossi</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Inserisci una breve trama o i tuoi pensieri sul libro..."
              />
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-colors">
                Salva Volume
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default BookForm;