
export enum BookStatus {
  READING = 'In Lettura',
  COMPLETED = 'Completato',
  PUBLISHED = 'Pubblicato',
  WISH_LIST = 'Lista dei Desideri'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  status: BookStatus;
  userId: string;
  coverUrl: string;
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
