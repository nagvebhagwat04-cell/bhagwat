import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  Scale,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

const CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Housing',
  'Groceries',
  'Utilities',
  'Transportation',
  'Dining Out',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other',
];

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: 'Groceries',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.transactions.getAll();
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const openAddModal = () => {
    setEditingTx(null);
    setFormData({
      type: 'expense',
      category: 'Groceries',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      type: tx.type,
      category: tx.category,
      amount: String(tx.amount),
      description: tx.description,
      date: new Date(tx.date).toISOString().split('T')[0],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingTx) {
        await api.transactions.update(editingTx._id, {
          type: formData.type,
          category: formData.category,
          amount: amountNum,
          description: formData.description,
          date: formData.date,
        });
      } else {
        await api.transactions.create({
          type: formData.type,
          category: formData.category,
          amount: amountNum,
          description: formData.description,
          date: formData.date,
        });
      }
      setIsModalOpen(false);
      await fetchTransactions();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.transactions.delete(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    }
  };

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const desc = (tx.description || '').toLowerCase();
      const cat = tx.category.toLowerCase();
      if (!desc.includes(q) && !cat.includes(q)) return false;
    }
    return true;
  });

  // Totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Transactions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Record, classify, and track your financial cash inflows and outflows</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Income</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Expenses</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">${totalExpense.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Net Flow</span>
            <p className={`text-xl font-bold mt-0.5 ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netCashFlow < 0 ? '-' : '+'}${Math.abs(netCashFlow).toLocaleString()}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netCashFlow >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <Scale className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2 py-1 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2 py-1 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSpinner message="Fetching transactions..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No transactions found"
          description={
            transactions.length === 0
              ? 'Start recording your income and expenses to unlock budget analysis and AI insights.'
              : 'No transactions match your current filters.'
          }
          actionText={transactions.length === 0 ? 'Add First Transaction' : undefined}
          onAction={openAddModal}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {tx.description || tx.category}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wide ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTx ? 'Edit Transaction' : 'Record Transaction'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  formData.type === 'expense'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  formData.type === 'income'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Income (+)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Whole Foods groceries, monthly internet bill"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingTx ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
