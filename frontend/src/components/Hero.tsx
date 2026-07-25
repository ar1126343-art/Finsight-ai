import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { HeroBadge } from './HeroBadge';
import { BottomLeftCard } from './BottomLeftCard';
import { BottomRightCorner } from './BottomRightCorner';

interface HeroProps {
  onOpenPDF?: () => void;
  onOpenHelp?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenPDF, onOpenHelp, onSelectTab }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#FDFBF7]">
      <section className="relative w-full max-w-[1536px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center bg-white/10 group border border-white/40">
        {/* Crisp Original Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-[65%] lg:object-center z-0 opacity-100"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4"
        />

        {/* Content Layer */}
        <div className="relative z-10 w-full h-full flex flex-col items-center">
          <Navbar onOpenPDF={onOpenPDF} onOpenHelp={onOpenHelp} onSelectTab={onSelectTab} />

          {/* Text Container */}
          <div className="w-full flex flex-col items-center pt-6 md:pt-10 px-6 text-center max-w-4xl z-10">
            <HeroBadge />
            
            <motion.h1
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal text-[#5E6470] mb-2 tracking-tight leading-[1.05]"
            >
              Fluid Asset Streams
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-[#5E6470] opacity-90 leading-relaxed max-w-xl font-normal"
            >
              Access Smart Vaults, stake RIVR, track expenses, run DCF valuation models, 100+ Monte Carlo simulations, & inspect SQLite AI Audit logs.
            </motion.p>
          </div>

          <BottomLeftCard />
          <BottomRightCorner onOpenHelp={onOpenHelp} />
        </div>
      </section>
    </div>
  );
};
