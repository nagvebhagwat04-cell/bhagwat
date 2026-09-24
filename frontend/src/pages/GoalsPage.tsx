import React, { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
} from 'lucide-react';
import { api } from '../services/api';
import { Goal } from '../types';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'General',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.goals.getAll();
      if (res.success && res.data) {
        setGoals(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openAddModal = () => {
    setEditingGoal(null);
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 12);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: futureDate.toISOString().split('T')[0],
      category: 'General',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      category: goal.category || 'General',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const targetNum = parseFloat(formData.targetAmount);
    const currentNum = parseFloat(formData.currentAmount || '0');

    if (isNaN(targetNum) || targetNum <= 0) {
      setFormError('Target amount must be a positive number greater than 0.');
      return;
    }
    if (isNaN(currentNum) || currentNum < 0) {
      setFormError('Current saved amount cannot be negative.');
      return;
    }
    if (!formData.targetDate) {
      setFormError('Please select a valid target deadline.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingGoal) {
        await api.goals.update(editingGoal._id, {
          name: formData.name,
          targetAmount: targetNum,
          currentAmount: currentNum,
          targetDate: formData.targetDate,
          category: formData.category,
        });
      } else {
        await api.goals.create({
          name: formData.name,
          targetAmount: targetNum,
          currentAmount: currentNum,
          targetDate: formData.targetDate,
          category: formData.category,
        });
      }
      setIsModalOpen(false);
      await fetchGoals();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.goals.delete(id);
      setGoals((prev) => prev.filter((g) => g._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalMonthlyNeeded = goals.reduce((sum, g) => sum + (g.monthlyRequired || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Financial Goals</h2>
          <p className="text-xs text-slate-500 mt-0.5">Deterministic target contribution forecasting & milestone tracking</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Saved Across Goals</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">${totalSaved.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Accumulated principal balance</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Cumulative Target</span>
          <p className="text-xl font-bold text-slate-900 mt-1">${totalTarget.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}% achieved overall
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Monthly Savings Needed</span>
          <p className="text-xl font-bold text-slate-900 mt-1">${totalMonthlyNeeded.toLocaleString()}/mo</p>
          <p className="text-[11px] text-slate-400 mt-1">Required deterministic contribution</p>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Calculating goal contributions..." />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No financial goals set yet"
          description="Create savings targets (e.g. Emergency Fund, New Car, Home Down Payment) and the deterministic calculation engine will automatically calculate your exact monthly requirement."
          actionText="Create Your First Goal"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const pct = goal.percentageComplete ?? (goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0);

            return (
              <div
                key={goal._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {goal.category || 'General'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{goal.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Target Achieved
                      </span>
                    ) : goal.isExpired ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Target Date Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Deadline: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-900 text-lg">
                      ${goal.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-slate-500">of ${goal.targetAmount.toLocaleString()}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Bottom Calculation Box */}
                <div className="pt-3 border-t border-slate-100 bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Monthly Needed:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {isCompleted ? '$0/mo' : `$${goal.monthlyRequired?.toLocaleString()}/mo`}
                    </span>
                  </div>
                  {goal.remainingMonths !== undefined && !isCompleted && !goal.isExpired && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {goal.remainingMonths} months remaining to reach ${(goal.targetAmount - goal.currentAmount).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Financial Goal' : 'Create Financial Goal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund (6 Months), Vacation, Car"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <input
              type="text"
              placeholder="e.g. Security, Real Estate, Leisure, Vehicle"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount ($)</label>
              <input
                type="number"
                step="1"
                required
                min="1"
                placeholder="10000"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Saved ($)</label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date (Deadline)</label>
            <input
              type="date"
              required
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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
              {submitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
