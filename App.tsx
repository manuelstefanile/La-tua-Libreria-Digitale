
import React, { useState, useMemo, useEffect } from 'react';
import { User, Book } from './types';
import AuthForm from './components/AuthForm';
import BookCard from './components/BookCard';
import BookForm from './components/BookForm';
import BookDetail from './components/BookDetail';
import { storageService } from './services/storageService';

type SortField = 'title' | 'author' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type ConnectionStatus = 'checking' | 'online' | 'offline';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [serverStatus, setServerStatus] = useState<ConnectionStatus>('checking');
  
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const verifyConnection = async () => {
      const health = await storageService.checkHealth();
      setServerStatus(health?.status === 'ok' ? 'online' : 'offline');
    };
    verifyConnection();
    const interval = setInterval(verifyConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) loadBooks();
  }, [user]);

  const loadBooks = async () => {
    setIsLoading(true);
    const data = await storageService.getBooks();
    setBooks(data);
    setIsLoading(false);
  };

  const deleteBook = async (id: string) => {
    if (confirm("Eliminare definitivamente questo libro?")) {
      const success = await storageService.deleteBook(id);
      if (success) {
        setBooks(prev => prev.filter(b => b.id !== id));
        if (selectedBook?.id === id) setSelectedBook(null);
      }
    }
  };

  const processedBooks = useMemo(() => {
    let result = books.filter(book => {
      const matchesUser = filter === 'all' || (filter === 'mine' && book.userId === user?.id);
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesUser && matchesSearch;
    });

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'createdAt') comp = Number(a.createdAt) - Number(b.createdAt);
      else comp = a[sortBy].localeCompare(b[sortBy], 'it');
      return sortOrder === 'asc' ? comp : -comp;
    });
    return result;
  }, [books, filter, user, searchQuery, sortBy, sortOrder]);

  if (!user) return <AuthForm onAuthSuccess={setUser} />;

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header Premium */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 sm:h-24 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black font-serif tracking-tighter text-slate-900">BiblioTech</h1>
              <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                   {serverStatus === 'online' ? 'Cloud Database' : 'Modalità Locale'}
                 </span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-10 hidden md:block">
            <div className="relative">
              <input 
                type="text" placeholder="Cerca tra i tuoi tesori..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Benvenuto</p>
              <p className="text-sm font-bold text-slate-900">{user.username}</p>
            </div>
            <button 
              onClick={() => setUser(null)}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full animate-in fade-in duration-1000">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-5xl sm:text-7xl font-black text-slate-900 font-serif leading-none tracking-tighter mb-6">
              Il tuo <span className="text-indigo-600">Universo</span> Letterario
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Esplora, gestisci e arricchisci la tua collezione personale. Ogni libro è una porta aperta verso mondi inesplorati.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
             <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
                <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Tutti</button>
                <button onClick={() => setFilter('mine')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'mine' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Miei</button>
             </div>
             
             <button 
                onClick={() => setShowAddForm(true)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-slate-900 active:scale-95 transition-all"
             >
               Nuovo Volume
             </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Sincronizzazione in corso...</p>
          </div>
        ) : processedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {processedBooks.map((book, idx) => (
              <div key={book.id} className="animate-in fade-in slide-in-from-bottom-10 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                <BookCard 
                  book={book} 
                  onDelete={deleteBook} 
                  onEdit={setEditingBook} 
                  onSelect={setSelectedBook} 
                  showActions={book.userId === user.id} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[4rem] p-20 text-center border-2 border-dashed border-slate-100">
            <h3 className="text-4xl font-black text-slate-900 font-serif mb-4">Lo scaffale è vuoto</h3>
            <p className="text-slate-400 text-lg mb-10 max-w-sm mx-auto">È arrivato il momento di aggiungere il tuo primo capolavoro alla libreria.</p>
            <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all">Aggiungi ora</button>
          </div>
        )}
      </main>

      {(showAddForm || editingBook) && (
        <BookForm 
          userId={user.id} 
          onAdd={async (b) => { await storageService.saveBook(b); loadBooks(); setShowAddForm(false); }} 
          onUpdate={async (b) => { await storageService.updateBook(b); loadBooks(); setEditingBook(null); }} 
          onClose={() => { setShowAddForm(false); setEditingBook(null); }} 
          editBook={editingBook} 
        />
      )}

      {selectedBook && <BookDetail book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  );
};

export default App;
