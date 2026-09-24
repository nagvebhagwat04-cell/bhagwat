import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('alex.demo@fintech.io');
    setPassword('DemoPassword123!');
    setError(null);
    try {
      setSubmitting(true);
      await login('alex.demo@fintech.io', 'DemoPassword123!');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-2xl shadow-emerald-900/40 animate-pulse-glow">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-white">
          FinAdviser <span className="gradient-text">AI</span>
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Deterministic formulas · AI-powered guidance · Secure
        </p>

        {/* Feature pills */}
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {['📊 Smart Budget', '🎯 Goal Tracker', '🤖 AI Adviser'].map((f) => (
            <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="glass-card py-8 px-6 sm:px-8">
          <h2 className="text-lg font-bold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={submitting}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-5 pt-5 border-t border-white/8">
            <button
              type="button"
              id="demo-login"
              onClick={handleDemoLogin}
              disabled={submitting}
              className="w-full py-2.5 px-3 text-sm font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try Demo Account (Alex Morgan)</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              Pre-loaded with income, expenses, budgets &amp; goals
            </p>
          </div>

          <div className="mt-5 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
