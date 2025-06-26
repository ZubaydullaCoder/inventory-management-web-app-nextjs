### **Development Breakdown Document**

### **Phase 1: Initial Setup & Onboarding (The Data Entry Cockpit)**

**Goal of the Phase:** To build the core authenticated shell of the application and the highly efficient "Cockpit" interfaces for bulk-creating foundational data (Categories, Suppliers, Customers, Products). By the end of this phase, a newly signed-up user will be guided through the initial data setup process in a seamless, rewarding workflow.

---

#### **Comprehensive Technical Test for Successful Implementation**

_Note on Data Fetching Pattern:_  
**Hybrid Approach Update:**

- For all session/user-specific data, Server Components must fetch data by calling shared service/data functions directly (not via internal API fetch).
- API routes exist for client-driven fetches (e.g., TanStack Query, client-side refetch, widgets) and must use the same shared service/data functions.
- This ensures a single source of truth, maximum performance, and security.

- **Authenticated Layout & Onboarding:**
  - [ ] **Layout:** Upon logging in and landing at `/dashboard`, the main authenticated `AppLayout` must be displayed, consisting of a persistent `Sidebar` (left) and a `TopBar` (top).
  - [ ] **Onboarding Component:** The main content area of the `/dashboard` page must display the "Onboarding Component" checklist for a new user whose account has no data.
  - [ ] **Navigation:** Clicking the buttons in the Onboarding Component (e.g., "Go to Categories") must correctly navigate the user to the respective "Cockpit" creation page (e.g., `/dashboard/inventory/categories/new`).
- **"Cockpit" Pages Functionality:**
  - [ ] **Layout Consistency:** The pages for creating new Categories, Suppliers, Customers, and Products must all use the consistent two-column "Cockpit" layout (`Form` on the left, `SessionCreationList` on the right).
  - [ ] **Form Submission:** Pressing "Enter" or clicking the "Save and Add Another" button in any Cockpit form must:
    - Trigger a `POST` request to the correct API endpoint using a `useMutation` hook.
    - **Implement Optimistic Updates:** The mutation must follow the optimistic update pattern defined in `guide-2-tanstack-query-server-state-management-guide.md`. The `SessionCreationList` on the right must update _instantly_ without waiting for the API response.
    - On success, display a `sonner` success notification (e.g., "Product Saved").
    - On error, display a `sonner` error notification and correctly roll back the UI to its previous state.
    - After a successful mutation, clear the form on the left and return focus to its first input field.
  - [ ] **API & Database:** The backend must have `POST` API endpoints for creating each data type (Category, Supplier, Customer, Product). Each successful request must create a new record in the corresponding database table, correctly linked to the authenticated user's account.
- **Mid-Flow Correction (Modal Editing):**
  - [ ] **Trigger:** Clicking the "Edit" icon next to an item in the `SessionCreationList` must open a traditional modal dialog.
  - [ ] **Data Pre-fill:** The form inside the modal must be pre-filled with the data of the item being edited.
  - [ ] **Update Logic:** Saving the modal form must trigger a `PUT` request to the correct API endpoint using a `useMutation` hook.
    - **Implement Optimistic Updates:** This mutation must also follow the optimistic update pattern. The item's data in the `SessionCreationList` must be visibly updated _instantly_.
    - On success, the modal must close, and a success notification must be shown.
    - On error, the UI must roll back, and an error notification must be shown.
  - [ ] **Reload Behavior:** Reloading the page while the edit modal is open will simply close the modal and return the user to the underlying "Cockpit" page.
- **Finishing the Session:**
  - [ ] **Trigger:** Clicking the "Save and Finish" button must save the current form's data (if any) and then redirect the user to the main `DataTable` view for that data type (e.g., from `/dashboard/inventory/products/new` to `/dashboard/inventory/products`).
- **Main Data List Views (`DataTable`):**
  - [ ] **Page Structure:** The main list pages (e.g., `/dashboard/inventory/products`) must have a `PageHeader` with the correct title and an "Add New Product" button that links to the "Cockpit" page.
  - [ ] **Data Display:** The `DataTable` component must correctly fetch (using the Hybrid SSR pattern) and display the list of items created by the user.
  - [ ] **Empty State:** If no data exists for a given type, the `DataTable` area must display an `EmptyState` component guiding the user to add their first item.
  - [ ] **Actions Menu:** Each row in the `DataTable` must have an "Actions" dropdown menu with an "Edit" option that opens a traditional modal for editing.

---

### **Phase 1: Granular Development Tasks**

#### **Part 1: Foundation - Authenticated Layout & Core Components**

- **Task 1.1 (Shadcn UI Components):** In the terminal, add the following `shadcn/ui` components required for this phase: `input`, `label`, `card`, `table`, `dropdown-menu`, `avatar`, and `tooltip`.
- **Task 1.2 (Database Schema):**
  - Open `prisma/schema.prisma`.
  - Define the `Category`, `Supplier`, `Customer`, and `Product` models.
  - Ensure all models have a direct relation to the `User` model to enforce data ownership. The `Product` model should have optional relations to `Category` and `Supplier`.
- **Task 1.3 (Database Migration):** Run the Prisma migrate command with a name like `add-core-data-models`.
- **Task 1.4 (Authenticated Layout):**
  - Create the main authenticated layout file at `src/app/(dashboard)/dashboard/layout.jsx`.
  - This component will render the `Sidebar` and `TopBar` components.
- **Task 1.5 (Core Components):**
  - Create the `src/components/layouts/sidebar.jsx` component for primary navigation.
  - Create the `src/components/layouts/topbar.jsx` component for breadcrumbs and user actions.
  - Create the `src/components/ui/page-header.jsx` component.
  - Create the `src/components/ui/empty-state.jsx` component.

#### **Part 2: The Dashboard Onboarding Experience**

- **Task 2.1 (Page Creation):** Create the main dashboard page at `src/app/(dashboard)/dashboard/page.jsx`.
- **Task 2.2 (Data Fetching):**  
  This Server Component should fetch counts of the user's products, categories, etc., to determine if the onboarding guide should be shown.  
  _**Hybrid Approach Update:**_  
  Fetch these counts by calling a shared service/data function directly, not by fetching your own API route.

- **Task 2.3 (Onboarding UI):** Create the `src/components/features/dashboard/onboarding-guide.jsx` component. This component will display the step-by-step checklist and contain `<Link>` components pointing to the "Cockpit" pages.
- **Task 2.4 (Conditional Rendering):** In the dashboard page, conditionally render the `OnboardingGuide` if the user has no data; otherwise, prepare to render the main dashboard widgets (to be built in a later phase).

#### **Part 3: The "Cockpit" Creation Workflow (for Products - to be replicated)**

_This workflow will be implemented for Products first, then the pattern will be replicated for Categories, Suppliers, and Customers._

- **Task 3.1 (API Endpoint):** Create the API route `src/app/api/products/route.js`. Implement the `POST` handler for creating a new product. It must follow the Backend Design System: check auth, validate data with Zod, and call a data layer function to interact with Prisma.
- **Task 3.2 (Page Creation):** Create the "Cockpit" page at `src/app/(dashboard)/dashboard/inventory/products/new/page.jsx`.
- **Task 3.3 (Layout):** Implement the two-column layout as defined in the Design System guide.
- **Task 3.4 (Form Component):** Create the `src/components/features/products/product-creation-form.jsx` client component.
  - Use `react-hook-form` and `zod` for form state management and validation.
  - The form's `onSubmit` handler will use a `useMutation` hook from Tanstack Query to call the `POST /api/products` endpoint.
  - **Implement Optimistic Updates:** The mutation must follow the standard optimistic update pattern as defined in the TanStack Query guide (`guide-2-tanstack-query-server-state-management-guide.md`).
  - Implement `onSuccess`, `onError`, and `onSettled` callbacks in the mutation to handle UI feedback (notifications, form resets) and cache management.
- **Task 3.5 (List Component):** Create the `src/components/features/products/prodcut-session-creation-list.jsx` client component. This component will now get its data directly from the TanStack Query cache, removing the need for local state management of the created items.
- **Task 3.6 (State Synchronization):** The parent "Cockpit" page component will no longer need to manage local state for the created items. The `product-creation-form` will update the global TanStack Query cache, and the `product-session-creation-list` will automatically re-render with the new data from that cache.
- **Task 3.7 (Traditional Modal Editing):**
  - Implement a traditional modal dialog for editing items in the `SessionCreationList`.
  - The modal form must be pre-filled with the item's data and use a `useMutation` hook for updates, following optimistic update patterns.
  - On success, close the modal and show a notification; on error, roll back changes and show an error notification.
  - Reloading the page while the modal is open will simply close the modal.

#### **Part 4: The `DataTable` View & Modal Editing (for Products - to be replicated)**

- **Task 4.1 (Headless Table Setup):**
  - Install `@tanstack/react-table`.
  - Create the reusable `src/components/ui/data-table.jsx` component, following Guide #11 and the `shadcn/ui` examples.
- **Task 4.2 (Column Definition):** Create `src/components/features/products/product-columns.jsx`. Define the columns for the products table, including an "Actions" column that renders a `DropdownMenu` with an "Edit" item.
- **Task 4.3 (API Endpoint):** In `src/app/api/products/route.js`, implement the `GET` handler for fetching a paginated list of products. In a new `[id]/route.js` file, implement `GET` (for one product) and `PUT` (for updates).
- **Task 4.4 (Page Creation):** Create the main product list page at `src/app/(dashboard)/dashboard/inventory/products/page.jsx`.
- **Task 4.5 (Data Fetching & Display):**  
  This Server Component will use the Hybrid SSR pattern:  
  _**Hybrid Approach Update:**_  
  For session-specific data, fetch directly from the shared service/data function. Use the API route only for client-driven fetches (e.g., TanStack Query, client-side refetch).

  - It will pass the data and columns to the `DataTable` component.
  - It will handle the case where no products exist by showing the `EmptyState` component.

- **Task 4.6 (Traditional Modal Editing):**
  - Remove intercepting route structure for editing.
  - Implement a traditional modal dialog for editing products from the `DataTable` "Actions" menu.
  - The modal fetches the specific product's data and passes it to a reusable `product-form` component (adapted from the creation form).
  - The form's `onSubmit` uses a `useMutation` hook to call the `PUT /api/products/[id]` endpoint, following optimistic update patterns.
  - On success, close the modal and show a notification; on error, roll back changes and show an error notification.
  - Reloading the page while the modal is open will simply close the modal.

#### **Part 5: Replication**

- **Task 5.1 (Replicate for Categories):** Repeat the patterns from Part 3 and Part 4 to build the full CRUD workflow for Categories, using traditional modals for editing.
- **Task 5.2 (Replicate for Suppliers):** Repeat the patterns to build the full CRUD workflow for Suppliers, using traditional modals for editing.
- **Task 5.3 (Replicate for Customers):** Repeat the patterns to build the full CRUD workflow for Customers, using traditional modals for editing.
