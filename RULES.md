# Personal Finance Adviser Bot
## Engineering and Product Rules

## 1. General Rules

1. Do not create fake buttons or fake API responses.
2. Do not mark a feature complete until it works end-to-end.
3. Keep frontend and backend responsibilities separate.
4. Update TASK.md when work is completed.
5. Update MEMORY.md when architecture or important decisions change.
6. Keep documentation consistent with actual code.

## 2. Frontend Rules

- Use TypeScript.
- Use reusable components.
- Keep API requests in service modules.
- Do not call Gemini directly from the browser.
- Show loading, success, empty, and error states.
- Validate forms before submission.
- Never hard-code sensitive credentials.

## 3. Backend Rules

- Use controllers for HTTP handling.
- Use services for business logic.
- Use validators at API boundaries.
- Use middleware for authentication and cross-cutting concerns.
- Keep financial formulas in dedicated calculation services.
- Use centralized error handling.

## 4. Database Rules

- Every user-owned document must contain `userId`.
- Every user-owned query must be scoped to the authenticated user.
- Add useful indexes such as `userId`, dates, and email.
- Do not store plaintext passwords.
- Do not return `passwordHash` in API responses.

## 5. Authentication Rules

- Hash passwords with bcrypt.
- Sign JWTs using `JWT_SECRET`.
- Reject missing, malformed, or expired tokens.
- Never trust a client-supplied user ID when the authenticated identity is available.

## 6. Gemini Rules

- Store `GEMINI_API_KEY` only in backend environment variables.
- Never expose the API key in frontend bundles.
- Send only relevant financial context.
- Do not send passwords or authentication tokens to Gemini.
- Gemini must not invent missing user data.
- Gemini must not claim calculations that the backend did not provide.
- Handle Gemini timeout, quota, invalid-response, and service errors.
- AI responses must be treated as generated educational content.

## 7. Financial Rules

- Critical calculations must be deterministic.
- Validate that monetary values are finite and non-negative where appropriate.
- Validate dates before goal calculations.
- Handle zero income without division-by-zero.
- Handle goals whose deadline has passed.
- Round displayed currency values consistently.
- Do not silently alter user-entered amounts.

## 8. Responsible-Finance Rules

- Do not guarantee returns.
- Do not promise investment outcomes.
- Do not execute transactions.
- Do not impersonate a regulated adviser.
- Explain financial concepts and risks.
- For investment questions, prefer educational explanations and risk-aware considerations.
- Clearly show the application's educational/planning disclaimer.

## 9. API Rules

- Use appropriate HTTP status codes.
- Validate all request bodies.
- Validate route parameters.
- Return predictable JSON.
- Never expose stack traces in production.
- Do not leak database implementation details to users.

## 10. Testing Rules

Every important financial calculation requires unit tests.

Every protected API requires authentication and authorization tests.

Every CRUD resource requires success and failure-path tests.

Every AI integration requires tests for:
- Valid request.
- Missing financial context.
- Gemini failure.
- Invalid AI response.
- Unauthorized access.

End-to-end tests must cover the primary user journey.

## 11. Git Rules

- Use small meaningful commits.
- Do not commit `.env`.
- Commit `.env.example`.
- Do not commit generated secrets.
- Do not commit build artifacts unless explicitly required.
