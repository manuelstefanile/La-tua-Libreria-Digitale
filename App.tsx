
import React, { useState, useEffect, useMemo } from 'react';
import { User, Book, BookStatus } from './types';
import { storageService } from './services/storageService';
import AuthForm from './components/AuthForm';
import BookCard from './components/BookCard';
import BookForm from './components/BookForm';
import BookDetail from './components/BookDetail';

type SortField = 'title' | 'author' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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
    if (selectedBook?.id === updatedBook.id) setSelectedBook(updatedBook);
  };

  const deleteBook = (id: string) => {
    if (confirm("Sei sicuro di voler rimuovere questo libro dalla tua libreria?")) {
      storageService.deleteBook(id);
      setBooks(books.filter(b => b.id !== id));
      if (selectedBook?.id === id) setSelectedBook(null);
    }
  };

  const startEditing = (book: Book) => {
    setEditingBook(book);
  };

  const processedBooks = useMemo(() => {
    let result = books.filter(book => {
      const matchesUser = filter === 'all' || (filter === 'mine' && book.userId === user?.id);
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesUser && matchesSearch;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = a.createdAt - b.createdAt;
      } else {
        comparison = a[sortBy].localeCompare(b[sortBy], 'it', { sensitivity: 'base' });
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [books, filter, user, searchQuery, sortBy, sortOrder]);

  if (!user) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen-dynamic bg-[#fcfdfe] flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Header Premium - Compatto su Mobile */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-24">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 sm:p-3 rounded-xl sm:rounded-[1.2rem] text-white shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tighter font-serif block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800">BiblioTech</h1>
            </div>

            <div className="flex-1 max-w-xl mx-4 sm:mx-10 hidden md:block">
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Cerca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-14 pr-6 py-3 border-none rounded-2xl bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 leading-none mb-1">{user.username}</span>
                <span className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.2em]">Curatore</span>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-indigo-50 p-0.5 border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                 <img src={`https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&bold=true`} alt="Avatar" className="rounded-lg sm:rounded-[0.8rem]" />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 sm:p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-8 mb-10 sm:mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-serif leading-tight mb-3">
              Ogni libro è un <span className="text-indigo-600 italic">nuovo mondo</span>
            </h2>
            <p className="text-sm sm:text-lg text-slate-500 font-medium leading-relaxed">
              Esplora la tua collezione curata o aggiungi nuovi capitoli alla tua storia.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-3 w-full justify-start sm:justify-center lg:justify-end">
              <div className="bg-white p-1 rounded-2xl border border-slate-100 flex gap-0.5 shadow-sm">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  Tutti
                </button>
                <button 
                  onClick={() => setFilter('mine')}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${filter === 'mine' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  Miei
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className="bg-transparent text-[9px] font-black uppercase tracking-widest text-slate-600 outline-none px-3 py-1.5 cursor-pointer"
                >
                  <option value="createdAt">Data</option>
                  <option value="title">Titolo</option>
                  <option value="author">Autore</option>
                </select>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <button 
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95"
              >
                Nuovo Libro
              </button>
            </div>
          </div>
        </div>

        {processedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
            {processedBooks.map((book, index) => (
              <div key={book.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
                <BookCard 
                  book={book} 
                  onDelete={deleteBook}
                  onEdit={startEditing}
                  onSelect={setSelectedBook}
                  showActions={book.userId === user.id}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 sm:py-40 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-slate-100 px-8">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Ancora Nessuna Storia</h3>
            <p className="text-sm sm:text-lg text-slate-400 max-w-md mt-4 font-medium leading-relaxed">
              La tua libreria aspetta il suo primo protagonista.
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="mt-8 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
            >
              Inizia la Collezione
            </button>
          </div>
        )}
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-10 sm:py-16 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] text-center">© 2025 BiblioTech. Progettato per l'Eternità.</p>
        </div>
      </footer>

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

      {selectedBook && (
        <BookDetail 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
        />
      )}
    </div>
  );
};

export default App;
