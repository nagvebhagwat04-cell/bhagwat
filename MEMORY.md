# Personal Finance Adviser Bot
## Project Memory

## 1. Project Identity

**Name:** Personal Finance Adviser Bot  
**Domain:** AI in BFSI (Banking, Financial Services, and Insurance)  
**Purpose:** Help users understand, track, and plan personal finances using deterministic financial calculations, real-time analytics, and a Google Gemini-powered educational assistant.

## 2. Product Boundary

The application is strictly a financial education and planning tool.

It does not:
- Execute financial transactions or move funds.
- Connect directly to live bank accounts or payment rails.
- Guarantee investment returns.
- Replace licensed, certified fiduciary financial advice.

## 3. Technology Stack

```text
Frontend: React 18 + Vite + TypeScript
Styling: Tailwind CSS 3.4
Icons: Lucide React
Charts: Recharts
Routing: React Router v6
Backend: Node.js + Express 4.21 + TypeScript
Database: MongoDB + Mongoose 8.9 (with embedded MongoMemoryServer zero-config fallback)
Authentication: JWT + bcryptjs
AI Integration: Google Gemini API (@google/generative-ai) with deterministic context pipeline & fallback
Testing: Vitest, Supertest, React Testing Library, JSDOM
```

## 4. Core Architecture Rule: Separation of Math and AI

1. **Deterministic Calculation Engine:** The backend is the sole source of truth for financial formulas. Formulas for surplus, savings rate, emergency reserve, debt-to-income, goal contributions, and loan amortizations are implemented as deterministic mathematical functions with unit test coverage.
2. **Gemini Advisory Role:** Gemini is responsible for natural-language explanations, contextual interpretations, and educational guidance based on verified backend-calculated metrics.
3. **No Fabricated Data:** The AI assistant strictly references the injected context and does not invent missing financial figures.

## 5. Security & Multi-Tenancy

- `GEMINI_API_KEY`: Kept exclusively on the backend; never exposed to the client bundle.
- `JWT_SECRET`: Signs authentication tokens; protected routes enforce `Bearer <token>`.
- `passwordHash`: Salted and hashed via bcrypt (10 rounds); omitted from schema serialization (`select: false`).
- `Multi-tenant Data Isolation`: All transaction, budget, goal, and chat queries are scoped to the authenticated `req.user.userId`. Direct object references across users are rejected (IDOR protection tested and verified).

## 6. Financial Metrics Supported

- **Monthly Surplus:** `income - totalExpenses`
- **Savings Rate (%):** `(monthlySurplus / income) * 100` (safe division-by-zero handling)
- **Budget Utilization (%):** `(totalSpent / totalBudget) * 100` with threshold badges
- **Emergency Reserve:** `monthlyExpenses * targetMonths (3, 6, 9, 12)`
- **Goal Contribution:** `(targetAmount - currentAmount) / remainingMonths` with expired deadline handling
- **Loan EMI:** `[P * r * (1+r)^n] / [(1+r)^n - 1]`
- **Debt-to-Income (DTI) Ratio:** `(monthlyDebt / monthlyIncome) * 100` categorized into Healthy (<36%), Moderate (36-43%), and High Risk (>43%)

## 7. Change Log & Milestones

### v1.0 — Initial Full-Stack Implementation
- Implemented Express backend architecture with controllers, middleware, models, routes, and services.
- Implemented deterministic financial calculation engine with comprehensive unit tests (`tests/calculationService.test.ts`).
- Implemented JWT authentication, bcrypt password hashing, and user profile management.
- Implemented Transaction CRUD with categorization, search, and filtering.
- Implemented Monthly Budget management with category limits and actual spending tracking.
- Implemented Goals engine with target dates and deterministic required monthly contributions.
- Implemented Google Gemini integration with private context building and deterministic fallback.
- Implemented modern fintech React frontend with Tailwind CSS, Recharts, and Lucide icons.
- Implemented seed script (`backend/src/utils/seed.ts`) with demo account (`alex.demo@fintech.io`).
- Created automated integration and End-to-End test suites (`tests/api.test.ts`, `tests/e2e.test.ts`, `components.test.tsx`).
