import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'development' | 'worker', name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'development' | 'worker'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedRole === 'admin') {
      if (password === 'admin123') { // Admin password
        onLogin('admin', 'Administrator');
      } else {
        setError('Invalid Admin Password (Try: admin123)');
      }
    } else {
      // Both Development and Workers log in with their name
      if (username.trim()) {
        onLogin(selectedRole, username);
      } else {
        setError('Please enter your name');
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl shadow-2xl p-8 relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mb-4 shadow-lg shadow-blue-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PRINTSYS <span className="text-blue-500">PRO</span></h1>
          <p className="text-neutral-500 text-sm mt-1">Production Management System</p>
        </div>

        {/* 3-Way Role Toggles */}
        <div className="flex bg-neutral-950 p-1.5 rounded-xl mb-8 border border-neutral-800">
          <button 
            type="button"
            onClick={() => { setSelectedRole('admin'); setError(''); }}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-bold transition-all ${selectedRole === 'admin' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            ADMIN
          </button>
          <button 
            type="button"
            onClick={() => { setSelectedRole('development'); setError(''); }}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-bold transition-all ${selectedRole === 'development' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            DEV TEAM
          </button>
          <button 
            type="button"
            onClick={() => { setSelectedRole('worker'); setError(''); }}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-bold transition-all ${selectedRole === 'worker' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            WORKER
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          
          {selectedRole === 'admin' ? (
             <div className="space-y-1.5 animate-in fade-in duration-300">
               <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Master Password</label>
               <input 
                 type="password" 
                 placeholder="Enter admin password..." 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-neutral-700"
               />
             </div>
          ) : (
            <div className="space-y-1.5 animate-in fade-in duration-300">
               <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Your Name</label>
               <input 
                 type="text" 
                 placeholder={`Enter your ${selectedRole} name...`} 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-neutral-700"
               />
            </div>
          )}

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-pulse">{error}</div>}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 mt-4 active:scale-95">
            {selectedRole === 'admin' ? 'ACCESS DASHBOARD' : 'ENTER WORKSPACE'}
          </button>
        </form>
      </div>
    </div>
  );
}