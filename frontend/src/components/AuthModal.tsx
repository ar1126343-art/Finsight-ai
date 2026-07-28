import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, LogIn, UserPlus, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth, UserProfile } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [tier, setTier] = useState<UserProfile['tier']>('Elite Pro Member');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please provide an email address and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password, rememberMe);
        if (result.success) {
          if (result.isNewAccount) {
            setSuccessMsg('Account created & logged in successfully!');
            setTimeout(() => onClose(), 600);
          } else {
            onClose();
          }
        } else {
          setError(result.message || 'Incorrect password. Please verify and try again.');
        }
      } else {
        const result = await signup(name, email, password, tier, rememberMe);
        if (result.success) {
          setSuccessMsg('Account created & workspace saved!');
          setTimeout(() => onClose(), 600);
        } else {
          setError(result.message || 'Sign up failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
            {mode === 'login' ? 'Sign In to FinSight AI' : 'Create Your FinSight AI Account'}
          </h3>
          <p className="text-xs font-bold text-slate-600">
            {mode === 'login' ? 'Enter your email & password to load your saved workspace.' : 'Create an account to save personal expenses, portfolio & AI audit history.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-300 font-extrabold text-xs">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setPassword(''); setConfirmPassword(''); }}
            className={`w-full py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); setPassword(''); setConfirmPassword(''); }}
            className={`w-full py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'signup' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Create Account</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
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
                placeholder="user@example.com"
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
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
              />
              {/* Show / Hide Password Eye Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
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
          )}

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-bold text-xs select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
              <span>Remember me on this browser</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Creating & Verifying Account...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In / Register Account' : 'Create Account & Save Profile'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
