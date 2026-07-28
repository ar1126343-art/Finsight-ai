import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Radio
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface StockAnalysisProps {
  ticker?: string;
  onSelectTicker?: (ticker: string) => void;
}

export const StockAnalysis: React.FC<StockAnalysisProps> = ({ ticker: propTicker = 'AAPL', onSelectTicker }) => {
  const [ticker, setTicker] = useState(propTicker);
  const [stockData, setStockData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'price' | 'rsi' | 'macd'>('price');

  useEffect(() => {
    if (propTicker) {
      setTicker(propTicker);
      fetchStock(propTicker);
    }
  }, [propTicker]);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/ticks`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.ticker === ticker) {
          setLivePrice(data.price);
        }
      };
    } catch (e) {
      console.warn("WebSocket stream notice:", e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [ticker]);

  const fetchStock = async (sym: string) => {
    setLoadingData(true);
    try {
      const res = await fetch(`/api/stocks/${sym}`);
      if (res.ok) {
        const data = await res.json();
        setStockData(data);
        fetchAiThesis(sym);
      }
    } catch (err) {
      console.error("Fetch stock error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAiThesis = async (sym: string) => {
    setLoadingAi(true);
    try {
      const res = await fetch(`/api/stocks/${sym}/ai-thesis`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error("AI Thesis fetch error:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      if (onSelectTicker) onSelectTicker(ticker.toUpperCase().trim());
      fetchStock(ticker.toUpperCase().trim());
    }
  };

  const getLabelBadgeColor = (label: string) => {
    switch (label) {
      case 'Strong Buy':
      case 'Buy':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold';
      case 'Watchlist':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300 font-extrabold';
      case 'Avoid':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold';
      default:
        return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-extrabold';
    }
  };

  const currentPrice = livePrice || stockData?.current_price || 0;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              Real-Time Stock Analysis & <span className="text-indigo-600 font-extrabold">AI Decision Thesis</span>
            </h2>
            {/* Live Streaming Indicator Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${wsConnected ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
              <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'animate-pulse text-emerald-600' : 'text-amber-600'}`} />
              <span>{wsConnected ? 'WebSocket Live Stream' : 'Live yfinance Feed'}</span>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-700 mt-1">
            yfinance Technical indicators (MA20, MA50, MA200, RSI, MACD) + Gemini structured AI investment thesis.
          </p>
        </div>

        {/* Ticker Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search ticker (e.g. NVDA, AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-extrabold focus:border-indigo-600 focus:outline-none shadow-sm uppercase font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loadingData}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {loadingData ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <Search className="w-4 h-4 text-amber-400" />}
            <span>Analyze</span>
          </button>
        </form>
      </div>

      {/* Moving Averages Banner */}
      <div className="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-900 font-extrabold">
          <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Moving Average Definitions:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto text-slate-800 font-bold">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span><strong className="text-emerald-900 font-extrabold">MA20 (Short):</strong> 20-Day Momentum Line</span>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span><strong className="text-indigo-900 font-extrabold">MA50 (Medium):</strong> 50-Day Trend Line</span>
          </div>
          <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span><strong className="text-rose-900 font-extrabold">MA200 (Long):</strong> 200-Day Macro Line</span>
          </div>
        </div>
      </div>

      {/* Stock Overview Header Card */}
      {stockData && (
        <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-md grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">Company</span>
            <h3 className="text-2xl font-extrabold text-slate-900 font-sans mt-0.5">{stockData.company_name}</h3>
            <span className="text-xs font-mono font-bold text-indigo-700">{stockData.ticker} • {stockData.sector}</span>
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">Real-Time Price</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                ${currentPrice.toFixed(2)}
              </span>
              <span className={`text-sm font-extrabold font-mono flex items-center ${stockData.change_pct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                {stockData.change_pct >= 0 ? <TrendingUp className="w-4 h-4 mr-0.5" /> : <TrendingDown className="w-4 h-4 mr-0.5" />}
                {stockData.change_pct >= 0 ? '+' : ''}{stockData.change_pct}%
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">P/E & Technical Status</span>
            <div className="mt-1 space-y-1 text-xs text-slate-900 font-bold">
              <div>P/E Ratio: <span className="font-mono font-extrabold text-indigo-700">{stockData.pe_ratio || 'N/A'}</span></div>
              <div>RSI (14): <span className={`font-mono font-extrabold ${stockData.rsi > 70 ? 'text-rose-700' : stockData.rsi < 30 ? 'text-emerald-700' : 'text-indigo-700'}`}>{stockData.rsi}</span></div>
            </div>
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">Support & Resistance</span>
            <div className="mt-1 space-y-1 text-xs text-slate-900 font-bold font-mono">
              <div>Support: <span className="text-emerald-700 font-extrabold">${stockData.support_level}</span></div>
              <div>Resistance: <span className="text-rose-700 font-extrabold">${stockData.resistance_level}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Technical Chart & AI Thesis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Technical Chart Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-300 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-slate-900">Technical Price History & Indicators</h3>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-300 text-xs font-extrabold">
              <button
                onClick={() => setActiveChartTab('price')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeChartTab === 'price' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                Price & MAs
              </button>
              <button
                onClick={() => setActiveChartTab('rsi')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeChartTab === 'rsi' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                RSI (14)
              </button>
              <button
                onClick={() => setActiveChartTab('macd')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeChartTab === 'macd' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                MACD
              </button>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            {(stockData?.history || stockData?.price_history) ? (
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'price' ? (
                  <LineChart data={stockData.history || stockData.price_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748B" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#3b82f6', color: '#FFF', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#0F172A" strokeWidth={2.5} dot={false} name="Close Price" />
                    <Line type="monotone" dataKey="ma20" stroke="#10b981" strokeWidth={1.5} dot={false} name="MA20 (Short)" />
                    <Line type="monotone" dataKey="ma50" stroke="#6366f1" strokeWidth={1.5} dot={false} name="MA50 (Medium)" />
                    <Line type="monotone" dataKey="ma200" stroke="#f43f5e" strokeWidth={1.5} dot={false} name="MA200 (Long)" />
                  </LineChart>
                ) : activeChartTab === 'rsi' ? (
                  <LineChart data={stockData.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#3b82f6', color: '#FFF', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" strokeWidth={2} dot={false} name="RSI (14)" />
                  </LineChart>
                ) : (
                  <LineChart data={stockData.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748B" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#3b82f6', color: '#FFF', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="macd" stroke="#06b6d4" strokeWidth={2} dot={false} name="MACD Line" />
                    <Line type="monotone" dataKey="macd_signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Signal Line" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-bold">
                Loading stock indicators...
              </div>
            )}
          </div>
        </div>

        {/* AI Thesis Panel */}
        <div className="p-6 rounded-2xl bg-white border border-amber-300 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">Gemini AI Thesis Summary</h3>
              </div>
              {aiAnalysis?.analysis?.label && (
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-sm ${getLabelBadgeColor(aiAnalysis.analysis.label)
                  }`}>
                  {aiAnalysis.analysis.label}
                </span>
              )}
            </div>

            {loadingAi ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-700 font-extrabold font-mono">
                  Executing Gemini JSON structured analysis & saving to SQLite audit log...
                </p>
              </div>
            ) : aiAnalysis?.analysis ? (
              <div className="space-y-4 text-xs font-bold text-slate-900">
                {/* 1-Paragraph Thesis */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 space-y-1">
                  <span className="text-[10px] font-mono text-indigo-700 uppercase font-extrabold tracking-wider block">
                    Investment Thesis
                  </span>
                  <p className="text-slate-900 leading-relaxed font-sans font-bold">
                    {aiAnalysis.analysis.thesis}
                  </p>
                </div>

                {/* Why Moved & Earnings */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-300">
                    <span className="text-[10px] font-mono text-amber-900 uppercase font-extrabold block mb-1">Why Stock Moved</span>
                    <p className="text-slate-900 font-bold">{aiAnalysis.analysis.why_moved}</p>
                  </div>
                </div>

                {/* Catalysts & Risks */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1.5">
                    <span className="text-[10px] font-mono text-emerald-900 uppercase font-extrabold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" /> Catalysts
                    </span>
                    <ul className="space-y-1 text-slate-900 list-disc list-inside text-[11px] font-bold">
                      {aiAnalysis.analysis.catalysts?.map((c: string, idx: number) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 space-y-1.5">
                    <span className="text-[10px] font-mono text-rose-900 uppercase font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-700" /> Red Flags & Risks
                    </span>
                    <ul className="space-y-1 text-slate-900 list-disc list-inside text-[11px] font-bold">
                      {aiAnalysis.analysis.risks?.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="text-[10px] text-slate-600 italic font-medium">
                  {aiAnalysis.analysis.disclaimer}
                </p>
              </div>
            ) : null}
          </div>

          <button
            onClick={() => fetchAiThesis(ticker)}
            disabled={loadingAi}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Re-Generate AI Thesis & Audit Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
