import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Sparkles,
  ArrowRight,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#a78bfa'];

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.dashboard.get();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating financial metrics & aggregating data..." />;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center glass-card">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-white">Unable to load dashboard</h3>
        <p className="text-sm text-slate-400 mb-4">{error || 'Something went wrong.'}</p>
        <button
          onClick={fetchDashboard}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { metrics, budgetUtilization, categorySpending, goals, recentTransactions, cashFlowTrend, aiSummary } = data;

  const pieData = Object.entries(categorySpending).map(([name, value]) => ({
    name,
    value,
  }));

  const savingsRateVariant = metrics.savingsRate >= 20 ? 'success' : metrics.savingsRate > 0 ? 'warning' : 'danger';
  const surplusVariant = metrics.monthlySavings >= 0 ? 'success' : 'danger';

  return (
    <div className="space-y-6 stagger">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Financial Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time deterministic cash flow & advisory metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="add-transaction-btn"
            onClick={() => navigate('/transactions')}
            className="btn-secondary text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Add Transaction
          </button>
          <button
            id="consult-adviser-btn"
            onClick={() => navigate('/ai')}
            className="btn-primary text-xs"
          >
            <Sparkles className="w-4 h-4" />
            Consult AI
          </button>
        </div>
      </div>

      {/* Top 4 Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger animate-fade-in">
        <MetricCard
          title="Monthly Income"
          value={`$${metrics.monthlyIncome.toLocaleString()}`}
          subValue="Baseline profile & verified inflows"
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Monthly Expenses"
          value={`$${metrics.monthlyExpenses.toLocaleString()}`}
          subValue="Recorded month-to-date outlays"
          icon={TrendingDown}
          variant={metrics.monthlyExpenses > metrics.monthlyIncome ? 'danger' : 'default'}
        />
        <MetricCard
          title="Monthly Savings"
          value={`${metrics.monthlySavings < 0 ? '-' : ''}$${Math.abs(metrics.monthlySavings).toLocaleString()}`}
          subValue={metrics.monthlySavings >= 0 ? 'Surplus ready for goals' : 'Deficit — tighten budget'}
          icon={PiggyBank}
          badge={metrics.monthlySavings >= 0 ? 'Surplus' : 'Deficit'}
          variant={surplusVariant}
        />
        <MetricCard
          title="Savings Rate"
          value={`${metrics.savingsRate}%`}
          subValue="Target: 20% or higher"
          icon={Percent}
          badge={metrics.savingsRate >= 20 ? 'Optimal' : metrics.savingsRate > 0 ? 'Building' : 'Deficit'}
          variant={savingsRateVariant}
        />
      </div>

      {/* AI Financial Summary Banner */}
      <div className="glass-card p-5 sm:p-6 relative overflow-hidden border-emerald-500/20 animate-fade-in">
        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">AI Context Advisor Summary</span>
              <button
                onClick={() => navigate('/ai')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 group transition-colors"
              >
                Deep-dive with Assistant
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {aiSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Income vs. Expense History</h3>
              <p className="text-xs text-slate-400">Monthly cash flow trends</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded bg-slate-500" /> Expense
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: '12px' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="expenses" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Spending by Category</h3>
            <p className="text-xs text-slate-400 mb-2">Proportion of outlays</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Spent']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs">
                No expense transactions recorded yet this month.
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-white/8 flex items-center justify-between text-xs">
            <span className="text-slate-400">6-Month Emergency Target:</span>
            <span className="font-semibold text-emerald-400">${metrics.emergencyFund6Months.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Budget Utilization */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Monthly Budget Utilization</h3>
              <p className="text-xs text-slate-400">Total planned cap vs. current spending</p>
            </div>
            <button
              onClick={() => navigate('/budget')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              Configure <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-slate-300">
                  ${budgetUtilization.totalSpent.toLocaleString()} of ${budgetUtilization.totalBudget.toLocaleString()} Spent
                </span>
                <span className={`font-bold ${budgetUtilization.status === 'exceeded' ? 'text-red-400' : budgetUtilization.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {budgetUtilization.utilizationRate}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, budgetUtilization.utilizationRate)}%`,
                    background: budgetUtilization.status === 'exceeded' ? '#ef4444' : budgetUtilization.status === 'warning' ? '#f59e0b' : 'linear-gradient(90deg,#10b981,#6ee7b7)',
                    boxShadow: `0 0 8px ${budgetUtilization.status === 'exceeded' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/8">
                <span className="text-[11px] font-medium text-slate-400">Remaining</span>
                <p className={`text-base font-bold mt-0.5 ${budgetUtilization.remaining < 0 ? 'text-red-400' : 'text-white'}`}>
                  ${budgetUtilization.remaining.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/8">
                <span className="text-[11px] font-medium text-slate-400">Status</span>
                <p className="text-base font-bold text-white capitalize mt-0.5">
                  {budgetUtilization.status.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Active Financial Goals</h3>
              <p className="text-xs text-slate-400">Deterministic monthly savings requirements</p>
            </div>
            <button
              onClick={() => navigate('/goals')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              Manage Goals <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {goals.length > 0 ? (
              goals.slice(0, 3).map((goal) => (
                <div key={goal._id || goal.name} className="p-3 rounded-xl bg-white/5 border border-white/8">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">{goal.name}</span>
                    <span className="text-emerald-400 font-bold">
                      ${goal.monthlyRequired?.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span>${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}</span>
                    <span>{goal.percentageComplete}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(100, goal.percentageComplete || 0)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No goals created yet. Set a financial target to calculate required monthly savings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-card p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest recorded income and expenses</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/8">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/4 transition-colors">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {tx.description || tx.category}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-white/8 text-slate-300 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wide ${
                          tx.type === 'income'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-slate-500/15 text-slate-400'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-bold whitespace-nowrap ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No transactions found. Click "Add Transaction" to start tracking.
          </div>
        )}
      </div>
    </div>
  );
};
