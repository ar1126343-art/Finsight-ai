import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  RefreshCw, 
  Trash2, 
  PieChart as PieChartIcon, 
  DollarSign, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Building2,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Transaction {
  id: string;
  date: string;
  title: string;
  category: string;
  type: string;
  amount: number;
  source: string;
}

export const ExpenseTracker: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncingPlaid, setSyncingPlaid] = useState(false);
  const [plaidSuccess, setPlaidSuccess] = useState(false);

  // Form State for Manual Input
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finance/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Fetch transactions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid merchant title and positive amount.");
      return;
    }

    setSaving(true);
    const currentDate = new Date().toISOString().split('T')[0];

    try {
      const payload = {
        title: title.trim(),
        category,
        type,
        amount: numericAmount,
        date: currentDate
      };

      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resData = await res.json();
        const createdTx: Transaction = resData.transaction || {
          id: resData.id || `tx-${Date.now()}`,
          date: currentDate,
          title: title.trim(),
          category,
          type,
          amount: numericAmount,
          source: 'manual'
        };

        setTransactions((prev) => [createdTx, ...prev]);

        // Reset form & close modal
        setShowAddModal(false);
        setTitle('');
        setAmount('');
        setCategory('Groceries');
        setType('expense');

        fetchTransactions();
      } else {
        alert("Failed to save transaction. Please check server connection.");
      }
    } catch (err) {
      console.error("Error saving transaction:", err);
      alert("Error saving transaction.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      await fetch(`/api/finance/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Clear all transactions and start fresh with blank 0 numbers?")) {
      try {
        setTransactions([]);
        await fetch('/api/finance/transactions/clear-all', { method: 'POST' });
        fetchTransactions();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePlaidSync = async () => {
    setSyncingPlaid(true);
    try {
      const res = await fetch('/api/finance/transactions/plaid-sync', { method: 'POST' });
      if (res.ok) {
        setPlaidSuccess(true);
        setTimeout(() => setPlaidSuccess(false), 3000);
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingPlaid(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/finance/transactions/upload-csv', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100
  }));

  const COLORS = ['#10b981', '#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 text-white space-y-1">
          <span className="block text-xs font-extrabold text-slate-100">{data.name}</span>
          <span className="block text-sm font-extrabold text-emerald-400 font-mono">
            ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="block text-[10px] text-slate-300 font-mono">
            {totalExpense > 0 ? ((data.value / totalExpense) * 100).toFixed(1) : 0}% of Total Expenses
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            Personal Expenses & <span className="text-indigo-600 font-extrabold">Bank Account Sync</span>
          </h2>
          <p className="text-sm font-bold text-slate-700">
            Enter custom income & expenses, wipe demo data to start blank, or import bank statements.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Manual Entry Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add My Transaction</span>
          </button>

          {/* Clear All */}
          {transactions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
              title="Clear all demo numbers and start blank"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Demo Entries</span>
            </button>
          )}

          {/* Plaid Sync Sandbox */}
          <button
            onClick={handlePlaidSync}
            disabled={syncingPlaid}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {syncingPlaid ? (
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            ) : plaidSuccess ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Building2 className="w-4 h-4 text-indigo-600" />
            )}
            <span>{plaidSuccess ? 'Bank Synced!' : 'Plaid Bank Sandbox'}</span>
          </button>

          {/* CSV Import */}
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs shadow-sm cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* KPI Cards - High Contrast Crystal Clear */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-emerald-300 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Monthly Income</span>
            <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="block mt-2 text-3xl font-extrabold text-emerald-700 font-mono">
            ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-rose-300 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Monthly Expenses</span>
            <ArrowDownCircle className="w-5 h-5 text-rose-600" />
          </div>
          <span className="block mt-2 text-3xl font-extrabold text-rose-700 font-mono">
            ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-indigo-300 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Net Cash Flow</span>
            <DollarSign className="w-5 h-5 text-indigo-600" />
          </div>
          <span className={`block mt-2 text-3xl font-extrabold font-mono ${netSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            ${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-amber-300 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Savings Rate</span>
            <PieChartIcon className="w-5 h-5 text-amber-600" />
          </div>
          <span className="block mt-2 text-3xl font-extrabold text-amber-700 font-mono">
            {savingsRate}%
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Crystal Clear Donut Chart */}
        <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Category Spending Breakdown</h3>
              <p className="text-xs font-bold text-slate-600">Visual expenditure distribution</p>
            </div>
            <span className="px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-mono font-extrabold">
              {chartData.length} Categories
            </span>
          </div>

          <div className="h-72 w-full relative flex items-center justify-center">
            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-mono text-slate-600 uppercase font-bold tracking-wider">Total Spent</span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-500" />
                <p className="text-sm font-extrabold text-slate-900">No expenses logged yet.</p>
                <p className="text-xs font-bold text-slate-700">Click <strong>"Add My Transaction"</strong> above to fill in your real numbers!</p>
              </div>
            )}
          </div>

          {/* Legend Chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {chartData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-300 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-900 font-extrabold">{item.name}:</span>
                <span className="font-mono text-indigo-700 font-extrabold">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Transaction History</h3>
            <span className="text-xs font-mono font-extrabold text-indigo-700">{transactions.length} records</span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-amber-50/50 rounded-xl border border-dashed border-amber-300">
              <DollarSign className="w-10 h-10 text-indigo-600 mx-auto" />
              <h4 className="text-base font-extrabold text-slate-900">Start Fresh with Your Own Numbers</h4>
              <p className="text-xs font-bold text-slate-700 max-w-sm mx-auto">
                No transactions are logged right now. Click the button below to add your actual income and expenses!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-md hover:bg-indigo-900 transition-colors"
              >
                + Add First Transaction
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-900 text-white uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Merchant / Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900 font-bold">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-700">{tx.date}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{tx.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-900 font-bold">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                          tx.source === 'plaid_sync' 
                            ? 'bg-teal-100 text-teal-900 border border-teal-300' 
                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}>
                          {tx.source === 'plaid_sync' ? 'Plaid Sync' : 'Manual'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-extrabold ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-300 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-xl font-extrabold text-slate-900">Add Custom Transaction</h3>
            
            <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Title / Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salary Paycheck, Amazon, Rent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-extrabold focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Dining & Drinks">Dining & Drinks</option>
                  <option value="Electronics & Tech">Electronics & Tech</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Health & Fitness">Health & Fitness</option>
                  <option value="Income">Income</option>
                  <option value="Investments">Investments</option>
                  <option value="General">General</option>
                </select>
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
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{saving ? 'Saving...' : 'Save Transaction'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
