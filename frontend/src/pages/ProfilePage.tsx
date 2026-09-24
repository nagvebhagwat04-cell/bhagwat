import React, { useEffect, useState } from 'react';
import {
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ageRange: '25-34',
    occupation: '',
    monthlyIncome: '',
    financialKnowledge: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    riskProfile: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        ageRange: user.ageRange || '25-34',
        occupation: user.occupation || '',
        monthlyIncome: String(user.monthlyIncome || 0),
        financialKnowledge: user.financialKnowledge || 'beginner',
        riskProfile: user.riskProfile || 'moderate',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const incomeNum = parseFloat(formData.monthlyIncome);
    if (isNaN(incomeNum) || incomeNum < 0) {
      setError('Please provide a valid non-negative monthly income.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: formData.name,
        ageRange: formData.ageRange,
        occupation: formData.occupation,
        monthlyIncome: incomeNum,
        financialKnowledge: formData.financialKnowledge,
        riskProfile: formData.riskProfile,
      });
      setSuccess('Financial profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Financial Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Your profile informs deterministic calculations and shapes personalized AI advisory context
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Account ID)</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age Range</label>
              <select
                value={formData.ageRange}
                onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="18-24">18 - 24 years</option>
                <option value="25-34">25 - 34 years</option>
                <option value="35-44">35 - 44 years</option>
                <option value="45-54">45 - 54 years</option>
                <option value="55+">55+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g. Software Engineer, Consultant, Student"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Financial Preferences */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Financial Parameters & Risk Preference
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Baseline Monthly Take-Home Income ($ USD)
              </label>
              <input
                type="number"
                step="50"
                min="0"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Used to calculate monthly surplus and savings rate benchmarks
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Financial Knowledge Level
              </label>
              <select
                value={formData.financialKnowledge}
                onChange={(e) => setFormData({ ...formData, financialKnowledge: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="beginner">Beginner (Learning the basics)</option>
                <option value="intermediate">Intermediate (Comfortable with budgeting/investing)</option>
                <option value="advanced">Advanced (Experienced with diversified assets)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Risk Profile (Informs AI Advisory Guidance)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'conservative',
                  title: 'Conservative',
                  desc: 'Focus on capital preservation, debt payoff, and emergency liquidity.',
                },
                {
                  id: 'moderate',
                  title: 'Moderate',
                  desc: 'Balanced approach combining safety reserves with diversified growth.',
                },
                {
                  id: 'aggressive',
                  title: 'Aggressive',
                  desc: 'High risk tolerance, longer time horizon, growth-oriented investing.',
                },
              ].map((r) => (
                <div
                  key={r.id}
                  onClick={() => setFormData({ ...formData, riskProfile: r.id as any })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.riskProfile === r.id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold text-xs text-slate-800">{r.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Updating Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
