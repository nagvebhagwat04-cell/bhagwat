# Personal Finance Adviser Bot
## Product Requirements Document

**Version:** 1.0  
**Project Type:** AI in BFSI Capstone Project  
**Status:** Development Specification

## 1. Product Summary

Personal Finance Adviser Bot is a full-stack web application that helps users understand their personal finances through structured financial data, deterministic financial calculations, dashboards, and a Gemini-powered conversational assistant.

The system is designed for financial education and planning. It does not execute transactions and does not replace a regulated financial adviser.

## 2. Problem Statement

Many users have difficulty understanding where their money goes, how much they can save, how to plan financial goals, and how loans affect their monthly cash flow. A single application can combine budgeting tools, goal planning, financial calculations, and conversational explanations.

## 3. Objectives

1. Allow users to securely maintain their financial profile.
2. Allow users to record income and expenses.
3. Provide budget and savings analysis.
4. Allow users to create and track financial goals.
5. Provide deterministic EMI and goal calculations.
6. Provide a Gemini AI assistant that explains financial information using the user's calculated financial context.
7. Provide clear dashboards and charts.
8. Provide a testable, maintainable full-stack architecture.

## 4. Target Users

- Students learning personal finance.
- Young professionals managing income and expenses.
- Users who want simple explanations of financial concepts.
- Users planning savings goals.

## 5. Scope

### In Scope

- User registration and login.
- JWT-based authentication.
- Financial profile.
- Income and expense transactions.
- Monthly budget.
- Financial goals.
- Savings analysis.
- Emergency-fund calculation.
- EMI and loan-interest calculation.
- Debt-to-income calculation.
- Risk-profile questionnaire.
- Dashboard and charts.
- Gemini AI financial education assistant.
- Chat history.
- Input validation.
- Error handling.
- Unit, integration, API, security, and end-to-end testing.
- Seed/demo data.
- Documentation.

### Out of Scope

- Real bank-account connectivity.
- Real-money transfers.
- Brokerage transactions.
- Payment processing.
- Guaranteed investment returns.
- Automated securities trading.
- Production-grade financial advice requiring regulated professional authorization.

## 6. Core User Journey

```text
Register
   ↓
Complete financial profile
   ↓
Add income and expenses
   ↓
Create budget and financial goals
   ↓
View dashboard
   ↓
Review deterministic financial metrics
   ↓
Ask Gemini AI questions
   ↓
Receive context-aware educational guidance
```

## 7. Functional Requirements

### FR-01 Authentication

The system shall allow a user to register with name, email, and password.

The system shall hash passwords before storing them.

The system shall allow authenticated users to log in and receive a JWT.

Protected endpoints shall reject missing or invalid authentication.

### FR-02 Financial Profile

Users shall be able to maintain:

- Name
- Age range
- Occupation
- Monthly income
- Financial knowledge level
- Risk profile

### FR-03 Transactions

Users shall be able to:

- Add income.
- Add expenses.
- View transactions.
- Edit transactions.
- Delete transactions.
- Filter transactions by type/category/date.

Each transaction shall belong to exactly one authenticated user.

### FR-04 Budget

Users shall be able to define monthly budget limits.

The system shall calculate category utilization and overall budget utilization.

### FR-05 Financial Goals

Users shall be able to create goals with:

- Goal name
- Target amount
- Current amount
- Target date

The backend shall calculate the required monthly contribution.

### FR-06 Financial Calculations

The backend shall provide deterministic calculations for:

- Monthly surplus.
- Savings rate.
- Budget utilization.
- Emergency-fund requirement.
- Goal contribution requirement.
- EMI.
- Total loan interest.
- Debt-to-income ratio.

### FR-07 Dashboard

The dashboard shall display:

- Income.
- Expenses.
- Savings.
- Savings rate.
- Budget utilization.
- Goal progress.
- Recent transactions.
- Charts.
- AI financial summary.

### FR-08 AI Assistant

Users shall be able to ask financial questions through a conversational interface.

The backend shall gather only relevant financial context, calculate required metrics, and send structured context to Gemini.

Gemini shall:

- Explain financial information.
- Answer financial education questions.
- Interpret backend-calculated metrics.
- Suggest practical budgeting and saving actions.
- Explain assumptions.
- Avoid inventing user data.

### FR-09 Chat History

Authenticated users shall be able to retrieve their own previous AI conversations.

### FR-10 Safety

The application shall clearly state that it is an educational/planning tool and not a substitute for professional financial advice.

The AI shall not execute transactions, guarantee returns, or claim certainty where information is incomplete.

## 8. Non-Functional Requirements

### Security
- Password hashing.
- JWT authentication.
- Authorization checks.
- Server-side validation.
- Secure environment variables.
- No API keys in frontend code.
- User-data isolation.

### Performance
- Dashboard API should avoid unnecessary database queries.
- AI requests should be asynchronous.
- Loading states must be shown in the frontend.

### Reliability
- Backend errors shall use consistent responses.
- Gemini failures shall not crash the application.
- Financial calculations shall be deterministic and independently testable.

### Maintainability
- TypeScript.
- Modular services/controllers.
- Reusable frontend components.
- Centralized validation and error handling.

## 9. Acceptance Criteria

The MVP is accepted when:

- A user can register and log in.
- Protected data cannot be accessed without authentication.
- A user can create, edit, view, and delete transactions.
- A user can create a budget and view utilization.
- A user can create a financial goal and see required monthly savings.
- Financial calculations pass automated tests.
- Dashboard data comes from backend APIs.
- Gemini receives structured financial context from the backend.
- The AI chat works with a valid Gemini API key.
- Gemini API failure is handled gracefully.
- No Gemini API key is exposed in browser code.
- User A cannot retrieve User B's data.
- Frontend and backend tests pass.
- Production build completes without errors.

## 10. Future Enhancements

- Bank-account aggregation.
- Financial statement upload and extraction.
- Notifications.
- Advanced scenario simulation.
- External market-data integration.
- Financial reports.
- Multilingual assistant.
