# Implementation Plan: React Loan Portal (LADVS)

## Overview

All ten pages and supporting infrastructure are implemented. The remaining work focuses on:
1. Hardening the API layer (401 handling on all clients)
2. Extracting reusable components and custom hooks as specified in the design
3. Installing and configuring the test framework
4. Writing unit and property-based tests for the correctness properties defined in the design

---

## Tasks

- [x] 1. Core infrastructure — AuthContext, API clients, routing
  - AuthContext with localStorage hydration, login, logout — **complete**
  - `apiClient` (auth service) with JWT interceptor and 401 redirect — **complete**
  - `appClient` (application service) with JWT interceptor — **complete**
  - `docClient` (document service) with JWT interceptor — **complete**
  - `ProtectedRoute` component with `replace` navigation — **complete**
  - App.tsx with QueryClientProvider, AuthProvider, BrowserRouter, all routes — **complete**
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.4, 9.1, 9.2, 9.3, 9.4_

- [x] 2. Fix 401 handling on appClient and docClient
  - [x] 2.1 Add response interceptor to `appClient` in `src/api/application.ts`
    - Mirror the existing 401 interceptor from `src/api/client.ts`
    - On 401: remove `ladvs_token` and `ladvs_user` from localStorage, redirect to `/login`
    - _Requirements: 4.3_
  - [x] 2.2 Add response interceptor to `docClient` in `src/api/document.ts`
    - Same pattern as 2.1
    - _Requirements: 4.3_

- [x] 3. Page implementations
  - LoginPage (split hero, applicant/admin tabs, Zod validation, toast feedback) — **complete**
  - RegisterPage (5-step form, Zod validation, toast feedback) — **complete**
  - DashboardPage (stats row, donut chart, recent applications, empty state) — **complete**
  - ApplicationsPage (list with search + status filter, skeleton loaders) — **complete**
  - ApplyPage (4-step form with personal info, loan details, documents placeholder, review) — **complete**
  - ApplicationDetailPage (loan summary, status timeline, document uploader rows) — **complete**
  - DocumentsPage (table of all documents across applications, search) — **complete**
  - ProfilePage (account info, application stats, logout) — **complete**
  - NotificationsPage (derived from application statuses) — **complete**
  - HelpPage (FAQ accordion, contact cards) — **complete**
  - _Requirements: 1.1–1.5, 2.1–2.6, 5.1–5.7, 6.1–6.11, 7.1–7.7, 8.1–8.9, 11.1–11.5_

- [x] 4. Fix missing cache invalidation on login
  - [x] 4.1 In `src/pages/auth/LoginPage.tsx`, call `queryClient.invalidateQueries({ queryKey: ['applications'] })` after a successful login, before navigating to `/dashboard`
    - Import `useQueryClient` from `@tanstack/react-query`
    - _Requirements: 13.2_

- [-] 5. Extract reusable `StatusBadge` component
  - [ ] 5.1 Create `src/components/ui/StatusBadge.tsx`
    - Accept `status: 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'DocumentsPending'` and optional `size?: 'sm' | 'md'`
    - Map each status to a distinct Tailwind color class (consolidate the `STATUS_CONFIG` maps currently duplicated across DashboardPage, ApplicationsPage, ApplicationDetailPage)
    - Return a `<span>` with the color class, dot indicator, and label
    - _Requirements: 12.1, 12.2, 12.3_
  - [ ]* 5.2 Write unit tests for StatusBadge
    - Test that every valid `ApplicationStatus` value renders a non-empty class string
    - Test that an unknown status falls back gracefully
    - _Requirements: 12.3_

- [ ] 6. Extract custom React Query hooks
  - [ ] 6.1 Create `src/hooks/useApplications.ts`
    - Wrap `useQuery(['applications'], applicationApi.getAll)` and return `{ applications, isLoading, isError, refetch }`
    - _Requirements: 5.1, 13.1_
  - [ ] 6.2 Create `src/hooks/useApplication.ts`
    - Wrap `useQuery(['application', id], () => applicationApi.getById(id))` and return `{ application, isLoading, isError }`
    - _Requirements: 7.1_
  - [ ] 6.3 Create `src/hooks/useDocuments.ts`
    - Wrap `useQuery(['documents', applicationId], ...)` and return `{ documents, isLoading, refetch }`
    - _Requirements: 7.2, 13.3_
  - [ ] 6.4 Create `src/hooks/useCreateApplication.ts`
    - Wrap `useMutation(applicationApi.create)` with `onSuccess` invalidating `['applications']` cache
    - Return `{ mutate, mutateAsync, isPending, isError, error }`
    - _Requirements: 6.9, 6.10, 13.1_
  - [ ] 6.5 Refactor DashboardPage, ApplicationsPage, ApplicationDetailPage, and ApplyPage to use the new hooks instead of inline `useQuery`/`useMutation` calls
    - _Requirements: 5.1, 6.9, 7.1, 7.2_

- [ ] 7. Checkpoint — verify build and lint pass
  - Run `tsc -b` and `eslint .` to confirm no type errors or lint violations after tasks 2–6
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Set up test framework
  - [ ] 8.1 Install Vitest, React Testing Library, jsdom, and fast-check as dev dependencies
    - `npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fast-check msw`
    - _Requirements: design Testing Strategy section_
  - [ ] 8.2 Configure Vitest in `vite.config.ts`
    - Add `test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'] }` to the Vite config
    - Create `src/test/setup.ts` that imports `@testing-library/jest-dom`
    - Add `"test": "vitest --run"` script to `package.json`
    - _Requirements: design Testing Strategy section_
  - [ ] 8.3 Create MSW handlers for API mocking
    - Create `src/test/handlers.ts` with MSW request handlers for:
      - `POST /api/v1/Applicants/login` — returns a mock `LoginResponse`
      - `GET /api/v1/Applications` — returns a mock `ApplicationResponse[]`
      - `POST /api/v1/Applications` — returns a mock `ApplicationResponse`
      - `GET /api/v1/Applications/:id` — returns a mock `ApplicationResponse`
      - `GET /api/v1/Documents/:id` — returns a mock `DocumentUploadResponse[]`
      - `POST /api/v1/Documents/upload` — returns a mock `DocumentUploadResponse`
    - Create `src/test/server.ts` that sets up the MSW server for tests
    - _Requirements: 10.1, 10.2_

- [ ] 9. Unit tests — Zod schemas and pure functions
  - [ ] 9.1 Create `src/test/schemas.test.ts` — test the ApplyPage Zod schema
    - Valid input passes validation
    - `requestedAmount < 10000` is rejected (Requirement 6.5)
    - `tenureMonths` outside [1, 360] is rejected (Requirement 6.6)
    - `monthlyIncome <= 0` is rejected (Requirement 6.7)
    - Invalid `loanType` is rejected (Requirement 6.8)
    - _Requirements: 6.5, 6.6, 6.7, 6.8_
  - [ ]* 9.2 Write property test — requestedAmount boundary
    - **Property 1: For any `requestedAmount < 10000`, the Zod schema always rejects**
    - **Validates: Requirements 6.5**
    - Use `fc.integer({ max: 9999 })` as the arbitrary
  - [ ]* 9.3 Write property test — tenureMonths boundary
    - **Property 2: For any `tenureMonths` outside [1, 360], the Zod schema always rejects**
    - **Validates: Requirements 6.6**
    - Use `fc.oneof(fc.integer({ max: 0 }), fc.integer({ min: 361 }))` as the arbitrary
  - [ ]* 9.4 Write property test — monthlyIncome boundary
    - **Property 3: For any `monthlyIncome <= 0`, the Zod schema always rejects**
    - **Validates: Requirements 6.7**
    - Use `fc.integer({ max: 0 })` as the arbitrary

- [ ] 10. Unit tests — document upload pre-validation
  - [ ] 10.1 Create `src/test/documentUpload.test.ts`
    - Test that a file with type `application/pdf` and size ≤ 5 MB passes client-side validation
    - Test that a file with an invalid MIME type (e.g. `text/plain`) is rejected with an error message and does NOT call `documentApi.upload`
    - Test that a file exceeding 5 MB is rejected with an error message and does NOT call `documentApi.upload`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 10.2 Write property test — file size boundary
    - **Property 4: For any file with `size > 5 * 1024 * 1024`, the upload validation always throws before calling the API**
    - **Validates: Requirements 8.2, 8.4**
    - Use `fc.integer({ min: 5 * 1024 * 1024 + 1, max: 100 * 1024 * 1024 })` as the arbitrary for file size

- [ ] 11. Unit tests — AuthContext
  - [ ] 11.1 Create `src/test/AuthContext.test.tsx`
    - Test that `login()` sets user state and writes both `ladvs_user` and `ladvs_token` to localStorage (Requirement 9.2)
    - Test that `logout()` clears user state and removes both keys from localStorage (Requirement 9.3)
    - Test that `AuthProvider` hydrates user state from `localStorage['ladvs_user']` on mount (Requirement 9.1)
    - Test that `isAuthenticated` is `true` after login and `false` after logout (Requirement 3.2)
    - _Requirements: 3.1, 3.2, 9.1, 9.2, 9.3_
  - [ ]* 11.2 Write property test — login/logout round-trip
    - **Property 5: For any valid `AuthUser`, calling `login(user)` then `logout()` always results in `isAuthenticated === false` and empty localStorage**
    - **Validates: Requirements 3.1, 3.2, 9.2, 9.3**
    - Use `fc.record({ applicantId: fc.uuid(), fullName: fc.string({ minLength: 1 }), email: fc.emailAddress(), token: fc.string({ minLength: 10 }) })` as the arbitrary

- [ ] 12. Unit tests — StatusBadge and status mapping
  - [ ] 12.1 Create `src/test/StatusBadge.test.tsx`
    - Test that each of the five `ApplicationStatus` values renders a non-empty CSS class string (Requirement 12.3)
    - Test that the rendered badge contains the correct label text for each status
    - _Requirements: 12.1, 12.2, 12.3_
  - [ ]* 12.2 Write property test — status color completeness
    - **Property 6: For any valid `ApplicationStatus` value, `getStatusConfig(status).color` is always a non-empty string**
    - **Validates: Requirements 12.3**
    - Use `fc.constantFrom('Submitted', 'UnderReview', 'Approved', 'Rejected', 'DocumentsPending')` as the arbitrary

- [ ] 13. Integration tests — login flow and ProtectedRoute
  - [ ]* 13.1 Create `src/test/LoginPage.test.tsx`
    - Test that submitting valid credentials calls `POST /api/v1/Applicants/login` (via MSW mock) and navigates to `/dashboard`
    - Test that a failed login response shows a toast error and stays on `/login`
    - Test that inline validation errors appear when email or password is empty
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ]* 13.2 Create `src/test/ProtectedRoute.test.tsx`
    - Test that an unauthenticated user visiting `/dashboard` is redirected to `/login` with `replace`
    - Test that an authenticated user visiting `/dashboard` sees the page content
    - _Requirements: 4.1, 4.2_

- [ ] 14. Final checkpoint — all tests pass
  - Run `npm run test` and confirm all test suites pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Tasks 1 and 3 are already complete — they are listed for traceability
- The test framework (Vitest + RTL + fast-check + MSW) must be installed in task 8 before any test tasks can run
- Property tests use `fast-check` as specified in the design document
- All API base URLs use HTTP; replace with HTTPS before any production deployment
- PAN and Aadhaar values must never be logged or included in error messages
