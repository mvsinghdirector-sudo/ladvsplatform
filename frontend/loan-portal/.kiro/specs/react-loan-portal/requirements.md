# Requirements Document

## Introduction

The LADVS (Loan Application & Document Verification System) portal is a React 18 + TypeScript single-page application that enables applicants to register, authenticate, submit loan applications, upload supporting documents, and track application status through a multi-step workflow. The frontend communicates with two separate backend microservices via Axios with JWT bearer tokens managed through a shared authentication context. All server state is managed through React Query v5.

## Glossary

- **Portal**: The LADVS React SPA as a whole
- **Applicant**: A registered user who can submit and manage loan applications
- **AuthContext**: The React context that holds the authenticated user's state and exposes login/logout functions
- **AuthProvider**: The React component that wraps the application tree and provides AuthContext
- **ProtectedRoute**: A route guard component that redirects unauthenticated users to `/login`
- **ApplicantApi**: The Axios client that communicates with the Auth/Applicant microservice
- **ApplicationApi**: The Axios client that communicates with the Application microservice
- **DocumentApi**: The Axios client that communicates with the Document microservice
- **React_Query**: The TanStack React Query v5 library used for server state management
- **Zod_Schema**: A Zod validation schema used to validate form inputs before API submission
- **JWT**: JSON Web Token used as a bearer token for authenticated API requests
- **SAS_URL**: An Azure Blob Storage Shared Access Signature URL used for document downloads
- **ApplicationStatus**: One of `Submitted`, `UnderReview`, `DocumentsPending`, `Approved`, `Rejected`
- **DocumentUploader**: The component responsible for file selection, validation, and upload for a single document type
- **StepIndicator**: The visual progress component for multi-step forms
- **StatusBadge**: The reusable pill badge component that maps ApplicationStatus to a color
- **LoanSummaryCard**: The compact card component displaying key loan application fields
- **DashboardPage**: The page listing all loan applications for the authenticated Applicant
- **ApplyPage**: The multi-step form page for creating a new loan application
- **ApplicationDetailPage**: The page showing full details, status timeline, and documents for a single application
- **AppLayout**: The shared shell component providing the persistent navbar for all authenticated pages
- **localStorage**: The browser's localStorage API used to persist auth state

---

## Requirements

### Requirement 1: User Registration

**User Story:** As a new applicant, I want to register an account, so that I can access the loan portal and submit applications.

#### Acceptance Criteria

1. WHEN a user submits the registration form with valid data, THE Portal SHALL call `POST /api/v1/Applicants/register` via ApplicantApi and navigate the user to `/dashboard` on success
2. WHEN the registration API returns a successful response, THE AuthContext SHALL store the returned `AuthUser` (token, applicantId, fullName, email) in both React state and localStorage under keys `ladvs_user` and `ladvs_token`
3. IF the registration API returns an error, THEN THE Portal SHALL display a user-visible toast error message with the error detail
4. THE Zod_Schema SHALL validate all required registration fields (fullName, email, password, phone, panNumber, aadhaarNumber, dateOfBirth, gender, employmentType, companyName, monthlyIncome, requestedLoanAmount, loanType, loanTenureMonths, addressLine1, city, state, postalCode) before the API call is made
5. IF a required registration field is empty or invalid, THEN THE Portal SHALL display an inline error message below the offending field and prevent form submission

---

### Requirement 2: User Authentication (Login)

**User Story:** As a registered applicant, I want to log in with my email and password, so that I can access my loan applications.

#### Acceptance Criteria

1. WHEN a user submits the login form with a valid email and password, THE Portal SHALL call `POST /api/v1/Applicants/login` via ApplicantApi
2. WHEN the login API returns `{ token, applicantId, fullName, email }`, THE AuthContext SHALL set the user state and persist `ladvs_user` and `ladvs_token` to localStorage
3. WHEN login succeeds, THE Portal SHALL navigate the user to `/dashboard` and invalidate the `['applications']` React Query cache
4. IF the login API returns an error, THEN THE Portal SHALL display a user-visible toast error message
5. THE Zod_Schema SHALL validate that the email field is a valid email format and the password field is non-empty before the API call is made
6. IF a login field is invalid, THEN THE Portal SHALL display an inline error message below the offending field and prevent form submission

---

### Requirement 3: User Logout

**User Story:** As an authenticated applicant, I want to log out, so that my session is securely terminated.

#### Acceptance Criteria

1. WHEN a user clicks the logout button in AppLayout, THE AuthContext SHALL remove both `ladvs_user` and `ladvs_token` from localStorage atomically
2. WHEN logout is called, THE AuthContext SHALL set the user state to `null`, making `isAuthenticated` become `false`
3. WHEN logout is called, THE Portal SHALL navigate the user to `/login`

---

### Requirement 4: Route Protection

**User Story:** As the system, I want to protect authenticated routes, so that unauthenticated users cannot access private pages.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to any protected route (`/dashboard`, `/apply`, `/applications/:id`), THE ProtectedRoute SHALL redirect the user to `/login` using a `replace` navigation (no back-navigation to the protected route)
2. WHEN an authenticated user navigates to a protected route, THE ProtectedRoute SHALL render the requested page
3. WHEN a 401 response is received from any API call, THE Portal SHALL clear `ladvs_user` and `ladvs_token` from localStorage and redirect the user to `/login`
4. THE AuthProvider SHALL hydrate the user state from `localStorage['ladvs_user']` on initial mount so that page refreshes do not log the user out

---

### Requirement 5: Application Dashboard

**User Story:** As an authenticated applicant, I want to view all my loan applications on a dashboard, so that I can monitor their statuses at a glance.

#### Acceptance Criteria

1. WHEN the DashboardPage mounts, THE Portal SHALL fetch `GET /api/v1/Applications` via ApplicationApi using React_Query with query key `['applications']`
2. WHILE the applications query is loading, THE DashboardPage SHALL display a loading indicator
3. IF the applications query returns an error, THEN THE DashboardPage SHALL display an error state with a retry option
4. WHEN the applications list is empty, THE DashboardPage SHALL display an empty state with a call-to-action button that navigates to `/apply`
5. WHEN applications are returned, THE DashboardPage SHALL render each application as a LoanSummaryCard with a color-coded StatusBadge
6. WHEN a user clicks a LoanSummaryCard, THE DashboardPage SHALL navigate to `/applications/:id` for that application
7. WHEN a user clicks the "New Application" button, THE DashboardPage SHALL navigate to `/apply`

---

### Requirement 6: Multi-Step Loan Application Submission

**User Story:** As an authenticated applicant, I want to submit a new loan application through a guided multi-step form, so that I can apply for a loan with clear step-by-step guidance.

#### Acceptance Criteria

1. THE ApplyPage SHALL present a two-step form: Step 1 collects loan details (loanType, requestedAmount, tenureMonths) and Step 2 collects employment details (employmentType, companyName, monthlyIncome)
2. THE StepIndicator SHALL display the current step number and total steps at all times during the form
3. WHEN a user attempts to advance from Step 1, THE Zod_Schema SHALL validate `loanType`, `requestedAmount`, and `tenureMonths` before advancing; if validation fails, THE Portal SHALL display inline errors and keep the user on Step 1
4. WHEN a user attempts to advance from Step 2, THE Zod_Schema SHALL validate `employmentType`, `companyName`, and `monthlyIncome` before submission; if validation fails, THE Portal SHALL display inline errors and keep the user on Step 2
5. THE Zod_Schema SHALL reject a `requestedAmount` less than 10,000
6. THE Zod_Schema SHALL reject a `tenureMonths` value outside the range [1, 360]
7. THE Zod_Schema SHALL reject a `monthlyIncome` value of 0 or less
8. THE Zod_Schema SHALL reject a `loanType` that is not one of `Personal`, `Home`, `Car`, `Business`, `Education`
9. WHEN the user submits the completed form, THE ApplyPage SHALL call `POST /api/v1/Applications` via ApplicationApi with the form data merged with the authenticated applicant's `applicantId`, `fullName`, and `email` from AuthContext
10. WHEN the application is created successfully, THE Portal SHALL navigate to `/applications/:id` for the new application and invalidate the `['applications']` React Query cache
11. IF the application creation API returns an error, THEN THE Portal SHALL display a user-visible toast error message and keep the user on the form

---

### Requirement 7: Application Detail View

**User Story:** As an authenticated applicant, I want to view the full details and current status of a specific loan application, so that I can track its progress.

#### Acceptance Criteria

1. WHEN the ApplicationDetailPage mounts, THE Portal SHALL fetch `GET /api/v1/Applications/:id` via ApplicationApi using React_Query with query key `['application', id]`
2. WHEN the ApplicationDetailPage mounts, THE Portal SHALL fetch `GET /api/v1/Documents/:id` via DocumentApi using React_Query with query key `['documents', id]`
3. WHILE either the application or documents query is loading, THE ApplicationDetailPage SHALL display skeleton loaders to prevent layout shift
4. IF the application query returns an error, THEN THE ApplicationDetailPage SHALL display an error state
5. WHEN both queries resolve, THE ApplicationDetailPage SHALL render an application summary card showing loanType, requestedAmount, tenureMonths, and a StatusBadge for the current status
6. WHEN the application data is available, THE ApplicationDetailPage SHALL render a status timeline component reflecting the application's current ApplicationStatus
7. WHEN the documents data is available, THE ApplicationDetailPage SHALL render a DocumentUploader section for each required document type

---

### Requirement 8: Document Upload

**User Story:** As an authenticated applicant, I want to upload supporting documents for my loan application, so that my application can be reviewed and processed.

#### Acceptance Criteria

1. WHEN a user selects a file in the DocumentUploader, THE DocumentUploader SHALL validate that the file type is one of `application/pdf`, `image/jpeg`, or `image/png` before initiating the upload
2. WHEN a user selects a file in the DocumentUploader, THE DocumentUploader SHALL validate that the file size does not exceed `maxSizeMB` (default 5 MB) before initiating the upload
3. IF the selected file has an invalid type, THEN THE DocumentUploader SHALL display an inline error message and SHALL NOT call the DocumentApi
4. IF the selected file exceeds the size limit, THEN THE DocumentUploader SHALL display an inline error message and SHALL NOT call the DocumentApi
5. WHEN a valid file is selected, THE DocumentUploader SHALL call `POST /api/v1/Documents/upload` via DocumentApi as a multipart/form-data request with `applicationId`, `applicantId`, `documentType`, and `file`
6. WHILE the upload is in progress, THE DocumentUploader SHALL display an uploading state and disable the upload button
7. WHEN the upload succeeds, THE DocumentUploader SHALL invoke the `onUploadSuccess` callback with the returned `DocumentUploadResponse` and THE ApplicationDetailPage SHALL refetch the documents list
8. WHEN an existing document is present for a document type, THE DocumentUploader SHALL display the existing document's file name and a download link using the `sasUrl`
9. IF the upload API returns an error, THEN THE DocumentUploader SHALL display an inline error message and re-enable the upload button

---

### Requirement 9: Authentication State Persistence

**User Story:** As an authenticated applicant, I want my session to persist across page refreshes, so that I do not have to log in every time I reload the page.

#### Acceptance Criteria

1. WHEN the Portal initializes, THE AuthProvider SHALL read `localStorage['ladvs_user']` and hydrate the user state if a valid JSON object is present
2. WHEN `login()` is called, THE AuthContext SHALL write `ladvs_user` (full AuthUser JSON) and `ladvs_token` (JWT string) to localStorage
3. WHEN `logout()` is called, THE AuthContext SHALL remove both `ladvs_user` and `ladvs_token` from localStorage before any navigation occurs
4. WHILE a user is authenticated, THE Portal SHALL attach the JWT from `localStorage['ladvs_token']` as a `Bearer` token in the `Authorization` header of every ApplicantApi, ApplicationApi, and DocumentApi request

---

### Requirement 10: API Error Handling and User Feedback

**User Story:** As an applicant, I want to receive clear feedback when something goes wrong, so that I understand what happened and can take corrective action.

#### Acceptance Criteria

1. WHEN any API call returns a response where `success === false`, THE Portal SHALL display a user-visible toast error message containing the error detail; the Portal SHALL NOT silently swallow the error
2. WHEN a network error or timeout occurs on any API call, THE React_Query SHALL mark the query as `isError: true` and THE Portal SHALL render an error state with a retry option
3. WHEN a 409 conflict response is received (e.g., duplicate application), THE Portal SHALL display a toast error with the backend error message
4. THE Portal SHALL never display stale data without a loading indicator while a React_Query fetch is in progress

---

### Requirement 11: Shared Layout and Navigation

**User Story:** As an authenticated applicant, I want a consistent navigation bar on all authenticated pages, so that I can easily move between sections of the portal.

#### Acceptance Criteria

1. THE AppLayout SHALL render a persistent top navbar on all authenticated pages (`/dashboard`, `/apply`, `/applications/:id`)
2. THE AppLayout navbar SHALL display the authenticated applicant's full name
3. THE AppLayout navbar SHALL display a logout button that triggers `AuthContext.logout()`
4. THE AppLayout navbar SHALL display navigation links to `/dashboard` and `/apply`
5. THE AppLayout navbar SHALL visually indicate the currently active route

---

### Requirement 12: Status Badge Display

**User Story:** As an applicant, I want application statuses to be displayed with distinct visual indicators, so that I can quickly understand the state of each application.

#### Acceptance Criteria

1. THE StatusBadge SHALL accept a `status` prop of type `ApplicationStatus` (`Submitted`, `UnderReview`, `Approved`, `Rejected`, `DocumentsPending`)
2. WHEN rendered, THE StatusBadge SHALL apply a distinct Tailwind color class for each ApplicationStatus value
3. FOR ALL valid ApplicationStatus values, THE StatusBadge SHALL return a non-empty CSS class string (no status maps to an empty or undefined class)

---

### Requirement 13: React Query Cache Management

**User Story:** As the system, I want React Query caches to be invalidated at the right times, so that users always see up-to-date application data after mutations.

#### Acceptance Criteria

1. WHEN a new application is created successfully, THE Portal SHALL invalidate the `['applications']` React Query cache so the DashboardPage reflects the new application on next render
2. WHEN a user logs in, THE Portal SHALL invalidate the `['applications']` React Query cache to clear any previously cached data
3. WHEN a document is uploaded successfully, THE ApplicationDetailPage SHALL refetch the `['documents', id]` query to reflect the newly uploaded document
