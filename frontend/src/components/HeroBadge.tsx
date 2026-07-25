import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const HeroBadge: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-md border border-slate-300 mx-auto mb-4 w-fit"
    >
      <Sparkles className="w-4 h-4 text-amber-500" />
      <span className="text-sm font-extrabold text-slate-900 tracking-wide">
        FinSight AI • Personal Finance & Quantitative Stock Intelligence
      </span>
    </motion.div>
  );
};
