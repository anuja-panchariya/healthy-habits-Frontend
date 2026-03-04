// src/layouts/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '../components/ui/switch';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export default function Layout({ children }) {
  const isDark = localStorage.getItem('darkMode') === 'true';

  const toggleDark = () => {
    const newDark = !isDark;
    localStorage.setItem('darkMode', newDark);
    document.documentElement.classList.toggle('dark', newDark);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* NAVBAR - FIXED TOP */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 pt-4 pb-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
          
          {/* LOGO */}
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent hover:scale-105 transition-all">
            Wellness Tracker
          </Link>
          
          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="px-4 py-2 text-lg text-slate-300 hover:text-emerald-400 font-medium rounded-xl hover:bg-slate-800/50 transition-all">Dashboard</Link>
            <Link to="/habits" className="px-4 py-2 text-lg text-slate-300 hover:text-emerald-400 font-medium rounded-xl hover:bg-slate-800/50 transition-all">Habits</Link>
            <Link to="/challenges" className="px-4 py-2 text-lg text-slate-300 hover:text-emerald-400 font-medium rounded-xl hover:bg-slate-800/50 transition-all">Challenges</Link>
            <Link to="/profile" className="px-4 py-2 text-lg text-slate-300 hover:text-emerald-400 font-medium rounded-xl hover:bg-slate-800/50 transition-all">Profile</Link>
          </div>
          
          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            
            {/* DARK MODE TOGGLE */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <Sun className="w-5 h-5 text-slate-400" />
              <Switch checked={isDark} onCheckedChange={toggleDark} className="data-[state=checked]:bg-emerald-500" />
              <Moon className="w-5 h-5 text-emerald-400" />
            </div>
            
            {/* AUTH */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-xl transition-all shadow-lg" />
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT - PADDING FOR NAVBAR */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
