import React, { useState } from 'react';
import {
  Calculator,
  Target,
  Scale,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import {
  EMICalculationResult,
  GoalCalculationResult,
  DTICalculationResult,
} from '../types';

export const CalculatorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'emi' | 'goal' | 'dti' | 'emergency'>('emi');

  // EMI Calculator State
  const [emiPrincipal, setEmiPrincipal] = useState<string>('50000');
  const [emiRate, setEmiRate] = useState<string>('8.5');
  const [emiTenure, setEmiTenure] = useState<string>('24');
  const [emiResult, setEmiResult] = useState<EMICalculationResult | null>(null);
  const [emiLoading, setEmiLoading] = useState(false);
  const [emiError, setEmiError] = useState<string | null>(null);

  // Goal Calculator State
  const [goalTarget, setGoalTarget] = useState<string>('25000');
  const [goalCurrent, setGoalCurrent] = useState<string>('5000');
  const futureDefaultDate = new Date();
  futureDefaultDate.setMonth(futureDefaultDate.getMonth() + 18);
  const [goalDate, setGoalDate] = useState<string>(futureDefaultDate.toISOString().split('T')[0]);
  const [goalResult, setGoalResult] = useState<GoalCalculationResult | null>(null);
  const [goalLoading, setGoalLoading] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  // DTI Calculator State
  const [dtiDebt, setDtiDebt] = useState<string>('1200');
  const [dtiIncome, setDtiIncome] = useState<string>('5500');
  const [dtiResult, setDtiResult] = useState<DTICalculationResult | null>(null);
  const [dtiLoading, setDtiLoading] = useState(false);
  const [dtiError, setDtiError] = useState<string | null>(null);

  // Emergency Fund Calculator State
  const [emgExpenses, setEmgExpenses] = useState<string>('3000');
  const [emgMonths, setEmgMonths] = useState<number>(6);
  const [emgResult, setEmgResult] = useState<{ targetAmount: number; targetMonths: number; monthlyExpenseBasis: number } | null>(null);

  // Calculate EMI
  const handleCalculateEMI = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmiError(null);
    try {
      setEmiLoading(true);
      const res = await api.calculations.emi({
        principal: parseFloat(emiPrincipal),
        annualInterestRate: parseFloat(emiRate),
        tenureMonths: parseInt(emiTenure, 10),
      });
      if (res.success && res.data) {
        setEmiResult(res.data);
      }
    } catch (err: any) {
      setEmiError(err.message || 'Calculation error');
    } finally {
      setEmiLoading(false);
    }
  };

  // Calculate Goal
  const handleCalculateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoalError(null);
    try {
      setGoalLoading(true);
      const res = await api.calculations.goal({
        targetAmount: parseFloat(goalTarget),
        currentAmount: parseFloat(goalCurrent || '0'),
        targetDate: goalDate,
      });
      if (res.success && res.data) {
        setGoalResult(res.data);
      }
    } catch (err: any) {
      setGoalError(err.message || 'Calculation error');
    } finally {
      setGoalLoading(false);
    }
  };

  // Calculate DTI
  const handleCalculateDTI = async (e: React.FormEvent) => {
    e.preventDefault();
    setDtiError(null);
    try {
      setDtiLoading(true);
      const res = await api.calculations.dti({
        monthlyDebtPayments: parseFloat(dtiDebt),
        monthlyIncome: parseFloat(dtiIncome),
      });
      if (res.success && res.data) {
        setDtiResult(res.data);
      }
    } catch (err: any) {
      setDtiError(err.message || 'Calculation error');
    } finally {
      setDtiLoading(false);
    }
  };

  // Calculate Emergency Fund
  const handleCalculateEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.calculations.emergency({
        monthlyExpenses: parseFloat(emgExpenses),
        targetMonths: emgMonths,
      });
      if (res.success && res.data) {
        setEmgResult(res.data);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Financial Calculators</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Deterministic mathematical modeling tools for loan amortizations, goal planning, and debt ratios
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'emi', label: 'Loan EMI Calculator', icon: Calculator },
          { id: 'goal', label: 'Goal Contribution Forecast', icon: Target },
          { id: 'dti', label: 'Debt-To-Income (DTI)', icon: Scale },
          { id: 'emergency', label: 'Emergency Fund', icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: EMI CALCULATOR */}
      {activeTab === 'emi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Loan Parameters</h3>
            <p className="text-xs text-slate-500 mb-5">Calculate monthly equated installment & total interest</p>

            <form onSubmit={handleCalculateEMI} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Loan Amount ($)</label>
                <input
                  type="number"
                  step="100"
                  required
                  min="1"
                  value={emiPrincipal}
                  onChange={(e) => setEmiPrincipal(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  min="0"
                  value={emiRate}
                  onChange={(e) => setEmiRate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Tenure (Months)</label>
                <input
                  type="number"
                  step="1"
                  required
                  min="1"
                  value={emiTenure}
                  onChange={(e) => setEmiTenure(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {Math.floor(parseInt(emiTenure || '0', 10) / 12)} years {parseInt(emiTenure || '0', 10) % 12} months
                </span>
              </div>

              {emiError && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{emiError}</p>
              )}

              <button
                type="submit"
                disabled={emiLoading}
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {emiLoading ? 'Calculating EMI...' : 'Compute Monthly EMI'}
              </button>
            </form>
          </div>

          {/* Results Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Repayment Breakdown</h3>
              <p className="text-xs text-slate-500 mb-6">Deterministic amortization metrics</p>

              {emiResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Monthly EMI Payment</span>
                    <p className="text-3xl font-extrabold text-emerald-700 mt-1">
                      ${emiResult.monthlyEMI.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-emerald-800/80 mt-1">For {emiResult.tenureMonths} consecutive billing cycles</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Total Interest Charged</span>
                      <p className="text-base font-bold text-rose-600 mt-0.5">
                        ${emiResult.totalInterest.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Total Cumulative Payment</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        ${emiResult.totalPayment.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Visual principal vs interest distribution */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                      <span>Principal: ${emiResult.principal.toLocaleString()} ({Math.round((emiResult.principal / emiResult.totalPayment) * 100)}%)</span>
                      <span>Interest: ${emiResult.totalInterest.toLocaleString()} ({Math.round((emiResult.totalInterest / emiResult.totalPayment) * 100)}%)</span>
                    </div>
                    <div className="w-full h-3 bg-rose-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${(emiResult.principal / emiResult.totalPayment) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Fill in your loan details and click Compute Monthly EMI to view repayment breakdown.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-6 flex items-start gap-2 text-[11px] text-slate-500">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p>Formula used: <code className="font-mono bg-slate-200/80 px-1 py-0.5 rounded">E = [P × r × (1+r)ⁿ] ÷ [(1+r)ⁿ - 1]</code></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOAL CALCULATOR */}
      {activeTab === 'goal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Target Savings Estimator</h3>
            <p className="text-xs text-slate-500 mb-5">Calculate required monthly savings to achieve target on time</p>

            <form onSubmit={handleCalculateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount ($)</label>
                <input
                  type="number"
                  step="100"
                  required
                  min="1"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currently Saved ($)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={goalCurrent}
                  onChange={(e) => setGoalCurrent(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {goalError && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{goalError}</p>
              )}

              <button
                type="submit"
                disabled={goalLoading}
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {goalLoading ? 'Calculating...' : 'Compute Required Monthly Savings'}
              </button>
            </form>
          </div>

          {/* Goal Results */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Forecast Analysis</h3>
              <p className="text-xs text-slate-500 mb-6">Deterministic milestone requirements</p>

              {goalResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                      Required Monthly Contribution
                    </span>
                    <p className="text-3xl font-extrabold text-emerald-700 mt-1">
                      ${goalResult.monthlyRequired.toLocaleString()}/mo
                    </p>
                    <p className="text-[11px] text-emerald-800/80 mt-1">
                      To cover ${goalResult.remainingAmount.toLocaleString()} over {goalResult.remainingMonths} months
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Months Remaining</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{goalResult.remainingMonths}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Completion Percentage</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{goalResult.percentageComplete}%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Enter your target amount and timeline to compute required monthly contributions.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DTI CALCULATOR */}
      {activeTab === 'dti' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Debt-To-Income (DTI) Parameters</h3>
            <p className="text-xs text-slate-500 mb-5">Measure borrowing health and creditworthiness</p>

            <form onSubmit={handleCalculateDTI} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Monthly Debt Obligations ($)</label>
                <input
                  type="number"
                  step="10"
                  required
                  min="0"
                  value={dtiDebt}
                  onChange={(e) => setDtiDebt(e.target.value)}
                  placeholder="Sum of mortgage, car EMI, cards"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Monthly Income ($)</label>
                <input
                  type="number"
                  step="100"
                  required
                  min="1"
                  value={dtiIncome}
                  onChange={(e) => setDtiIncome(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
              </div>

              {dtiError && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{dtiError}</p>
              )}

              <button
                type="submit"
                disabled={dtiLoading}
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {dtiLoading ? 'Evaluating DTI...' : 'Evaluate Debt Health'}
              </button>
            </form>
          </div>

          {/* DTI Results */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Financial Health Classification</h3>
              <p className="text-xs text-slate-500 mb-6">Standard banking lending guidelines</p>

              {dtiResult ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border ${
                    dtiResult.status === 'healthy'
                      ? 'bg-emerald-50 border-emerald-200'
                      : dtiResult.status === 'moderate'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-rose-50 border-rose-200'
                  }`}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">DTI Ratio</span>
                    <p className={`text-3xl font-extrabold mt-1 ${
                      dtiResult.status === 'healthy' ? 'text-emerald-700' : dtiResult.status === 'moderate' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {dtiResult.ratio}%
                    </p>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {dtiResult.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Enter your monthly debt and gross income to view your DTI status.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMERGENCY FUND */}
      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Emergency Fund Calculator</h3>
            <p className="text-xs text-slate-500 mb-5">Recommended cash safety reserves based on expenses</p>

            <form onSubmit={handleCalculateEmergency} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Mandatory Living Expenses ($)</label>
                <input
                  type="number"
                  step="50"
                  required
                  min="1"
                  value={emgExpenses}
                  onChange={(e) => setEmgExpenses(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Buffer Tenure</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 9, 12].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setEmgMonths(months)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        emgMonths === months
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {months} Months
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
              >
                Calculate Emergency Target
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Safety Cushion Target</h3>
              <p className="text-xs text-slate-500 mb-6">Unplanned emergency preparedness</p>

              {emgResult ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                    Recommended Reserve Target
                  </span>
                  <p className="text-3xl font-extrabold text-emerald-700 mt-1">
                    ${emgResult.targetAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    This provides {emgResult.targetMonths} months of complete financial runway at your ${emgResult.monthlyExpenseBasis.toLocaleString()}/mo essential spending level in the event of income interruption.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select your monthly expenses and buffer to calculate your reserve target.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
