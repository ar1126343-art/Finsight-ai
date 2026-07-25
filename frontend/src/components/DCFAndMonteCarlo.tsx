import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  TrendingUp, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  Calculator,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid as RechartsGrid 
} from 'recharts';

interface DCFAndMonteCarloProps {
  ticker?: string;
}

export const DCFAndMonteCarlo: React.FC<DCFAndMonteCarloProps> = ({ ticker = 'AAPL' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'dcf' | 'monte-carlo'>('dcf');

  // DCF State (values in $ Millions)
  const [fcf, setFcf] = useState<number>(108000.0);
  const [growthRate, setGrowthRate] = useState<number>(0.08);
  const [terminalGrowth, setTerminalGrowth] = useState<number>(0.025);
  const [discountRate, setDiscountRate] = useState<number>(0.09);
  const [sharesOutstanding, setSharesOutstanding] = useState<number>(15200.0);
  const [totalDebt, setTotalDebt] = useState<number>(110000.0);
  const [cashAndEquiv, setCashAndEquiv] = useState<number>(65000.0);

  const [dcfResult, setDcfResult] = useState<any>(null);
  const [loadingDcf, setLoadingDcf] = useState<boolean>(false);

  // Monte Carlo State
  const [initialValue, setInitialValue] = useState<number>(100000);
  const [expectedReturn, setExpectedReturn] = useState<number>(0.12);
  const [volatility, setVolatility] = useState<number>(0.22);
  const [timeHorizon, setTimeHorizon] = useState<number>(252);
  const [numSimulations, setNumSimulations] = useState<number>(100);

  const [mcResult, setMcResult] = useState<any>(null);
  const [loadingMc, setLoadingMc] = useState<boolean>(false);

  const calculateDcfBackend = async () => {
    setLoadingDcf(true);
    try {
      const res = await fetch('/api/dcf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fcf,
          growth_rate: growthRate,
          terminal_growth: terminalGrowth,
          discount_rate: discountRate,
          shares_outstanding: sharesOutstanding,
          total_debt: totalDebt,
          cash_and_equiv: cashAndEquiv
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDcfResult(data);
      }
    } catch (err) {
      console.error("DCF error:", err);
    } finally {
      setLoadingDcf(false);
    }
  };

  const runMonteCarloBackend = async () => {
    setLoadingMc(true);
    try {
      const res = await fetch('/api/monte-carlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initial_portfolio_value: initialValue,
          expected_annual_return: expectedReturn,
          annual_volatility: volatility,
          time_horizon_days: timeHorizon,
          num_simulations: numSimulations
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMcResult(data);
      }
    } catch (err) {
      console.error("Monte Carlo error:", err);
    } finally {
      setLoadingMc(false);
    }
  };

  useEffect(() => {
    calculateDcfBackend();
    runMonteCarloBackend();
  }, []);

  const formatBillionOrMillion = (valMillions: number) => {
    if (!valMillions || isNaN(valMillions)) return '$0.00 Million';
    if (Math.abs(valMillions) >= 1000) {
      return `$${(valMillions / 1000).toFixed(2)} Billion`;
    }
    return `$${valMillions.toLocaleString('en-US', { minimumFractionDigits: 2 })} Million`;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            Quantitative Models: <span className="text-indigo-600 font-extrabold">DCF Valuation & Monte Carlo</span>
          </h2>
          <p className="text-sm font-bold text-slate-700">
            Interactive Discounted Cash Flow intrinsic valuation and 100+ trajectory stochastic fan charts.
          </p>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-300 shadow-sm font-extrabold text-xs">
          <button
            onClick={() => setActiveSubTab('dcf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'dcf'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>DCF Valuation</span>
          </button>
          <button
            onClick={() => setActiveSubTab('monte-carlo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'monte-carlo'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Monte Carlo (100+ Trajectories)</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'dcf' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sliders & Input Parameters */}
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">DCF Input Assumptions</h3>
              <span className="text-xs font-mono font-bold text-indigo-700">Inputs in $ Millions</span>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-900">
              {/* FCF Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-slate-800">Initial FCF ($M):</label>
                  <span className="font-mono text-indigo-700 font-extrabold">${fcf.toLocaleString()}M</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="1000"
                  value={fcf}
                  onChange={(e) => setFcf(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* 5-Yr Growth Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-slate-800">5-Yr FCF Growth Rate (g):</label>
                  <span className="font-mono text-indigo-700 font-extrabold">{(growthRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.30"
                  step="0.005"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Discount Rate / WACC */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-slate-800">Discount Rate / WACC (r):</label>
                  <span className="font-mono text-indigo-700 font-extrabold">{(discountRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.18"
                  step="0.005"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Terminal Growth */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-slate-800">Terminal Growth Rate (g_term):</label>
                  <span className="font-mono text-indigo-700 font-extrabold">{(terminalGrowth * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.05"
                  step="0.002"
                  value={terminalGrowth}
                  onChange={(e) => setTerminalGrowth(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Debt & Cash */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-700 text-[11px] mb-1">Total Debt ($M)</label>
                  <input
                    type="number"
                    value={totalDebt}
                    onChange={(e) => setTotalDebt(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-[11px] mb-1">Cash ($M)</label>
                  <input
                    type="number"
                    value={cashAndEquiv}
                    onChange={(e) => setCashAndEquiv(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <button
                onClick={calculateDcfBackend}
                disabled={loadingDcf}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loadingDcf ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <Calculator className="w-4 h-4 text-amber-400" />}
                <span>Recalculate Intrinsic Valuation</span>
              </button>
            </div>
          </div>

          {/* DCF Valuation Output Cards & Mathematical Formulas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-emerald-300 shadow-md space-y-1">
                <span className="text-xs font-mono font-bold text-slate-600 uppercase">Intrinsic Value / Share</span>
                <span className="block text-3xl font-extrabold text-emerald-700 font-mono">
                  ${dcfResult?.intrinsic_value_per_share ? dcfResult.intrinsic_value_per_share.toFixed(2) : '0.00'}
                </span>
                <span className="block text-[11px] font-bold text-emerald-800">
                  Fair Value Estimate
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-indigo-300 shadow-md space-y-1">
                <span className="text-xs font-mono font-bold text-slate-600 uppercase">Enterprise Value</span>
                <span className="block text-3xl font-extrabold text-indigo-900 font-mono">
                  {formatBillionOrMillion(dcfResult?.enterprise_value)}
                </span>
                <span className="block text-[11px] font-bold text-indigo-700">
                  PV(FCF) + PV(Terminal Value)
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-amber-300 shadow-md space-y-1">
                <span className="text-xs font-mono font-bold text-slate-600 uppercase">Equity Value</span>
                <span className="block text-3xl font-extrabold text-amber-800 font-mono">
                  {formatBillionOrMillion(dcfResult?.equity_value)}
                </span>
                <span className="block text-[11px] font-bold text-amber-700">
                  EV + Cash - Debt
                </span>
              </div>
            </div>

            {/* Mathematical Equation & Calculation Steps Box */}
            <div className="p-6 rounded-2xl bg-white border border-amber-300 shadow-md space-y-4 text-xs font-bold text-slate-900">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Mathematical Valuation Breakdown
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                  <span className="text-slate-800 uppercase font-extrabold font-mono text-[10px] block">1. Terminal Value Equation</span>
                  <p className="font-mono text-indigo-900 text-xs">
                    TV = [FCF₅ × (1 + g_term)] / (WACC - g_term)
                  </p>
                  <p className="text-[11px] text-slate-700">
                    Terminal Value of <strong>{formatBillionOrMillion(dcfResult?.terminal_value)}</strong> discounted to PV at WACC <strong>{(discountRate * 100).toFixed(1)}%</strong> = <strong>{formatBillionOrMillion(dcfResult?.pv_terminal_value)}</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                  <span className="text-slate-800 uppercase font-extrabold font-mono text-[10px] block">2. Per-Share Intrinsic Value</span>
                  <p className="font-mono text-indigo-900 text-xs">
                    Intrinsic/Share = Equity Value ($M) / Shares ($M)
                  </p>
                  <p className="text-[11px] text-slate-700">
                    ({formatBillionOrMillion(dcfResult?.equity_value)} Equity Value) ÷ ({sharesOutstanding.toLocaleString()}M Shares) = <strong>${dcfResult?.intrinsic_value_per_share ? dcfResult.intrinsic_value_per_share.toFixed(2) : '0.00'} / Share</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Monte Carlo Fan Chart & Quant Metrics */
        <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">100+ Trajectory Monte Carlo Portfolio Simulator</h3>
              <p className="text-xs font-bold text-slate-700">Geometric Brownian Motion (GBM) stochastic price path trajectories</p>
            </div>

            <button
              onClick={runMonteCarloBackend}
              disabled={loadingMc}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              {loadingMc ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <Activity className="w-4 h-4 text-amber-400" />}
              <span>Run 100+ Trajectories</span>
            </button>
          </div>

          <div className="h-80 w-full pt-4">
            {mcResult?.chart_lines && mcResult.chart_lines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mcResult.chart_lines}>
                  <RechartsGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#3b82f6', color: '#FFF', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="p10" stroke="#f43f5e" strokeWidth={2} dot={false} name="10th Percentile (Bear)" />
                  <Line type="monotone" dataKey="p50" stroke="#6366f1" strokeWidth={2.5} dot={false} name="50th Percentile (Median)" />
                  <Line type="monotone" dataKey="p90" stroke="#10b981" strokeWidth={2} dot={false} name="90th Percentile (Bull)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-indigo-700 font-bold space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                <span>Running 100+ Monte Carlo stochastic simulations...</span>
              </div>
            )}
          </div>

          {/* Quant Statistics Cards */}
          {mcResult?.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300">
                <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Median Outcome</span>
                <span className="block mt-1 text-xl font-extrabold text-slate-900 font-mono">
                  ${mcResult.stats.median_final_value ? mcResult.stats.median_final_value.toLocaleString() : '0'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300">
                <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">5th Percentile (VaR 95%)</span>
                <span className="block mt-1 text-xl font-extrabold text-rose-700 font-mono">
                  ${mcResult.stats.p5_final_value ? mcResult.stats.p5_final_value.toLocaleString() : '0'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300">
                <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">95th Percentile (Bull)</span>
                <span className="block mt-1 text-xl font-extrabold text-emerald-700 font-mono">
                  ${mcResult.stats.p95_final_value ? mcResult.stats.p95_final_value.toLocaleString() : '0'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300">
                <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Probability of Profit</span>
                <span className="block mt-1 text-xl font-extrabold text-indigo-700 font-mono">
                  {mcResult.stats.profit_probability || '0'}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
