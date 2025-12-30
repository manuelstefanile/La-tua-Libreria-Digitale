
import { Book, User } from '../types';

const USERS_KEY = 'bibliotech_users';
const BOOKS_KEY = 'bibliotech_books';
const SESSION_KEY = 'bibliotech_session';

export const storageService = {
  // Gestione Utenti
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: User) => {
    const users = storageService.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Gestione Sessione
  setSession: (user: User | null) => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  getSession: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Gestione Libri
  getBooks: (): Book[] => {
    const data = localStorage.getItem(BOOKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveBook: (book: Book) => {
    const books = storageService.getBooks();
    books.push(book);
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  },

  deleteBook: (bookId: string) => {
    const books = storageService.getBooks();
    const filtered = books.filter(b => b.id !== bookId);
    localStorage.setItem(BOOKS_KEY, JSON.stringify(filtered));
  },

  updateBook: (updatedBook: Book) => {
    const books = storageService.getBooks();
    const index = books.findIndex(b => b.id === updatedBook.id);
    if (index !== -1) {
      books[index] = updatedBook;
      localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    }
  }
};
