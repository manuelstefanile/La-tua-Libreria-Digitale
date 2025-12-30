
import React, { useState, useEffect, useMemo } from 'react';
import { User, Book, BookStatus } from './types';
import { storageService } from './services/storageService';
import AuthForm from './components/AuthForm';
import BookCard from './components/BookCard';
import BookForm from './components/BookForm';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const sessionUser = storageService.getSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
    const storedBooks = storageService.getBooks();
    setBooks(storedBooks);
  }, []);

  const handleLogout = () => {
    storageService.setSession(null);
    setUser(null);
  };

  const addBook = (newBook: Book) => {
    storageService.saveBook(newBook);
    setBooks([...books, newBook]);
    setShowAddForm(false);
  };

  const updateBook = (updatedBook: Book) => {
    storageService.updateBook(updatedBook);
    setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
    setEditingBook(null);
  };

  const deleteBook = (id: string) => {
    if (confirm("Sei sicuro di voler rimuovere questo libro dalla tua libreria?")) {
      storageService.deleteBook(id);
      setBooks(books.filter(b => b.id !== id));
    }
  };

  const startEditing = (book: Book) => {
    setEditingBook(book);
  };

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesUser = filter === 'all' || (filter === 'mine' && book.userId === user?.id);
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesUser && matchesSearch;
    });
  }, [books, filter, user, searchQuery]);

  if (!user) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header Premium */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-3 rounded-[1.2rem] text-white shadow-xl shadow-indigo-100 group-hover:rotate-12 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-black tracking-tighter font-serif hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800">BiblioTech</h1>
            </div>

            <div className="flex-1 max-w-xl mx-10 hidden lg:block">
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Titolo, autore o genere..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-14 pr-6 py-4 border-none rounded-[1.5rem] bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 leading-none mb-1">{user.username}</span>
                <span className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.2em]">Curatore</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 p-0.5 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center">
                 <img src={`https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&bold=true`} alt="Avatar" className="rounded-[0.8rem]" />
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 active:scale-90"
                title="Spegni la luce"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section & Filters */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-black text-slate-900 font-serif leading-[1.1] mb-4">
              Ogni libro è un <span className="text-indigo-600 italic">nuovo mondo</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Esplora la tua collezione curata con cura o aggiungi nuovi capitoli alla tua storia.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 flex gap-1 shadow-sm w-full sm:w-auto">
              <button 
                onClick={() => setFilter('all')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.1em] transition-all duration-500 ${filter === 'all' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-y-[-2px]' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Tutta la Rete
              </button>
              <button 
                onClick={() => setFilter('mine')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.1em] transition-all duration-500 ${filter === 'mine' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-y-[-2px]' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                I Miei Volumi
              </button>
            </div>
            
            <button 
              onClick={() => setShowAddForm(true)}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all duration-500 shadow-2xl shadow-slate-200 hover:shadow-indigo-200 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Aggiungi Ora
            </button>
          </div>
        </div>

        {/* Dynamic Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredBooks.map((book, index) => (
              <div key={book.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
                <BookCard 
                  book={book} 
                  onDelete={deleteBook}
                  onEdit={startEditing}
                  showActions={book.userId === user.id}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 px-8">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full scale-[2] animate-pulse"></div>
              <div className="relative bg-white p-12 rounded-full shadow-2xl border border-slate-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Ancora Nessuna Storia</h3>
            <p className="text-lg text-slate-400 max-w-md mt-4 font-medium leading-relaxed">
              La tua libreria aspetta il suo primo protagonista. Inizia il tuo viaggio letterario aggiungendo un nuovo titolo.
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="mt-10 bg-indigo-50 text-indigo-700 px-12 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all duration-500 border-2 border-indigo-100 shadow-xl shadow-indigo-50/50"
            >
              Inizia la Collezione
            </button>
          </div>
        )}
      </main>

      {/* Minimalistic Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
           <div className="flex items-center gap-3 mb-8 opacity-40 grayscale">
              <div className="bg-slate-900 p-2 rounded-xl text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.993 7.993 0 001 12h18a7.993 7.993 0 00-8-7.196L9 4.804z" />
                </svg>
              </div>
              <span className="font-serif font-black text-xl text-slate-800 tracking-tighter">BiblioTech</span>
           </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-8">
             <a href="#" className="text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors">Visione</a>
             <a href="#" className="text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors">Privacy</a>
             <a href="#" className="text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors">Codice</a>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">© 2024 BiblioTech. Progettato per l'Eternità.</p>
        </div>
      </footer>

      {/* Modals con Animazione */}
      {(showAddForm || editingBook) && (
        <BookForm 
          userId={user.id} 
          onAdd={addBook} 
          onUpdate={updateBook}
          onClose={() => {
            setShowAddForm(false);
            setEditingBook(null);
          }} 
          editBook={editingBook}
        />
      )}
    </div>
  );
};

export default App;
