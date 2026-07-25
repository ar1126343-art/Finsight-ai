import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export const BottomLeftCard: React.FC = () => {
  const handleScrollToAudit = () => {
    const el = document.getElementById('audit-logs-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="absolute bottom-28 right-4 left-auto md:left-6 md:right-auto md:bottom-6 lg:bottom-10 lg:left-10 p-3 md:p-4 lg:p-5 rounded-[1.2rem] md:rounded-[1.5rem] lg:rounded-[2.2rem] bg-white/60 backdrop-blur-xl flex flex-col gap-2 lg:gap-3 min-w-[150px] md:min-w-[170px] lg:min-w-[200px] w-fit z-20 shadow-lg border border-white/70"
    >
      <div>
        <span className="text-2xl md:text-3xl font-bold text-[rgba(30,50,90,0.95)] tracking-tight block font-mono">
          100+
        </span>
        <span className="text-[10px] md:text-[12px] font-semibold text-[rgba(30,50,90,0.75)] uppercase tracking-wider block">
          Monte Carlo Trajectories
        </span>
      </div>

      <button
        onClick={handleScrollToAudit}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-indigo-900 font-extrabold text-[11px] md:text-xs shadow-md transition-all cursor-pointer group"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>View SQLite AI Audit Log</span>
      </button>
    </motion.div>
  );
};
