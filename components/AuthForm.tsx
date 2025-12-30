
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = storageService.getUsers();

    if (isLogin) {
      const user = users.find(u => u.email === email);
      if (user) {
        storageService.setSession(user);
        onAuthSuccess(user);
      } else {
        alert("Credenziali non valide o utente non trovato");
      }
    } else {
      const existing = users.find(u => u.email === email);
      if (existing) {
        alert("Email già registrata");
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        username: username || email.split('@')[0]
      };
      storageService.saveUser(newUser);
      storageService.setSession(newUser);
      onAuthSuccess(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.993 7.993 0 001 12h18a7.993 7.993 0 00-8-7.196L9 4.804z" />
              <path fillRule="evenodd" d="M11 3.204a8.978 8.978 0 00-2 0V5h2V3.204zM12.5 15a.5.5 0 010-1h1a.5.5 0 010 1h-1zm-5 0a.5.5 0 010-1h1a.5.5 0 010 1h-1zM10 6H8.502a7.003 7.003 0 00-7.5 7h18a7.003 7.003 0 00-7.5-7H10z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 font-serif">BiblioTech</h1>
          <p className="text-slate-500 mt-2">{isLogin ? 'Bentornato nella tua libreria' : 'Crea il tuo account gratuito'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Utente</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Nome"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="tua@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-6"
          >
            {isLogin ? 'Accedi' : 'Registrati'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {isLogin ? "Non hai un account?" : "Hai già un account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'Crea Account' : 'Accedi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
