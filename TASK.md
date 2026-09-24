# Personal Finance Adviser Bot
## Implementation and Testing Task Plan

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Completed
- [!] Blocked

## Phase 1 – Project Setup

- [x] Initialize repository.
- [x] Create frontend with React + Vite + TypeScript.
- [x] Create backend with Node.js + Express + TypeScript.
- [x] Configure Tailwind CSS.
- [x] Configure ESLint and formatting.
- [x] Create `.env.example`.
- [x] Create project scripts.
- [x] Verify frontend starts.
- [x] Verify backend starts.

## Phase 2 – Database

- [x] Configure MongoDB connection.
- [x] Create User model.
- [x] Create Transaction model.
- [x] Create Budget model.
- [x] Create Goal model.
- [x] Create ChatMessage model.
- [x] Add indexes.
- [x] Test database connection.

## Phase 3 – Authentication

- [x] Create registration endpoint.
- [x] Hash passwords.
- [x] Create login endpoint.
- [x] Generate JWT.
- [x] Create authentication middleware.
- [x] Protect private routes.
- [x] Create frontend login page.
- [x] Create frontend registration page.
- [x] Test invalid credentials.
- [x] Test unauthorized requests.

## Phase 4 – Financial Profile

- [x] Create profile API.
- [x] Create profile form.
- [x] Add validation.
- [x] Connect frontend to API.
- [x] Test profile retrieval and update.

## Phase 5 – Transactions

- [x] Create transaction schema.
- [x] Create transaction CRUD APIs.
- [x] Create transaction form.
- [x] Create transaction list.
- [x] Add filtering.
- [x] Add edit.
- [x] Add delete.
- [x] Test transaction ownership.

## Phase 6 – Budget

- [x] Create budget model/API.
- [x] Create budget UI.
- [x] Calculate category utilization.
- [x] Calculate total utilization.
- [x] Add budget dashboard cards.
- [x] Test budget calculations.

## Phase 7 – Financial Goals

- [x] Create goal model/API.
- [x] Create goal form.
- [x] Create goal cards.
- [x] Calculate goal progress.
- [x] Calculate required monthly contribution.
- [x] Handle expired deadlines.
- [x] Test goal calculations.

## Phase 8 – Financial Calculation Engine

- [x] Implement monthly surplus.
- [x] Implement savings rate.
- [x] Implement emergency-fund requirement.
- [x] Implement EMI.
- [x] Implement total loan interest.
- [x] Implement debt-to-income ratio.
- [x] Implement goal contribution.
- [x] Add input validation.
- [x] Add unit tests for normal values.
- [x] Add unit tests for zero values.
- [x] Add unit tests for boundary values.
- [x] Add unit tests for invalid values.

## Phase 9 – Dashboard

- [x] Create dashboard layout.
- [x] Create metric cards.
- [x] Create income/expense chart.
- [x] Create budget visualization.
- [x] Create goal visualization.
- [x] Create recent transactions.
- [x] Add AI financial summary.
- [x] Connect all data to backend.
- [x] Test loading/empty/error states.

## Phase 10 – Gemini AI Integration

- [x] Configure Gemini SDK.
- [x] Create backend Gemini service.
- [x] Create system prompt.
- [x] Create financial context builder.
- [x] Add deterministic metrics to AI context.
- [x] Create `/api/ai/chat`.
- [x] Create chat history endpoint.
- [x] Save messages.
- [x] Build AI chat frontend.
- [x] Add suggested prompts.
- [x] Add loading state.
- [x] Add AI error state.
- [x] Test Gemini API failure.
- [x] Test missing API key.
- [x] Verify API key is never sent to frontend.

## Phase 11 – Security Testing

- [x] Test password hashing.
- [x] Test JWT validation.
- [x] Test expired token.
- [x] Test invalid token.
- [x] Test protected routes.
- [x] Test user-data isolation.
- [x] Test IDOR-style access attempts.
- [x] Test invalid request payloads.
- [x] Test oversized/unexpected input.
- [x] Check `.env` is ignored by Git.
- [x] Verify no secret exists in frontend bundle.

## Phase 12 – Frontend Testing

- [x] Test login form.
- [x] Test registration form.
- [x] Test profile form.
- [x] Test transaction form.
- [x] Test budget form.
- [x] Test goal form.
- [x] Test calculator forms.
- [x] Test AI chat.
- [x] Test error states.
- [x] Test responsive layouts.

## Phase 13 – API Integration Testing

- [x] Test registration success.
- [x] Test duplicate email.
- [x] Test login success.
- [x] Test invalid login.
- [x] Test protected endpoint without JWT.
- [x] Test transaction CRUD.
- [x] Test budget creation.
- [x] Test goal CRUD.
- [x] Test dashboard response.
- [x] Test EMI calculation endpoint.
- [x] Test goal calculation endpoint.
- [x] Test AI chat endpoint.
- [x] Test chat history authorization.

## Phase 14 – End-to-End Testing

Primary flow:

```text
Register
→ Login
→ Complete Profile
→ Add Income
→ Add Expenses
→ Create Budget
→ Create Goal
→ Open Dashboard
→ Verify Calculations
→ Open AI Adviser
→ Ask Financial Question
→ Receive AI Response
→ Refresh
→ Verify Chat History
```

Additional flows:

- [x] User can log out.
- [x] User cannot access another user's data.
- [x] Invalid forms show useful errors.
- [x] Empty dashboard works.
- [x] Gemini failure displays a recoverable error.
- [x] Mobile layout works.
- [x] Browser refresh preserves authenticated state correctly.

## Phase 15 – Performance and Reliability Testing

- [x] Test dashboard with realistic transaction volume.
- [x] Test repeated API requests.
- [x] Test database connection failure.
- [x] Test Gemini timeout/failure.
- [x] Verify loading states.
- [x] Verify no unhandled promise rejections.
- [x] Verify no console errors in normal use.

## Phase 16 – Demo Data

- [x] Create seed script.
- [x] Add sample user.
- [x] Add sample income.
- [x] Add sample expenses.
- [x] Add sample budget.
- [x] Add sample goals.
- [x] Add sample chat history.
- [x] Verify dashboard is populated.

## Phase 17 – Documentation

- [x] Complete PRD.md.
- [x] Complete ARCHITECTURE.md.
- [x] Complete RULES.md.
- [x] Complete DESIGN.md.
- [x] Keep TASK.md updated.
- [x] Complete MEMORY.md.
- [x] Create README.md.
- [x] Document environment variables.
- [x] Document local setup.
- [x] Document testing commands.
- [x] Document Gemini setup.

## Phase 18 – Production Readiness

- [x] Run frontend lint.
- [x] Run backend lint.
- [x] Run unit tests.
- [x] Run integration tests.
- [x] Run end-to-end tests.
- [x] Run production frontend build.
- [x] Run production backend build.
- [x] Verify environment variables.
- [x] Remove debug logs.
- [x] Review security.
- [x] Review accessibility.
- [x] Review responsive design.
- [x] Perform final manual QA.

## Definition of Done

A feature is complete only when:

1. Its frontend behavior works.
2. Its backend API works.
3. Its database behavior works where applicable.
4. Validation exists.
5. Error handling exists.
6. Relevant automated tests pass.
7. Security/authorization is verified.
8. Documentation is updated.
9. The feature works in a production build.

## Required Test Commands

```text
npm run lint
npm run test
npm run test:integration
npm run test:e2e
npm run build
```
