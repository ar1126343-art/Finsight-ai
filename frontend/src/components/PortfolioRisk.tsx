import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  CheckCircle,
  AlertCircle,
  Activity,
  Layers
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  avg_price: number;
  sector: string;
  current_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_gain: number;
  unrealized_gain_pct: number;
  day_change_pct: number;
  pe_ratio: number;
  rsi: number;
}

export const PortfolioRisk: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add holding form state
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [sector, setSector] = useState('Technology');

  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      const [resPf, resRisk] = await Promise.all([
        fetch('/api/finance/portfolio'),
        fetch('/api/finance/portfolio/risk-analysis')
      ]);

      if (resPf.ok) {
        const data = await resPf.json();
        setPortfolio(data.holdings || []);
        setSummary(data.summary || null);
      }

      if (resRisk.ok) {
        const rData = await resRisk.json();
        setRiskData(rData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !shares || !avgPrice) return;

    try {
      const res = await fetch('/api/finance/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.toUpperCase().trim(),
          shares: parseFloat(shares),
          avg_price: parseFloat(avgPrice),
          sector
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setTicker('');
        setShares('');
        setAvgPrice('');
        fetchPortfolioData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (t: string) => {
    try {
      await fetch(`/api/finance/portfolio/${t}`, { method: 'DELETE' });
      fetchPortfolioData();
    } catch (err) {
      console.error(err);
    }
  };

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 text-white space-y-1">
          <span className="block text-xs font-extrabold text-slate-100">{data.name}</span>
          <span className="block text-sm font-extrabold text-emerald-400 font-mono">
            {data.value}% Portfolio Exposure
          </span>
        </div>
      );
    }
    return null;
  };

  const sectorChartData = riskData?.sector_exposure?.map((item: any) => ({
    name: item.sector,
    value: item.weight_pct
  })) || [];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            Portfolio Tracker & <span className="text-indigo-600 font-extrabold">Institutional Risk Score</span>
          </h2>
          <p className="text-sm font-bold text-slate-700">
            Real-time equity holdings, market values, concentration risk, and sector exposure.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-md">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Portfolio Value</span>
          <span className="block mt-2 text-3xl font-extrabold text-slate-900 font-mono">
            ${summary?.total_value?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-emerald-300 shadow-md">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Unrealized Gain</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-extrabold font-mono ${
              (summary?.total_gain || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              ${summary?.total_gain?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </span>
            <span className="text-sm font-extrabold font-mono text-emerald-700">
              ({summary?.total_gain_pct || 0}%)
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-indigo-300 shadow-md">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Institutional Risk Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-900 font-mono">
              {riskData?.risk_score_num || 0} / 100
            </span>
            <span className="text-xs font-extrabold text-indigo-700">
              {riskData?.risk_label || 'Moderate'}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-amber-300 shadow-md">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Est. Portfolio Beta</span>
          <span className="block mt-2 text-3xl font-extrabold text-amber-800 font-mono">
            {riskData?.metrics?.beta_est || '1.28'}
          </span>
        </div>
      </div>

      {/* Main Grid: Holdings Table & Glowing Donut Risk Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Holdings Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Current Equity Holdings</h3>
            <span className="text-xs font-mono font-bold text-indigo-700">{portfolio.length} positions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Ticker</th>
                  <th className="py-3 px-4">Shares</th>
                  <th className="py-3 px-4">Avg Cost</th>
                  <th className="py-3 px-4">Current Price</th>
                  <th className="py-3 px-4">Market Value</th>
                  <th className="py-3 px-4 text-right">Unrealized P&L</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900 font-bold">
                {portfolio.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 font-mono">{h.ticker}</td>
                    <td className="py-3.5 px-4 font-mono">{h.shares}</td>
                    <td className="py-3.5 px-4 font-mono">${h.avg_price.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono">${h.current_price.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono font-extrabold">${h.market_value.toLocaleString()}</td>
                    <td className={`py-3.5 px-4 text-right font-mono font-extrabold ${
                      h.unrealized_gain >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {h.unrealized_gain >= 0 ? '+' : ''}${h.unrealized_gain.toFixed(2)} ({h.unrealized_gain_pct}%)
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(h.ticker)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Exposure Glowing Donut Chart */}
        <div className="p-6 rounded-2xl bg-white border border-amber-300 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Sector Concentration</h3>
            <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold">
              Risk Weighting
            </span>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center">
            {sectorChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                    >
                      {sectorChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-mono text-slate-600 uppercase font-bold tracking-wider">Top Sector</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {sectorChartData[0]?.name || 'N/A'}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-bold">
                No portfolio positions.
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs font-bold">
            {riskData?.concentration?.slice(0, 3).map((c: any) => (
              <div key={c.ticker} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-mono font-extrabold text-slate-900">${c.ticker} Weight:</span>
                <span className="font-mono text-indigo-700 font-extrabold">{c.weight_pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-300 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-xl font-extrabold text-slate-900">Add Portfolio Position</h3>
            
            <form onSubmit={handleAddHolding} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Ticker Symbol</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AAPL, NVDA"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono uppercase focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Shares Owned</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Avg Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold shadow-md cursor-pointer"
                >
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
