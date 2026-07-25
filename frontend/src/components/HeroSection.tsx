import React, { useState } from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  PieChart, 
  SlidersHorizontal, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onSelectTab: (tab: string) => void;
  onSearchTicker: (ticker: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectTab, onSearchTicker }) => {
  const [tickerInput, setTickerInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerInput.trim()) {
      onSearchTicker(tickerInput.toUpperCase().trim());
      onSelectTab('unified');
      const el = document.getElementById('stock-analysis-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featureCards = [
    {
      id: 'personal-finance',
      title: 'Expense & Budget Hub',
      desc: 'Track expenses, upload CSVs, & test Plaid mock bank sync.',
      icon: PieChart,
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300'
    },
    {
      id: 'stock-analysis',
      title: 'AI Investment Thesis',
      desc: 'Gemini structured analysis with P/E, RSI, & Buy/Hold signals.',
      icon: BrainCircuit,
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300'
    },
    {
      id: 'quant-models',
      title: 'DCF & Monte Carlo',
      desc: 'Interactive cash flow valuation & 100+ trajectory fan chart.',
      icon: SlidersHorizontal,
      color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400'
    },
    {
      id: 'portfolio-risk',
      title: 'Portfolio & Risk Score',
      desc: 'Analyze asset concentration, sector exposure, & beta.',
      icon: ShieldAlert,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300'
    }
  ];

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Glow Mesh with Champagne Gold & Sunset Coral */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-orange-500/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>Powered by Gemini 1.5 Flash + yfinance Live Market Data</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-slate-100 leading-tight">
          Next-Gen Personal Finance & <br />
          <span className="gradient-text">Quantitative AI Stock Analysis</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          FinSight AI merges personal budget management, bank account sync sandbox, technical stock indicators, 
          DCF valuation models, Monte Carlo portfolio simulations, and structured AI investment decision summaries.
        </p>

        {/* Quick Ticker Search Bar */}
        <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-amber-500/40 shadow-glow-gold">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g. NVDA, AAPL, MSFT)..."
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
          >
            <span>Analyze Stock</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Popular Ticker Chips */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400">
          <span className="font-mono text-slate-500">Popular:</span>
          {['AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'GOOGL'].map((sym) => (
            <button
              key={sym}
              onClick={() => { 
                onSearchTicker(sym); 
                onSelectTab('unified');
                const el = document.getElementById('stock-analysis-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 font-mono transition-colors"
            >
              ${sym}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {featureCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={() => {
                onSelectTab('unified');
                const el = document.getElementById(`${card.id}-section`);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-6 rounded-2xl glass-panel-interactive cursor-pointer border bg-gradient-to-b ${card.color} flex flex-col justify-between`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">{card.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-amber-400 group">
                <span>Explore Feature</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Key Metric Counters */}
      <div className="mt-12 p-6 rounded-2xl glass-panel border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <span className="block text-2xl sm:text-3xl font-extrabold gradient-text font-mono">100+</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Monte Carlo Trajectories</span>
        </div>
        <div>
          <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">100%</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Audit Log Transparency</span>
        </div>
        <div>
          <span className="block text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">DCF</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Intrinsic Valuation Model</span>
        </div>
        <div>
          <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">Plaid Mock</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Bank Sync Sandbox</span>
        </div>
      </div>
    </div>
  );
};
