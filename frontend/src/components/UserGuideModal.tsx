import React from 'react';
import { 
  HelpCircle, 
  X, 
  PieChart, 
  Cpu, 
  Sliders, 
  BarChart3, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl p-6 rounded-2xl bg-white border border-slate-300 shadow-2xl space-y-6 max-h-[88vh] overflow-y-auto text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-900 border border-indigo-300">
              <HelpCircle className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">How to Use FinSight AI — Unified Master Guide</h3>
              <span className="text-xs font-mono font-bold text-indigo-700">Everything is integrated into 1 clean unified master dashboard</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-500 hover:text-slate-900 font-extrabold text-lg cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* High-Contrast Plain English Guide Content */}
        <div className="space-y-4 text-xs font-bold text-slate-900">
          {/* Section 1: Overview */}
          <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2">
            <h4 className="text-sm font-extrabold text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> 1. Combined Master Dashboard Overview
            </h4>
            <p className="text-slate-800 leading-relaxed font-semibold">
              All quantitative tools are integrated into <strong>one unified continuous master dashboard</strong>. 
              Scroll smoothly down the main page or click any section link in the top bar to access:
              Personal Expenses ➔ AI Stock Analysis ➔ DCF & Monte Carlo ➔ Screener & Compare ➔ Portfolio & Risk ➔ AI Audit Log!
            </p>
          </div>

          {/* Section 2: Personal Finance */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" /> 2. Personal Expenses & Plaid Bank Sync
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-800 font-bold">
              <li><strong>Plaid Bank Sync Sandbox</strong>: Click <em>"Plaid Bank Sync Sandbox"</em> to simulate connecting your bank account and fetching transactions.</li>
              <li><strong>Add Transaction / CSV Import</strong>: Add transactions manually or upload CSV files to update your pie chart categories and savings metrics.</li>
              <li><strong>Clear Demo Data</strong>: Use <em>"Clear Demo Entries"</em> to start with a blank $0 balance.</li>
            </ul>
          </div>

          {/* Section 3: AI Stock Analysis */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" /> 3. Real-Time Stock Analysis & Gemini AI Thesis
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-800 font-bold">
              <li><strong>Ticker Lookup</strong>: Search stock tickers like <code className="text-indigo-900 font-mono font-extrabold bg-indigo-50 px-1 py-0.5 rounded">NVDA</code>, <code className="text-indigo-900 font-mono font-extrabold bg-indigo-50 px-1 py-0.5 rounded">AAPL</code>, <code className="text-indigo-900 font-mono font-extrabold bg-indigo-50 px-1 py-0.5 rounded">MSFT</code>, or <code className="text-indigo-900 font-mono font-extrabold bg-indigo-50 px-1 py-0.5 rounded">TSLA</code>.</li>
              <li><strong>Technical Charts</strong>: View price history, 20/50/200-day Simple Moving Averages, RSI (14), MACD, and Support/Resistance levels.</li>
              <li><strong>Gemini AI Thesis Card</strong>: Generates a 1-paragraph investment thesis, price movement breakdown, key catalysts, red flags, and a <strong>Strong Buy / Buy / Watchlist</strong> label.</li>
            </ul>
          </div>

          {/* Section 4: Quantitative Models */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" /> 4. DCF Valuation & 100+ Monte Carlo Simulations
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-800 font-bold">
              <li><strong>DCF Sliders</strong>: Adjust FCF Growth Rate %, WACC %, and Terminal Growth % to calculate per-share intrinsic value.</li>
              <li><strong>Monte Carlo Trajectories</strong>: Run 100 stochastic price trajectories to evaluate 10th percentile, 50th percentile (median), and 90th percentile outcome paths.</li>
            </ul>
          </div>

          {/* Section 5: Screener & Portfolio */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> 5. Equity Screener, Side-by-Side Comparison & Portfolio Risk
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-800 font-bold">
              <li><strong>Screener</strong>: Filter equities by max P/E, P/B, Debt/Equity, and Sector.</li>
              <li><strong>Compare Matrix</strong>: Compare 2-4 equities side-by-side.</li>
              <li><strong>Portfolio Risk Index</strong>: View sector allocation donut chart and institutional risk score (0-100).</li>
            </ul>
          </div>

          {/* Section 6: Audit Log & PDF Export */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 6. SQLite AI Audit Log & Executive PDF Export
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-800 font-bold">
              <li><strong>SQLite AI Audit Log</strong>: Inspect raw prompts, token usage, latency, and structured JSON outputs stored in `finsight.db`.</li>
              <li><strong>Export PDF Report</strong>: Click <em>"Export PDF Report"</em> in the top navigation bar to download a confidential executive PDF summary.</li>
            </ul>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            Got It! Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
