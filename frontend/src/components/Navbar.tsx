import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenPDF?: () => void;
  onOpenHelp?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPDF, onOpenHelp, onSelectTab }) => {
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
    <nav className="flex items-center justify-between py-5 px-6 md:px-10 w-full relative z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/90 shadow-sm">
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

      {/* Right Action Button: Export Executive PDF */}
      <div className="flex items-center gap-3">
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
