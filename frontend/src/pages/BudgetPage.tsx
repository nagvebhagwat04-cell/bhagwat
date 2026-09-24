import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Save,
} from 'lucide-react';
import { api } from '../services/api';
import { BudgetSpendingResponse } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const DEFAULT_CATEGORIES = [
  'Housing',
  'Groceries',
  'Utilities',
  'Transportation',
  'Dining Out',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
];

export const BudgetPage: React.FC = () => {
  const [data, setData] = useState<BudgetSpendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const selectedYear = now.getFullYear();

  // Category limits editing state
  const [categoryLimits, setCategoryLimits] = useState<Array<{ category: string; limit: number }>>([]);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await api.budget.get(selectedMonth, selectedYear);
      if (res.success && res.data) {
        setData(res.data);
        const existing = res.data.budget.categoryLimits || [];
        // Ensure default categories are represented
        const merged = [...existing];
        for (const cat of DEFAULT_CATEGORIES) {
          if (!merged.some((c) => c.category.toLowerCase() === cat.toLowerCase())) {
            merged.push({ category: cat, limit: 0 });
          }
        }
        setCategoryLimits(merged);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch budget');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth, selectedYear]);

  const handleLimitChange = (index: number, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    const updated = [...categoryLimits];
    updated[index].limit = num;
    setCategoryLimits(updated);
  };

  const handleSaveBudget = async () => {
    try {
      setSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const activeLimits = categoryLimits.filter((c) => c.limit > 0);
      const computedTotal = activeLimits.reduce((sum, c) => sum + c.limit, 0);

      await api.budget.save({
        month: selectedMonth,
        year: selectedYear,
        categoryLimits: activeLimits,
        totalBudget: computedTotal,
      });

      setSuccessMessage('Monthly budget targets saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchBudget();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save budget targets');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading monthly budget..." />;
  }

  const spending = data?.spending;
  const totalBudget = categoryLimits.reduce((sum, c) => sum + (c.limit || 0), 0);
  const totalSpent = spending?.totalSpent || 0;
  const remaining = totalBudget - totalSpent;
  const overallUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Budget Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control category limits and prevent overspending with real-time utilization</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>

          <button
            onClick={handleSaveBudget}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Targets'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Planned Monthly Cap</span>
          <p className="text-xl font-bold text-slate-900 mt-1">${totalBudget.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Sum of active category limits</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Month-to-Date Outlays</span>
          <p className="text-xl font-bold text-slate-900 mt-1">${totalSpent.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[11px] font-semibold ${overallUtilization > 100 ? 'text-rose-600' : overallUtilization >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {overallUtilization}% utilized
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Remaining Budget</span>
          <p className={`text-xl font-bold mt-1 ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {remaining < 0 ? 'Over budget limit' : 'Available for remaining days'}
          </p>
        </div>
      </div>

      {/* Category Limits & Utilization Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Category Budgets & Actual Utilization</h3>
            <p className="text-xs text-slate-400">Configure monthly limits for each expenditure bucket</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {categoryLimits.filter(c => c.limit > 0).length} categories budgeted
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryLimits.map((catLimit, idx) => {
            const spent = spending?.categorySpent[catLimit.category] || 0;
            const pct = catLimit.limit > 0 ? Math.round((spent / catLimit.limit) * 100) : 0;
            const isOver = spent > catLimit.limit && catLimit.limit > 0;
            const isWarning = pct >= 80 && !isOver;

            return (
              <div
                key={catLimit.category}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800">{catLimit.category}</span>
                    {isOver && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        Over Limit
                      </span>
                    )}
                    {isWarning && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        80%+ Warning
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">Limit: $</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={catLimit.limit || ''}
                      placeholder="0"
                      onChange={(e) => handleLimitChange(idx, e.target.value)}
                      className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Spent: ${spent.toLocaleString()}</span>
                    <span>{pct}% utilized</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
