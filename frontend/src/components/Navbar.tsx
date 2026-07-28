import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, ShieldCheck, User, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenPDF?: () => void;
  onOpenHelp?: () => void;
  onOpenAuth?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPDF, onOpenHelp, onOpenAuth, onSelectTab }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const menuItems = [
    { label: 'Personal Expenses', sectionId: 'personal-finance-section' },
    { label: 'AI Stock Analysis', sectionId: 'stock-analysis-section' },
    { label: 'DCF & Monte Carlo', sectionId: 'quant-models-section' },
    { label: 'Portfolio & Risk', sectionId: 'portfolio-risk-section' },
    { label: 'Screener & Compare', sectionId: 'screener-compare-section' },
    { label: 'AI Audit Log', sectionId: 'audit-logs-section' },
  ];

  const handleNavClick = (sectionId: string) => {
    if (onSelectTab) onSelectTab('unified');
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="flex items-center justify-between py-5 px-6 md:px-10 w-full relative z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/90 shadow-sm">
      {/* Left Side: FinSight AI Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-900 flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <span className="font-extrabold tracking-tight text-xl text-slate-900">
          FinSight <span className="text-indigo-600 font-bold">AI</span>
        </span>
      </div>

      {/* Center Menu: Clear Feature Names including AI Audit Log */}
      <ul className="hidden lg:flex items-center gap-6 text-slate-800 font-extrabold text-xs tracking-wide">
        {menuItems.map((item) => (
          <li
            key={item.label}
            onClick={() => handleNavClick(item.sectionId)}
            className={`cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-1 group font-extrabold text-slate-900 ${
              item.sectionId === 'audit-logs-section' ? 'text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200' : ''
            }`}
          >
            {item.sectionId === 'audit-logs-section' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      {/* Right Action Group */}
      <div className="flex items-center gap-3 relative">
        {/* User Account / Profile Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer border border-slate-800"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-extrabold flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline max-w-[110px] truncate">{user.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Account Popover Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 p-4 rounded-2xl bg-white border border-slate-300 shadow-2xl space-y-3 z-50 text-slate-900"
                >
                  <div className="border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-mono font-extrabold flex items-center justify-center text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block truncate">{user.name}</span>
                        <span className="text-[11px] font-mono text-indigo-600 block truncate">{user.email}</span>
                      </div>
                    </div>
                    <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{user.tier}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out / Switch User</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Sign In / Register</span>
          </button>
        )}

        <button
          onClick={onOpenHelp}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors border border-slate-300 cursor-pointer"
        >
          <span>User Guide</span>
        </button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenPDF}
          className="flex items-center bg-slate-900 text-white rounded-full pl-2 pr-5 py-2 gap-2.5 hover:bg-indigo-900 transition-all shadow-md group cursor-pointer"
        >
          <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs md:text-sm font-extrabold tracking-wide">
            Export PDF Report
          </span>
        </motion.button>
      </div>
    </nav>
  );
};
