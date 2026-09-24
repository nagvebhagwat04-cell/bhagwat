import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Bot,
  Calculator,
  User,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budget', path: '/budget', icon: PieChart },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'AI Adviser', path: '/ai', icon: Bot, badge: 'AI' },
    { name: 'Calculators', path: '/calculators', icon: Calculator },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              FinAdviser <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">BFSI Smart Planning</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Responsible Finance Footer */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 bg-slate-950/40">
          <p className="font-semibold text-slate-300 mb-0.5">Deterministic Core</p>
          <p className="leading-relaxed">Formulas computed deterministically; advice generated with Gemini context pipeline.</p>
        </div>
      </aside>
    </>
  );
};
