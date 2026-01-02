
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const user = await storageService.login(email, password);
        if (user) onAuthSuccess(user);
        else setError('Credenziali non valide. Riprova.');
      } else {
        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          username: username || email.split('@')[0],
          password
        };
        const user = await storageService.register(newUser);
        if (user) onAuthSuccess(user);
        else setError('Errore durante la registrazione.');
      }
    } catch (err: any) {
      setError(err.message || 'Errore di connessione.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-dynamic w-full flex flex-col lg:flex-row bg-slate-950 relative overflow-hidden">
      {/* Background Cinematic Section */}
      <div className="relative lg:w-[55%] h-[40vh] lg:h-auto overflow-hidden">
        {/* Ken Burns Effect Image */}
        <div className="absolute inset-0 scale-110 animate-ken-burns">
          <img 
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop" 
            alt="Library" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent lg:to-slate-950"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20 lg:hidden"></div>
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        {/* Floating Elements (Desktop only) */}
        <div className="hidden lg:block absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white animate-float-slow">
            Architettura
          </div>
          <div className="absolute top-[40%] left-[35%] px-4 py-2 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-white animate-float-delayed">
            Poesia Classica
          </div>
          <div className="absolute bottom-[30%] left-[20%] px-4 py-2 bg-violet-500/20 backdrop-blur-md border border-violet-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-white animate-float-fast">
            Design Editoriale
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 h-full p-8 lg:p-20 flex flex-col justify-end lg:justify-between text-white">
          <div className="hidden lg:flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-[1.2rem] flex items-center justify-center text-slate-950 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="text-xl font-black font-serif tracking-tighter">MyBiblio</span>
          </div>

          <div className="max-w-xl">
            <h1 className="text-5xl lg:text-8xl font-black font-serif leading-[0.9] tracking-tighter mb-6 animate-in fade-in slide-in-from-left-10 duration-1000">
              Il tuo <br /> <span className="text-white/40 italic">Rifugio</span> <br /> Digitale.
            </h1>
            <p className="hidden lg:block text-slate-300 font-medium text-lg leading-relaxed max-w-sm opacity-60">
              Organizza, scopri e custodisci la bellezza della parola scritta in un archivio progettato per la mente moderna.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-20 bg-slate-950 relative">
        {/* Glow behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-1000">
          <div className="bg-white/5 backdrop-blur-2xl p-8 lg:p-14 rounded-[3.5rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white font-serif leading-tight">
                {isLogin ? 'Bentornato' : 'Nuovo Viaggio'}
              </h2>
              <div className="h-1 w-12 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                  <div className="relative">
                    <input 
                      type="text" required value={username} onChange={(e) => setUsername(e.target.value)} 
                      className="w-full px-8 py-4 rounded-[1.5rem] bg-white/5 border border-white/5 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-white/20 font-bold text-white placeholder:text-slate-500 transition-all text-sm" 
                      placeholder="Username" 
                    />
                  </div>
                </div>
              )}
              
              <div className="relative">
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                  className="w-full px-8 py-4 rounded-[1.5rem] bg-white/5 border border-white/5 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-white/20 font-bold text-white placeholder:text-slate-500 transition-all text-sm" 
                  placeholder="Email" 
                />
              </div>

              <div className="relative">
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="w-full px-8 py-4 rounded-[1.5rem] bg-white/5 border border-white/5 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-white/20 font-bold text-white placeholder:text-slate-500 transition-all text-sm" 
                  placeholder="Password" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-white text-slate-950 py-5 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-400 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-4 mt-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                ) : isLogin ? 'Sblocca' : 'Inizia'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
              >
                {isLogin ? (
                  <>Non hai un account? <span className="text-white underline underline-offset-4 ml-1">Iscriviti</span></>
                ) : (
                  <>Hai già un account? <span className="text-white underline underline-offset-4 ml-1">Accedi</span></>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">
              © 2025 
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.2); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-ken-burns { animation: ken-burns 30s infinite alternate ease-in-out; }
        .animate-float-slow { animation: float-slow 8s infinite ease-in-out; }
        .animate-float-delayed { animation: float-delayed 10s infinite ease-in-out; animation-delay: 2s; }
        .animate-float-fast { animation: float-fast 6s infinite ease-in-out; animation-delay: 1s; }
        
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10.9% { transform: translate3d(-1px, 0, 0); }
          20% { transform: translate3d(2px, 0, 0); }
          30.9%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
          80% { transform: translate3d(2px, 0, 0); }
          90% { transform: translate3d(-1px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default AuthForm;
