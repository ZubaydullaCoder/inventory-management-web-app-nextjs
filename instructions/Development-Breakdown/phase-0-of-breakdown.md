### **Development Breakdown Document**

### **Phase 0: Discovery & Authentication (The Front Door)**

**Goal of the Phase:** To establish the application's public-facing presence and implement a secure, frictionless user authentication system. By the end of this phase, a new user will be able to visit the landing page, understand the product's value, and sign up for a 14-day free trial using their Google account.

---

#### **Comprehensive Technical Test for Successful Implementation**

_This section serves as a detailed checklist. The AI agent's implementation of this phase is considered successful only when all the following criteria are met._

- **Landing Page & Layout:**
  - [ ] **Visuals:** The public landing page at the root URL (`/`) must render correctly, displaying the Header, Hero, Features, Pricing, CTA, and Footer sections as defined in the UI/UX guide.
  - [ ] **Responsiveness:** The landing page must be fully responsive and functional on mobile, tablet, and desktop screen sizes without any content overflow or broken layouts.
  - [ ] **Branding:** The primary color (`#359EFF`) and "Inter" font must be applied correctly across all elements as per the Design System guide.
- **Authentication Flow (Happy Path):**
  - [ ] **Trigger:** Clicking any "Start Free Trial" or "Login" button on the landing page must open an `AuthModal` (traditional modal component) over the current page. The URL should remain unchanged.
  - [ ] **Google Sign-In:** Clicking the "Continue with Google" button must initiate the standard Google OAuth pop-up flow.
  - [ ] **Database Creation:** Upon successful first-time authentication, a new `User` record must be created in the database with the user's Google profile information.
  - [ ] **Trial Subscription:** Simultaneously, a new `Subscription` record must be created, linked to the new user, with a status of `TRIAL` and an `expiresAt` date set to 14 days in the future.
  - [ ] **Redirection:** After successful sign-in and database creation, the user must be redirected to the `/dashboard` page.
- **Authentication Flow (Edge Cases & Security):**
  - [ ] **Modal State:** If the user reloads the page while the `AuthModal` is open, the modal should close and the user should remain on the landing page.
  - [ ] **Authentication Failure:** If the Google OAuth flow fails or is cancelled by the user, the `AuthModal` must remain open, and a non-intrusive error notification must be displayed using `sonner` (e.g., "Authentication failed. Please try again.").
  - [ ] **Authenticated User on Public Page:** If a logged-in user attempts to navigate to the landing page (`/`), the middleware must intercept the request and redirect them to `/dashboard`.
- **Backend & Database:**
  - [ ] **Schema:** The `User` and `Subscription` tables must exist in the database with the correct columns and relations as defined in the `schema.prisma` file.
  - [ ] **API Security:** The `/api/auth/*` endpoints must function correctly. The JWT session cookie must be set as `HttpOnly` and secure.
  - [ ] **Environment:** The application must start and run correctly using the environment variables defined in `.env.local`.

---

### **Phase 0: Granular Development Tasks**

#### **Part 1: Project Foundation & Initial Setup**

- **Task 1.1 (Packages):** In the terminal, install all necessary core dependencies: `next-auth@beta`, `prisma`, `@prisma/client`, `@tanstack/react-query`, `zod`, `lucide-react`, `zustand`, and `react-hook-form`.
- **Task 1.2 (Prisma):** Initialize Prisma by running its `init` command. This will create the `prisma` directory and the `schema.prisma` file.
- **Task 1.3 (Configuration):** Create and configure the `jsconfig.json` file in the project root to enable path aliases (`@/*`) and JS type-checking, as specified in the Next.js guide.
- **Task 1.4 (Design System Setup):**
  - Modify the `tailwind.config.js` file to align with the Design System guide.
  - Modify the `globals.css` file to include the HSL color variables for our light and dark themes, as specified in the Design System guide.
- **Task 1.5 (Shadcn UI Components):** In the terminal, add the following core `shadcn/ui` components required for this phase using the specified CLI command (`npx shadcn@2.3.0 add [component]`): `button`, `dialog`, and `sonner`.

#### **Part 2: Backend - Database & Authentication Service**

- **Task 2.1 (Environment):** Create the `.env.local` file. Add the `DATABASE_URL` from Neon, a securely generated `AUTH_SECRET`, and placeholders for `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
- **Task 2.2 (Schema Definition):**
  - Open `prisma/schema.prisma`.
  - Define the `User` model with fields for `id`, `name`, `email`, `image`, and relations.
  - Define the `Subscription` model with fields for `id`, `status` (using an `enum` for `TRIAL`, `BASIC`, `STANDARD`, `PREMIUM`), `expiresAt`, and a relation to the `User`.
- **Task 2.3 (Database Migration):** Run the Prisma migrate command (`npx prisma migrate dev`) with a descriptive name like `initial-auth-schema` to create the tables in the database.
- **Task 2.4 (Auth.js Configuration):**
  - Create the `src/lib/auth.config.js` file. Configure it with the Google provider and the JWT session strategy.
  - Implement the `callbacks` object. The `jwt` callback must contain the logic to create the `User` and their trial `Subscription` in the database on their first sign-in. The `session` callback must expose the user's ID to the client. The `authorized` callback must contain the redirection logic for already-authenticated users.
- **Task 2.5 (Auth.js Initialization):** Create the `src/auth.js` file to initialize NextAuth with the config and export the handlers and helper functions.
- **Task 2.6 (API Route):** Create the catch-all API route for Auth.js at `src/app/api/auth/[...nextauth]/route.js`.
- **Task 2.7 (Middleware):** Create the `src/middleware.js` file at the root of the `src` directory to protect routes and handle redirects as defined in the auth configuration.

#### **Part 3: Frontend - Core Layout & Public Components**

- **Task 3.1 (Root Layout):**
  - Create the root `src/app/layout.jsx`.
  - In this file, import and apply the "Inter" font as per the Design System guide.
  - Wrap the `children` with the `SessionProviderWrapper` and `QueryProvider`.
  - Add the `Sonner` component inside the `<body>` to make notifications available globally.
- **Task 3.2 (Reusable Public Components):**
  - Create the `src/components/ui/primary-button.jsx` component based on the Design System guide.
  - Create the `src/components/features/landing/app-header.jsx` component for the public-facing header.
  - Create the `src/components/features/landing/app-footer.jsx` component.
  - Create the `src/components/features/landing/feature-card.jsx` component.
  - Create the `src/components/features/landing/pricing-card.jsx` component.

#### **Part 4: Frontend - Building the Public Landing Page**

- **Task 4.1 (Page Creation):** Create the main landing page file at `src/app/page.jsx`.
- **Task 4.2 (Composition):** Compose the landing page by importing and arranging the components created in Part 3. Build out the Hero, Features, Pricing, and CTA sections as described in the UI/UX guide.
- **Task 4.3 (Linking):** Ensure all "Start Free Trial" and "Login" buttons open the `AuthModal` (traditional modal) when clicked, instead of navigating to a new route.

#### **Part 5: Frontend - Implementing the Traditional Auth Modal**

- **Task 5.1 (Modal Component):** Create a reusable `AuthModal` component using the `shadcn/ui` `Dialog` component. The modal should have a title like "Welcome".
- **Task 5.2 (Modal Integration):** Integrate the `AuthModal` into the root layout or a top-level provider so it can be triggered from anywhere on the landing page.
- **Task 5.3 (Sign-In UI):**
  - Inside the modal, create a client component named `google-signin-button.jsx`.
  - The button should display "Continue with Google" and use the `signIn('google', { callbackUrl: '/dashboard' })` function from `next-auth/react` in its `onClick` handler.
- **Task 5.4 (Error Handling):** Wrap the `signIn` call in a `try...catch` block. If an error is caught, use the `toast.error()` function from `sonner` to display a user-friendly error message.
- **Task 5.5 (Modal State):** Ensure modal open/close state is managed via React state or context, and that the modal closes on successful authentication or when the user dismisses it.
