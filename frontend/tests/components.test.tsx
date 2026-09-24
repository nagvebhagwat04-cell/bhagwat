import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisclaimerBanner } from '../src/components/common/DisclaimerBanner';
import { MetricCard } from '../src/components/common/MetricCard';
import { EmptyState } from '../src/components/common/EmptyState';
import { TrendingUp, Plus } from 'lucide-react';
import { CalculatorsPage } from '../src/pages/CalculatorsPage';

describe('Frontend Component Tests', () => {
  it('renders DisclaimerBanner with responsible finance statement', () => {
    render(<DisclaimerBanner />);
    expect(screen.getByText(/Educational & Planning Tool:/i)).toBeDefined();
    expect(screen.getByText(/does not replace certified, regulated financial/i)).toBeDefined();
  });

  it('renders MetricCard with correct title, value, and badge', () => {
    render(
      <MetricCard
        title="Monthly Surplus"
        value="$3,450"
        subValue="Ready for investment"
        icon={TrendingUp}
        badge="Surplus"
        variant="success"
      />
    );
    expect(screen.getByText('Monthly Surplus')).toBeDefined();
    expect(screen.getByText('$3,450')).toBeDefined();
    expect(screen.getByText('Surplus')).toBeDefined();
    expect(screen.getByText('Ready for investment')).toBeDefined();
  });

  it('renders EmptyState and triggers action callback on click', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Plus}
        title="No transactions"
        description="Add a transaction to get started"
        actionText="Add Transaction"
        onAction={handleAction}
      />
    );
    expect(screen.getByText('No transactions')).toBeDefined();
    const btn = screen.getByRole('button', { name: /Add Transaction/i });
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders CalculatorsPage with all calculator tabs', () => {
    render(<CalculatorsPage />);
    expect(screen.getByText('Financial Calculators')).toBeDefined();
    expect(screen.getByText('Loan EMI Calculator')).toBeDefined();
    expect(screen.getByText('Goal Contribution Forecast')).toBeDefined();
    expect(screen.getByText('Debt-To-Income (DTI)')).toBeDefined();
    expect(screen.getByText('Emergency Fund')).toBeDefined();
  });
});
