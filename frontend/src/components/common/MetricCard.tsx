import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  badge?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  badge,
  variant = 'default',
}) => {
  const iconColors = {
    default: 'bg-slate-500/15 text-slate-300',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger: 'bg-red-500/15 text-red-400',
  };

  const valueColors = {
    default: 'text-white',
    success: 'text-emerald-300',
    warning: 'text-amber-300',
    danger: 'text-red-400',
  };

  const badgeColors = {
    default: 'bg-slate-500/15 text-slate-300',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger: 'bg-red-500/15 text-red-400',
  };

  return (
    <div className="metric-card glass-card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColors[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <h3 className={`text-2xl font-bold tracking-tight ${valueColors[variant]}`}>{value}</h3>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColors[variant]}`}>
            {badge}
          </span>
        )}
      </div>
      {subValue && (
        <p className="text-xs text-slate-500 mt-1.5 font-medium">{subValue}</p>
      )}
    </div>
  );
};
