
import React, { useState, useMemo, useEffect } from 'react';
import { User, Book, BookStatus } from './types';
import AuthForm from './components/AuthForm';
import BookCard from './components/BookCard';
import BookForm from './components/BookForm';
import BookDetail from './components/BookDetail';
import Profile from './components/Profile';
import ConfirmModal from './components/ConfirmModal';
import { storageService } from './services/storageService';

type SortField = 'title' | 'author' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type ConnectionStatus = 'checking' | 'online' | 'offline';
type View = 'library' | 'profile';

const SkeletonCard = () => (
  <div className="bg-white rounded-[3rem] p-4 border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
    <div className="relative aspect-[4/5.5] rounded-[2.5rem] bg-slate-100 mb-6 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
    </div>
    <div className="px-5 pb-6 space-y-4">
      <div className="h-6 bg-slate-100 rounded-full w-3/4"></div>
      <div className="h-3 bg-slate-50 rounded-full w-1/2"></div>
      <div className="space-y-2 mt-4">
        <div className="h-2.5 bg-slate-50 rounded-full w-full"></div>
        <div className="h-2.5 bg-slate-50 rounded-full w-5/6"></div>
        <div className="h-2.5 bg-slate-50 rounded-full w-2/3"></div>
      </div>
    </div>
  </div>
);

const GlobalLoader = ({ message }: { message: string }) => (
  <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white/90 backdrop-blur-2xl p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.15)] border border-white/50 flex flex-col items-center max-w-xs w-full">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-indigo-700 rounded-[2rem] shadow-2xl shadow-indigo-200 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="absolute -inset-4 border-4 border-indigo-700/10 border-t-indigo-700 rounded-full animate-spin"></div>
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 text-center">{message}</p>
      <div className="flex gap-1 mt-4">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"></div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [serverStatus, setServerStatus] = useState<ConnectionStatus>('checking');
  const [currentView, setCurrentView] = useState<View>('library');
  
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

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    const id = bookToDelete.id;
    setBookToDelete(null);
    setIsActionLoading("Rimozione Opera...");
    const success = await storageService.deleteBook(id);
    if (success) {
      setBooks(prev => prev.filter(b => b.id !== id));
      if (selectedBook?.id === id) setSelectedBook(null);
    }
    setIsActionLoading(null);
  };

  const processedBooks = useMemo(() => {
    let result = books.filter(book => {
      const matchesUser = filter === 'all' || (filter === 'mine' && book.userId === user?.id);
      const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesUser && matchesStatus && matchesSearch;
    });

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'createdAt') {
        comp = Number(a.createdAt) - Number(b.createdAt);
      } else {
        comp = a[sortBy].localeCompare(b[sortBy], 'it');
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
    return result;
  }, [books, filter, statusFilter, user, searchQuery, sortBy, sortOrder]);

  if (!user) return <AuthForm onAuthSuccess={setUser} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {isActionLoading && <GlobalLoader message={isActionLoading} />}
      
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 sm:h-24 flex justify-between items-center">
          <div className="flex items-center gap-5 cursor-pointer" onClick={() => setCurrentView('library')}>
            <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black font-serif tracking-tighter text-slate-900">MyBiblio</h1>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                   {serverStatus === 'online' ? 'Cloud Connected' : 'Local Storage'}
                 </span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-10 hidden md:block">
            {currentView === 'library' && (
              <div className="relative group">
                <input 
                  type="text" placeholder="Cerca nella tua biblioteca..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100/70 border border-transparent rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-700/5 focus:bg-white focus:border-indigo-100 transition-all outline-none"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-700 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setCurrentView('profile')}
              className={`flex items-center gap-3 p-1.5 sm:p-2 pr-3 sm:pr-4 rounded-2xl transition-all border ${currentView === 'profile' ? 'bg-indigo-50 border-indigo-100' : 'bg-transparent border-transparent hover:bg-slate-50'}`}
            >
              <div className="w-10 h-10 bg-indigo-700 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-100">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Profilo</p>
                <p className="text-sm font-bold text-slate-900 line-clamp-1">{user.username}</p>
              </div>
            </button>
            <button 
              onClick={() => setUser(null)}
              className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
              title="Esci"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 pt-36 pb-20 w-full animate-in fade-in duration-1000">
        {currentView === 'profile' ? (
          <Profile 
            user={user} 
            books={books} 
            onUpdateUser={setUser} 
            onLogout={() => setUser(null)}
            onBack={() => setCurrentView('library')}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
              <div className="max-w-2xl">
                <h2 className="text-6xl sm:text-8xl font-black text-slate-950 font-serif leading-none tracking-tighter mb-8">
                  Il tuo <span className="text-indigo-700">Archivio</span> Personale
                </h2>
                <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-xl">
                  Ogni libro aggiunto è una nuova prospettiva nel tuo universo letterario.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">                 
                 <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-indigo-700 text-white px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-slate-950 active:scale-95 transition-all"
                 >
                   Nuovo Libro
                 </button>
              </div>
            </div>

            <div className="mb-12 flex flex-col lg:flex-row gap-6 items-center">
              <div className="w-full lg:flex-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <div className="flex gap-2.5 min-w-max">
                  {['all', ...Object.values(BookStatus)].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        statusFilter === status 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-700'
                      }`}
                    >
                      {status === 'all' ? 'Qualsiasi' : status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto bg-white border border-slate-200 p-2 rounded-[1.5rem] shadow-sm">
                <div className="flex items-center px-4 border-r border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Ordina:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as SortField)}
                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-0 outline-none cursor-pointer"
                  >
                    <option value="createdAt">Recenti</option>
                    <option value="title">Titolo</option>
                    <option value="author">Autore</option>
                  </select>
                </div>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-3 hover:bg-slate-50 rounded-xl transition-all text-indigo-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : processedBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                {processedBooks.map((book, idx) => (
                  <div key={book.id} className="animate-in fade-in slide-in-from-bottom-10 duration-700" style={{ animationDelay: `${idx * 80}ms` }}>
                    <BookCard 
                      book={book} 
                      onDelete={() => setBookToDelete(book)} 
                      onEdit={setEditingBook} 
                      onSelect={setSelectedBook} 
                      showActions={book.userId === user.id} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[4rem] p-24 text-center border border-slate-200 shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                   </svg>
                </div>
                <h3 className="text-4xl font-black text-slate-950 font-serif mb-4">Libreria Silenziosa</h3>
                <p className="text-slate-400 text-lg mb-10 max-w-sm mx-auto font-medium">Nessun libro trovato per i filtri selezionati.</p>
                <button 
                  onClick={() => { setStatusFilter('all'); setSearchQuery(''); setFilter('all'); }} 
                  className="bg-slate-950 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-slate-100"
                >
                  Ripristina Filtri
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {(showAddForm || editingBook) && (
        <BookForm 
          userId={user.id} 
          onAdd={async (b) => { 
            setIsActionLoading("Archiviazione Opera...");
            await storageService.saveBook(b); 
            await loadBooks(); 
            setShowAddForm(false); 
            setIsActionLoading(null);
          }} 
          onUpdate={async (b) => { 
            setIsActionLoading("Aggiornamento...");
            await storageService.updateBook(b); 
            await loadBooks(); 
            setEditingBook(null); 
            setIsActionLoading(null);
          }} 
          onClose={() => { setShowAddForm(false); setEditingBook(null); }} 
          editBook={editingBook} 
        />
      )}

      {selectedBook && <BookDetail book={selectedBook} onClose={() => setSelectedBook(null)} />}

      <ConfirmModal 
        isOpen={!!bookToDelete}
        title="Rimuovere l'Opera?"
        message={`Sei sicuro di voler eliminare definitivamente "${bookToDelete?.title}" dal tuo archivio? Questa azione non può essere annullata.`}
        confirmLabel="Elimina Definitivamente"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBookToDelete(null)}
      />

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
