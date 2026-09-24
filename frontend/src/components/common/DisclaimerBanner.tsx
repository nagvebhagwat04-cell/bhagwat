import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside aria-label="Educational Disclaimer" className="border border-amber-500/15 rounded-xl px-4 py-2.5 flex items-center gap-3 text-amber-300/80 text-xs mb-6 bg-amber-500/5">
      <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
      <p className="leading-relaxed">
        <span className="font-semibold text-amber-300">Educational &amp; Planning Tool:</span>{' '}
        Personal Finance Adviser provides deterministic calculations and AI-assisted educational guidance. It does not execute transactions and does not replace certified, regulated financial advice.
      </p>
    </aside>
  );
};
