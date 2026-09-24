# Personal Finance Adviser Bot

> **An AI-Assisted Full-Stack Personal Finance Planning Platform with Deterministic Financial Calculations, Real-Time Dashboards, Amortization Modeling, and Google Gemini Conversational Advisory.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

---

## 1. Project Summary

**Personal Finance Adviser Bot** is an educational and planning application designed for the BFSI (Banking, Financial Services, and Insurance) domain. It combines **deterministic financial calculations** (ensuring 100% mathematical precision for cash flows, savings rates, loan EMIs, and savings milestones) with **Google Gemini conversational intelligence** to explain financial health in plain, accessible language.

### Core Philosophy: Separation of Math and AI
- **Deterministic Backend Engine:** All financial metrics (monthly surplus, savings rate, emergency reserve, debt-to-income, goal contributions, and loan amortization) are calculated strictly by deterministic mathematical functions on the server.
- **Gemini Advisory Role:** Gemini is responsible for natural language explanation, interpretation of backend-calculated metrics, and educational guidance. It is **never** used as a calculation engine or permitted to invent financial facts.
- **Educational Boundary:** The application does not execute money transfers, does not connect directly to banking rails, and provides an explicit educational disclaimer.

---

## 2. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite                      │
│     (Tailwind CSS, Lucide Icons, Recharts Charts)      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JWT Bearer)
┌───────────────────────────▼────────────────────────────┐
│                    Express Backend                     │
│  ├── JWT Authentication & BCrypt Password Hashing      │
│  ├── Input Validators (express-validator)              │
│  ├── Deterministic Calculation Engine                  │
│  │   ├── calculateMonthlySurplus & calculateSavingsRate│
│  │   ├── calculateBudgetUtilization & EmergencyFund    │
│  │   └── calculateEMI & calculateGoalContribution      │
│  └── Gemini AI Context Pipeline                        │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
┌─────────────▼─────────────┐   ┌──────────▼─────────────┐
│    MongoDB + Mongoose     │   │   Google Gemini API    │
│ (Multi-tenant scoped data)│   │ (Context-aware prompt) │
└───────────────────────────┘   └────────────────────────┘
```

---

## 3. Key Features

1. **Deterministic Dashboard & Analytics:**
   - Real-time KPI metric cards (Monthly Income, Monthly Expenses, Monthly Surplus, Savings Rate).
   - Cash flow bar chart showing multi-month income vs. expense trends.
   - Category spending breakdown pie chart.
   - Budget utilization progress bars with color-coded alerts (green <80%, amber 80-100%, red >100%).
   - Active goals progress with target dates and required monthly contributions.
   - AI financial summary highlight.

2. **Transaction Management:**
   - Full CRUD for income and expense transactions.
   - Category classification (Salary, Housing, Groceries, Utilities, Entertainment, Healthcare, etc.).
   - Multi-parameter filtering by type, category, date, and description search.
   - Strict multi-tenant data isolation (IDOR protection).

3. **Budget Planner:**
   - Monthly category limit customization.
   - Automatic comparison of actual spending against planned category budgets.
   - Remaining spending capacity calculations.

4. **Financial Goals & Target Forecasting:**
   - Milestone tracking with completion percentages and deadline status (Active, Achieved, Expired).
   - Server-side deterministic required monthly contribution formula.

5. **Financial Calculators:**
   - **Loan EMI Calculator:** Amortization modeling displaying monthly payment, total interest, and visual principal-to-interest ratio.
   - **Goal Contribution Estimator:** Required monthly savings based on target dates.
   - **Debt-to-Income (DTI) Calculator:** Lending risk classification (Healthy <36%, Moderate 36-43%, High Risk >43%).
   - **Emergency Fund Calculator:** 3, 6, 9, or 12-month expense reserve targets.

6. **Gemini AI Financial Adviser:**
   - Private context pipeline: injects user profile, recent transaction distributions, active goals, and calculated metrics into Gemini.
   - Zero credential leakage: passwords and tokens are never passed to Gemini.
   - Deterministic rule-based fallback: if `GEMINI_API_KEY` is not configured or network limits occur, the assistant seamlessly returns calculated financial guidance without crashing.
   - Persistent user conversation history.

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, React Router v6 |
| **Backend** | Node.js, Express, TypeScript, Mongoose, BCryptJS, JSONWebToken, express-validator |
| **AI Integration** | `@google/generative-ai` (Gemini 1.5 Flash) |
| **Database** | MongoDB / Mongoose (with embedded `mongodb-memory-server` zero-config fallback) |
| **Testing** | Vitest, Supertest, React Testing Library, JSDOM |

---

## 5. Getting Started & Local Setup

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v10+` or `v11+`

### Installation
Clone or navigate to the repository root directory:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Environment Configuration
Copy `.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/finance_adviser
JWT_SECRET=super_secret_jwt_key_change_in_production_12345
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```

> **Note on Database:** If an external MongoDB instance is not running locally on port 27017, the backend automatically initializes an embedded in-memory MongoDB server (`mongodb-memory-server`), ensuring the app runs out of the box with zero external dependencies.

---

## 6. Seed Sample Demo Data

To populate the database with realistic sample transactions, monthly budgets, goals, and chat history for instant testing:

```bash
npm run seed
```

This creates the demo account:
- **Email:** `alex.demo@fintech.io`
- **Password:** `DemoPassword123!`

---

## 7. Running Locally

Run both frontend and backend concurrently from the root directory:

```bash
npm run dev
```

- **Frontend Application:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **API Health Check:** `http://localhost:5000/api/health`

Alternatively, run individually:
```bash
npm run dev:backend   # Starts Express API at http://localhost:5000
npm run dev:frontend  # Starts Vite frontend at http://localhost:5173
```

---

## 8. Automated Test Suite

All tests follow the specifications defined in `RULES.md` and `TASK.md`:

```bash
# 1. Run all unit and integration tests (backend + frontend)
npm run test

# 2. Run backend unit & API integration tests
npm run test:backend

# 3. Run frontend component tests
npm run test:frontend

# 4. Run full End-to-End user journey test suite
npm run test:e2e

# 5. Type-check & lint validation
npm run lint

# 6. Production build verification
npm run build
```

---

## 9. API Reference

### Authentication & Profile
- `POST /api/auth/register` — Register user account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/users/profile` — Get authenticated profile
- `PUT /api/users/profile` — Update financial profile & risk tolerance

### Transactions
- `GET /api/transactions` — Query scoped transactions (supports `?type=&category=&startDate=&endDate=`)
- `POST /api/transactions` — Create income/expense entry
- `PUT /api/transactions/:id` — Update transaction (scoped to owner)
- `DELETE /api/transactions/:id` — Delete transaction (scoped to owner)

### Budget
- `GET /api/budget` — Retrieve monthly budget and category utilization
- `POST /api/budget` — Upsert monthly budget targets and category limits

### Goals
- `GET /api/goals` — Retrieve active goals with calculated monthly contributions
- `POST /api/goals` — Create financial goal
- `PUT /api/goals/:id` — Update goal
- `DELETE /api/goals/:id` — Delete goal

### Dashboard & Analytics
- `GET /api/dashboard` — Aggregated KPI metrics, category breakdown, cash flow trends, and AI summary

### Deterministic Calculations
- `POST /api/calculations/emi` — Loan EMI amortization
- `POST /api/calculations/goal` — Required monthly goal savings
- `POST /api/calculations/budget` — Budget utilization
- `POST /api/calculations/dti` — Debt-to-income ratio
- `POST /api/calculations/emergency` — Emergency reserve target

### AI Advisory
- `POST /api/ai/chat` — Conversational assistant with injected financial context
- `GET /api/ai/history` — Get conversation history
- `DELETE /api/ai/history` — Clear conversation history

---

## 10. Responsible Finance Disclaimer

The **Personal Finance Adviser Bot** is strictly an educational and planning tool. It provides mathematical calculations and informational explanations to help users better understand budgeting and personal finance concepts. It is **not** a licensed financial adviser, broker-dealer, or tax consultant, and does not provide regulated fiduciary advice or execute transactions.
