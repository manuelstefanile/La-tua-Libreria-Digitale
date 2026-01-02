
import React, { useState } from 'react';
import { User, Book, BookStatus } from '../types';
import { storageService } from '../services/storageService';

interface ProfileProps {
  user: User;
  books: Book[];
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, books, onUpdateUser, onLogout, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [isSaving, setIsSaving] = useState(false);

  const stats = {
    total: books.length,
    reading: books.filter(b => b.status === BookStatus.READING).length,
    completed: books.filter(b => b.status === BookStatus.COMPLETED).length,
    wishlist: books.filter(b => b.status === BookStatus.WISH_LIST).length,
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const updated = await storageService.updateUserProfile(user.id, { username: newUsername });
    if (updated) {
      onUpdateUser(updated);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-700 transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
        Torna alla Libreria
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-700 rounded-[2rem] shadow-2xl shadow-indigo-100 flex items-center justify-center text-white text-3xl font-black mb-6">
              {user.username.charAt(0).toUpperCase()}
            </div>
            
            {isEditing ? (
              <div className="w-full space-y-4">
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-center text-slate-900 focus:ring-4 focus:ring-indigo-700/5 outline-none"
                  placeholder="Nuovo username"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="flex-1 bg-indigo-700 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center"
                  >
                    {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Salva'}
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setNewUsername(user.username); }}
                    className="flex-1 bg-slate-100 text-slate-400 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black text-slate-950 font-serif leading-tight mb-1">{user.username}</h3>
                <p className="text-xs font-bold text-slate-400 mb-6">{user.email}</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-slate-50 text-slate-900 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-700 transition-all border border-transparent hover:border-indigo-100"
                >
                  Modifica Profilo
                </button>
              </>
            )}

            <div className="w-full border-t border-slate-50 mt-8 pt-8">
                <button 
                  onClick={onLogout}
                  className="w-full text-rose-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                  Disconnetti
                </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Totale Opere</p>
              <h4 className="text-5xl font-black text-slate-950 font-serif">{stats.total}</h4>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">In Lettura</p>
              <h4 className="text-5xl font-black text-sky-600 font-serif">{stats.reading}</h4>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Completati</p>
              <h4 className="text-5xl font-black text-emerald-600 font-serif">{stats.completed}</h4>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Wishlist</p>
              <h4 className="text-5xl font-black text-violet-600 font-serif">{stats.wishlist}</h4>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
                <h4 className="text-2xl font-black font-serif mb-4 italic">"Un libro è un giardino che puoi custodire in tasca."</h4>
                <p className="text-indigo-200/60 text-[10px] font-black uppercase tracking-widest">— Proverbio Arabo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
