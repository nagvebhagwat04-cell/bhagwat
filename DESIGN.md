# Personal Finance Adviser Bot
## UI/UX Design Specification

## 1. Design Goal

Create a modern fintech interface that feels trustworthy, simple, and practical. Financial information should be understandable at a glance.

## 2. Visual Direction

- Light neutral background.
- Dark navy primary text.
- Green financial accent.
- Red for negative financial states.
- Amber for warnings.
- White cards with subtle borders/shadows.
- Minimal animation.

## 3. Main Navigation

```text
Dashboard
Transactions
Budget
Goals
AI Adviser
Calculators
Profile
```

## 4. Dashboard Layout

Top metric cards:

```text
Monthly Income | Monthly Expenses | Monthly Savings | Savings Rate
```

Main content:

```text
Income vs Expenses Chart
Budget Utilization
Goal Progress
Recent Transactions
AI Financial Summary
```

## 5. AI Adviser

The AI screen should include:

- Chat history.
- User messages.
- Assistant messages.
- Input box.
- Send button.
- Loading indicator.
- Error message.
- Suggested questions.
- Financial disclaimer.

Suggested prompts:

```text
How can I improve my savings?
Where am I overspending?
Can I reach my goal?
Explain SIP in simple words.
What happens if I increase my EMI?
```

## 6. Transaction UI

Provide:

- Add transaction button.
- Income/expense selector.
- Category selector.
- Amount.
- Description.
- Date.
- Transaction table/list.
- Edit and delete actions.
- Filters.

## 7. Budget UI

Show:

- Monthly income.
- Total budget.
- Total spent.
- Remaining amount.
- Category limits.
- Category utilization progress bars.

## 8. Goals UI

Each goal card should display:

- Goal name.
- Target amount.
- Current amount.
- Percentage complete.
- Target date.
- Required monthly contribution.

## 9. Calculators

### EMI Calculator
Inputs:
- Principal.
- Annual interest rate.
- Loan tenure.

Outputs:
- Monthly EMI.
- Total payment.
- Total interest.

### Goal Calculator
Inputs:
- Target amount.
- Current amount.
- Target date.

Output:
- Required monthly contribution.

## 10. Responsive Design

Desktop:
- Sidebar.
- Multi-column dashboard.
- Large charts.

Tablet:
- Collapsible navigation.
- Two-column cards where space permits.

Mobile:
- Single-column layout.
- Compact cards.
- Horizontal-scroll-free tables.
- Bottom or collapsible navigation.
- Chat input optimized for touch.

## 11. Accessibility

- Semantic HTML.
- Proper labels.
- Keyboard navigation.
- Visible focus states.
- Accessible error messages.
- Sufficient contrast.
- Never communicate critical information using color alone.

## 12. States

Every data-driven component must support:

```text
Loading
Success
Empty
Error
```

## 13. Design Quality Rules

- Avoid excessive gradients.
- Avoid excessive animations.
- Avoid overcrowded dashboards.
- Use consistent spacing.
- Use consistent currency formatting.
- Keep primary actions visually obvious.
- Never use placeholder lorem ipsum in the final application.
