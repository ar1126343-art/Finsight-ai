import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-2xl hover:bg-indigo-900 border border-slate-700 cursor-pointer transition-colors group"
          title="Scroll back to top"
        >
          <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
            <ArrowUp className="w-4 h-4 text-amber-400" />
          </div>
          <span>Back to Top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
