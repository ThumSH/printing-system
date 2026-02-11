import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'worker', name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'worker'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedRole === 'admin') {
      // Simple mock validation for Admin
      if (password === 'admin123') { // You can change this
        onLogin('admin', 'Administrator');
      } else {
        setError('Invalid Admin Password (Try: admin123)');
      }
    } else {
      // Workers just need a name to log in (for "Acknowledged By" fields)
      if (username.trim()) {
        onLogin('worker', username);
      } else {
        setError('Please enter your name');
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl shadow-2xl p-8 relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mb-4 shadow-lg shadow-blue-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PRINTSYS <span className="text-blue-500">PRO</span></h1>
          <p className="text-neutral-500 text-sm mt-1">Production Management System</p>
        </div>

        {/* Role Toggles */}
        <div className="flex bg-neutral-950 p-1.5 rounded-xl mb-8 border border-neutral-800">
          <button 
            onClick={() => { setSelectedRole('admin'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              selectedRole === 'admin' 
                ? 'bg-neutral-800 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            ADMIN
          </button>
          <button 
            onClick={() => { setSelectedRole('worker'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              selectedRole === 'worker' 
                ? 'bg-neutral-800 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>
            WORKER
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {selectedRole === 'admin' ? (
             <div className="space-y-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
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
            <div className="space-y-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
               <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Worker Name</label>
               <input 
                 type="text" 
                 placeholder="Enter your name..." 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-neutral-700"
               />
               <p className="text-[10px] text-neutral-600 px-1">This name will be logged in reports.</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 mt-4 active:scale-95"
          >
            {selectedRole === 'admin' ? 'ACCESS DASHBOARD' : 'START SHIFT'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-neutral-600">
            System Version 1.0.4 &bull; Secure Connection
          </p>
        </div>
      </div>
    </div>
  );
}