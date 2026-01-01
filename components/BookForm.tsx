
import React, { useState, useEffect, useRef } from 'react';
import { BookStatus, Book } from '../types';
import { geminiService } from '../services/geminiService';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Blocca lo scroll del body
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

  const handleGenerateDescription = async () => {
    if (!title || !author) {
      alert("Definisci prima il titolo e l'autore per permettere all'IA di analizzare l'opera.");
      return;
    }
    setIsGenerating(true);
    const desc = await geminiService.generateDescription(title, author);
    setDescription(desc);
    setIsGenerating(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ops! L'immagine è troppo pesante (max 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 z-50">
      <div className="bg-white rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 ease-out">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          
          {/* SEZIONE SINISTRA: Preview Creativa */}
          <div className="md:w-[40%] bg-slate-900 relative p-8 flex flex-col items-center justify-center border-r border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20 opacity-50"></div>
            
            <div className="relative z-10 w-full max-w-[280px]">
              <label className="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">Visual Design</label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative aspect-[3/4] w-full bg-white/5 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:border-indigo-400/50 hover:bg-white/[0.08] shadow-2xl ${coverUrl ? 'border-none' : ''}`}
              >
                {coverUrl ? (
                  <>
                    <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                      <div className="bg-white text-slate-950 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-xl">Cambia Immagine</div>
                      <button 
                        onClick={removeImage}
                        className="text-white/60 hover:text-red-400 text-[10px] font-bold uppercase underline"
                      >
                        Rimuovi
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center px-8">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-white/10 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-white text-sm font-bold">Aggiungi Copertina</p>
                    <p className="text-white/30 text-[10px] mt-2 leading-relaxed">Personalizza l'aspetto del tuo libro per renderlo unico nella libreria.</p>
                  </div>
                )}
              </div>
              
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          {/* SEZIONE DESTRA: Editor Metadati */}
          <div className="md:w-[60%] bg-white p-8 sm:p-12 overflow-y-auto flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Editor Studio</span>
                <h2 className="text-4xl font-black text-slate-900 font-serif leading-none tracking-tighter">
                  {editBook ? 'Modifica Opera' : 'Nuova Storia'}
                </h2>
              </div>
              <button onClick={onClose} className="p-4 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-indigo-600 transition-colors">Titolo del Volume</label>
                  <input 
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-0 py-2 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-bold text-xl text-slate-800 placeholder:text-slate-200"
                    placeholder="E.g. Siddharta"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-indigo-600 transition-colors">Autore / Scrittore</label>
                  <input 
                    type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-0 py-2 border-b-2 border-slate-100 focus:border-indigo-600 bg-transparent outline-none transition-all font-bold text-xl text-slate-800 placeholder:text-slate-200"
                    placeholder="E.g. Hermann Hesse"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Stato della Lettura</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(BookStatus).map(s => (
                    <button
                      key={s} type="button" onClick={() => setStatus(s as BookStatus)}
                      className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border-2 ${status === s ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinossi dell'Opera</label>
                  <button 
                    type="button" onClick={handleGenerateDescription} disabled={isGenerating}
                    className="relative overflow-hidden group/ai px-4 py-2 rounded-xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient group-hover/ai:scale-110 transition-transform duration-500"></div>
                    <span className="relative z-10 flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-tighter">
                      {isGenerating ? "..." : "Scrivi con l'IA"}
                    </span>
                  </button>
                </div>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                  className="w-full px-6 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-sm leading-relaxed text-slate-600 font-medium placeholder:text-slate-300"
                />
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 hover:bg-indigo-600">
                  {editBook ? 'Aggiorna Edizione' : 'Pubblica in Libreria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookForm;
