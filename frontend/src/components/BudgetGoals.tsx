import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Sparkles,
  Plus
} from 'lucide-react';

export const BudgetGoals: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Goal Calculator State
  const [savingsTarget, setSavingsTarget] = useState<number>(50000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1500);
  const [expectedReturn, setExpectedReturn] = useState<number>(0.08);

  // Form State
  const [category, setCategory] = useState('Groceries');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/finance/budget-goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAmount) return;

    try {
      const res = await fetch('/api/finance/budget-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          target_amount: parseFloat(targetAmount),
          current_amount: parseFloat(currentAmount) || 0
        })
      });
      if (res.ok) {
        setShowModal(false);
        setTargetAmount('');
        setCurrentAmount('');
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Savings Calculator Math
  const calculateMonthsToGoal = () => {
    if (monthlyContribution <= 0) return 0;
    const r = expectedReturn / 12;
    let months = 0;
    let balance = 0;
    while (balance < savingsTarget && months < 360) {
      balance = (balance + monthlyContribution) * (1 + r);
      months++;
    }
    return months;
  };

  const monthsNeeded = calculateMonthsToGoal();
  const yearsNeeded = (monthsNeeded / 12).toFixed(1);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 font-sans">
            Budget Planning & <span className="gradient-text">Goal Savings Calculator</span>
          </h2>
          <p className="text-sm text-slate-400">
            Set monthly category budgets and calculate compound savings milestones.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Grid: Category Budget Meters & Savings Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Budget Meters */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">Category Budget Progress</h3>
            </div>
            <span className="text-xs font-mono text-cyan-400">{goals.length} Categories</span>
          </div>

          <div className="space-y-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
              return (
                <div key={g.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-100">{g.category}</span>
                    <span className="font-mono text-slate-400">
                      ${g.current_amount} / ${g.target_amount} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compound Savings Goal Calculator */}
        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">Savings Milestone Calculator</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Savings Goal ($)</label>
                <input
                  type="number"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(parseFloat(e.target.value) || 10000)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Monthly Contribution ($)</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 500)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Expected Annual Return %</span>
                  <span className="font-mono text-cyan-400">{(expectedReturn * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.15"
                  step="0.005"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-500/30 text-center space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase block">Estimated Time to Reach Goal</span>
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">
              {monthsNeeded} Months ({yearsNeeded} Years)
            </span>
            <p className="text-[11px] text-slate-400">
              Assuming compounded growth at {(expectedReturn * 100).toFixed(1)}% per annum.
            </p>
          </div>
        </div>
      </div>

      {/* Set Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-cyan-500/40 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Set Category Budget Target</h3>
            
            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Dining & Drinks">Dining & Drinks</option>
                  <option value="Electronics & Tech">Electronics & Tech</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Health & Fitness">Health & Fitness</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Monthly Budget ($)</label>
                <input
                  type="number"
                  required
                  placeholder="500.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Current Month Spent ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-md"
                >
                  Save Budget Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
