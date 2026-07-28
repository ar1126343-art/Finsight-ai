import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth, UserProfile } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState<UserProfile['tier']>('Elite Pro Member');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide an email and password.');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Please enter your name.');
      return;
    }

    if (mode === 'login') {
      login(email, name || undefined, tier);
    } else {
      signup(name, email, tier);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-300 shadow-2xl space-y-6 text-slate-900 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 font-extrabold text-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white mx-auto shadow-md">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
            {mode === 'login' ? 'Welcome Back to FinSight AI' : 'Create Your FinSight AI Account'}
          </h3>
          <p className="text-xs font-bold text-slate-600">
            Save all transactions, portfolio holdings, DCF models & AI audit logs automatically.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-300 font-extrabold text-xs">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`w-full py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`w-full py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'signup' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Create Account</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Ahmed Raza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="ahmed.raza@finsight.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Account Role Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
            >
              <option value="Elite Pro Member">Elite Pro Member</option>
              <option value="Institutional Analyst">Institutional Analyst</option>
              <option value="Private Investor">Private Investor</option>
            </select>
          </div>

          {/* Account Save Guarantee Banner */}
          <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-2 text-[11px] text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Auto-Sync Active</strong>: All budget targets, stock watchlists, DCF simulations, and SQLite AI audit logs are tied to your session so you can return anytime.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            {mode === 'login' ? 'Sign In & Load Workspace' : 'Create Account & Save Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
};
