import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  Search, 
  Check, 
  Sparkles, 
  TrendingUp,
  Layers,
  BarChart2
} from 'lucide-react';

interface ScreenerAndCompareProps {
  onSearchTicker?: (ticker: string) => void;
  onSelectTicker?: (ticker: string) => void;
}

export const ScreenerAndCompare: React.FC<ScreenerAndCompareProps> = ({ onSearchTicker, onSelectTicker }) => {
  const [activeTab, setActiveTab] = useState<'screener' | 'compare'>('screener');

  // Screener Filters
  const [sector, setSector] = useState('All');
  const [maxPe, setMaxPe] = useState(60);
  const [maxPb, setMaxPb] = useState(30);
  const [maxDe, setMaxDe] = useState(2.0);
  const [minGrowth, setMinGrowth] = useState(0.05);

  const [screenerResults, setScreenerResults] = useState<any[]>([]);
  const [loadingScreener, setLoadingScreener] = useState(false);

  // Compare State
  const [compareTickers, setCompareTickers] = useState<string[]>(['AAPL', 'MSFT', 'NVDA']);
  const [newTickerInput, setNewTickerInput] = useState('');
  const [compareData, setCompareData] = useState<any[]>([]);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const fetchScreener = async () => {
    setLoadingScreener(true);
    try {
      const query = `sector=${sector}&max_pe=${maxPe}&max_pb=${maxPb}&max_de=${maxDe}&min_growth=${minGrowth}`;
      const res = await fetch(`/api/stocks/screener/list?${query}`);
      if (res.ok) {
        const data = await res.json();
        setScreenerResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScreener(false);
    }
  };

  const fetchCompare = async () => {
    setLoadingCompare(true);
    try {
      const res = await fetch('/api/stocks/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers: compareTickers })
      });
      if (res.ok) {
        const data = await res.json();
        setCompareData(data.stocks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompare(false);
    }
  };

  useEffect(() => {
    fetchScreener();
  }, [sector, maxPe, maxPb, maxDe, minGrowth]);

  useEffect(() => {
    fetchCompare();
  }, [compareTickers]);

  const handleAddCompareTicker = (e: React.FormEvent) => {
    e.preventDefault();
    const t = newTickerInput.toUpperCase().trim();
    if (t && !compareTickers.includes(t)) {
      setCompareTickers([...compareTickers, t]);
      setNewTickerInput('');
    }
  };

  const handleRemoveCompareTicker = (t: string) => {
    setCompareTickers(compareTickers.filter(item => item !== t));
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            Market Discovery: <span className="text-indigo-600 font-extrabold">Stock Screener & Comparison</span>
          </h2>
          <p className="text-sm font-bold text-slate-700">
            Filter high-growth opportunities by P/E, P/B, Debt/Equity, or compare stocks side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-300 shadow-sm font-extrabold text-xs">
          <button
            onClick={() => setActiveTab('screener')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'screener'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Multi-Metric Screener</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>Side-by-Side Comparison</span>
          </button>
        </div>
      </div>

      {activeTab === 'screener' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Screener Controls Panel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-md space-y-5 text-xs font-bold text-slate-900">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-2">Filter Parameters</h3>

            <div>
              <label className="block text-slate-700 mb-1">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
              >
                <option value="All">All Sectors</option>
                <option value="Technology">Technology</option>
                <option value="Consumer Electronics">Consumer Electronics</option>
                <option value="Semiconductors">Semiconductors</option>
                <option value="Automotive">Automotive</option>
                <option value="E-Commerce">E-Commerce</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-700">Max P/E Ratio:</label>
                <span className="font-mono text-indigo-700 font-extrabold">{maxPe}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={maxPe}
                onChange={(e) => setMaxPe(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-700">Max P/B Ratio:</label>
                <span className="font-mono text-indigo-700 font-extrabold">{maxPb}</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                value={maxPb}
                onChange={(e) => setMaxPb(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-700">Min Revenue Growth:</label>
                <span className="font-mono text-indigo-700 font-extrabold">{(minGrowth * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.05"
                value={minGrowth}
                onChange={(e) => setMinGrowth(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Screener Results Table */}
          <div className="lg:col-span-3 p-6 rounded-2xl bg-white border border-slate-300 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Matching Equities</h3>
              <span className="text-xs font-mono font-bold text-indigo-700">{screenerResults.length} matches</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Ticker & Company</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">P/E</th>
                    <th className="py-3 px-4">P/B</th>
                    <th className="py-3 px-4">Rev Growth</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900 font-bold">
                  {screenerResults.map((item) => (
                    <tr key={item.ticker} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-extrabold text-slate-900 block">{item.ticker}</span>
                        <span className="text-[10px] text-slate-600 font-sans">{item.company_name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-800">{item.sector}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold">${item.price}</td>
                      <td className="py-3.5 px-4 font-mono text-indigo-700 font-extrabold">{item.pe}</td>
                      <td className="py-3.5 px-4 font-mono">{item.pb}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-700 font-extrabold">
                        +{(item.growth * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (onSelectTicker) onSelectTicker(item.ticker);
                            const el = document.getElementById('stock-analysis-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-[11px] shadow-sm transition-colors cursor-pointer"
                        >
                          Analyze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Side-by-Side Comparison Matrix */
        <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Side-by-Side Stock Metrics Matrix</h3>

            <form onSubmit={handleAddCompareTicker} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add symbol (e.g. TSLA)"
                value={newTickerInput}
                onChange={(e) => setNewTickerInput(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs uppercase focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-sm cursor-pointer"
              >
                + Add
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Metric</th>
                  {compareData.map((st) => (
                    <th key={st.ticker} className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span>{st.ticker}</span>
                        {compareData.length > 1 && (
                          <button
                            onClick={() => handleRemoveCompareTicker(st.ticker)}
                            className="text-rose-400 hover:text-rose-200 font-bold"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900 font-bold">
                <tr>
                  <td className="py-3 px-4 font-extrabold text-slate-900">Current Price</td>
                  {compareData.map(st => (
                    <td key={st.ticker} className="py-3 px-4 text-center font-mono font-extrabold">${st.price}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-extrabold text-slate-900">P/E Ratio</td>
                  {compareData.map(st => (
                    <td key={st.ticker} className="py-3 px-4 text-center font-mono text-indigo-700 font-extrabold">{st.pe_ratio}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-extrabold text-slate-900">RSI (14) Indicator</td>
                  {compareData.map(st => (
                    <td key={st.ticker} className="py-3 px-4 text-center font-mono font-extrabold">{st.rsi}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-extrabold text-slate-900">Revenue Growth</td>
                  {compareData.map(st => (
                    <td key={st.ticker} className="py-3 px-4 text-center font-mono text-emerald-700 font-extrabold">
                      +{(st.revenue_growth * 100).toFixed(1)}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
