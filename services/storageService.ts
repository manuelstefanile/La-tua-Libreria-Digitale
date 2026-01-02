
import { User, Book } from '../types';

const API_BASE = '/api';
const LOCAL_BOOKS_KEY = 'bibliotech_books_local';
const LOCAL_USERS_KEY = 'bibliotech_users_local';

// Variabile di stato interna per gestire il fallback
let isServerAvailable = true;

const getLocalBooks = (): Book[] => {
  const data = localStorage.getItem(LOCAL_BOOKS_KEY);
  return data ? JSON.parse(data) : [];
};

const setLocalBooks = (books: Book[]) => {
  localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(books));
};

const getLocalUsers = (): (User & { password?: string })[] => {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const storageService = {
  // Health Check: determina se usare il server o il local storage
  checkHealth: async (): Promise<{ status: string; database: string } | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error();
      const data = await response.json();
      isServerAvailable = true;
      return data;
    } catch (e) {
      console.warn('Backend non raggiungibile. Passaggio alla modalità LocalStorage.');
      isServerAvailable = false;
      return { status: 'offline', database: 'local_storage' };
    }
  },

  // Autenticazione
  login: async (email: string, password: string): Promise<User | null> => {
    // Bypass Admin (Sempre prioritario)
    if (email === 'admin@admin' && password === 'admin') {
      return { id: 'admin-virtual-session', username: 'Super Admin', email: 'admin@admin' };
    }

    if (isServerAvailable) {
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (response.ok) return await response.json();
      } catch (e) {
        isServerAvailable = false;
      }
    }

    // Fallback LocalStorage
    const users = getLocalUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPass } = user;
      return userWithoutPass;
    }
    return null;
  },

  register: async (user: User & { password?: string }): Promise<User | null> => {
    if (isServerAvailable) {
      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        if (response.ok) return await response.json();
        const err = await response.json();
        throw new Error(err.error || 'Errore registrazione');
      } catch (e: any) {
        if (e.message.includes('Email riservata') || e.message.includes('registrazione')) throw e;
        isServerAvailable = false;
      }
    }

    // Fallback LocalStorage
    const users = getLocalUsers();
    if (users.find(u => u.email === user.email)) throw new Error('Email già esistente localmente.');
    users.push(user);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    const { password: _, ...userWithoutPass } = user;
    return userWithoutPass;
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<User | null> => {
    if (isServerAvailable && userId !== 'admin-virtual-session') {
      // In un'applicazione reale qui faremmo una chiamata PATCH/PUT /api/users/:id
      // Per questa demo aggiorniamo solo il lato locale se il server non ha l'endpoint specifico
    }

    const users = getLocalUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      const { password: _, ...userWithoutPass } = users[index];
      return userWithoutPass;
    }
    
    // Se è l'admin virtuale
    if (userId === 'admin-virtual-session') {
        return { id: 'admin-virtual-session', username: updates.username || 'Super Admin', email: 'admin@admin' };
    }

    return null;
  },

  // Operazioni sui Libri
  getBooks: async (): Promise<Book[]> => {
    if (isServerAvailable) {
      try {
        const response = await fetch(`${API_BASE}/books`);
        if (response.ok) {
          const data = await response.json();
          return data.map((b: any) => ({ ...b, createdAt: Number(b.createdAt) }));
        }
      } catch (e) {
        isServerAvailable = false;
      }
    }
    return getLocalBooks();
  },

  saveBook: async (book: Book): Promise<boolean> => {
    if (isServerAvailable) {
      try {
        const response = await fetch(`${API_BASE}/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(book)
        });
        if (response.ok) return true;
      } catch (e) {
        isServerAvailable = false;
      }
    }

    // LocalStorage
    const books = getLocalBooks();
    books.push(book);
    setLocalBooks(books);
    return true;
  },

  updateBook: async (book: Book): Promise<boolean> => {
    if (isServerAvailable) {
      try {
        const response = await fetch(`${API_BASE}/books/${book.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(book)
        });
        if (response.ok) return true;
      } catch (e) {
        isServerAvailable = false;
      }
    }

    // LocalStorage
    const books = getLocalBooks();
    const index = books.findIndex(b => b.id === book.id);
    if (index !== -1) {
      books[index] = book;
      setLocalBooks(books);
      return true;
    }
    return false;
  },

  deleteBook: async (id: string): Promise<boolean> => {
    if (isServerAvailable) {
      try {
        const response = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
        if (response.ok) return true;
      } catch (e) {
        isServerAvailable = false;
      }
    }

    // LocalStorage
    const books = getLocalBooks();
    const filtered = books.filter(b => b.id !== id);
    setLocalBooks(filtered);
    return true;
  }
};
