### **Development Breakdown Document**

### **Phase 3: Periodic Management & Review (The Business Health Center)**

**Goal of the Phase:** To build the dashboard, reporting, and accounts management interfaces that empower the `Shop Owner` to move from day-to-day operations to high-level business analysis. This phase will provide clear, digestible, and actionable insights into the shop's financial health and operational status.

---

#### **Comprehensive Technical Test for Successful Implementation**

_This section serves as a detailed checklist. The AI agent's implementation of this phase is considered successful only when all the following criteria are met._

- **Main Dashboard ("Mission Control"):**
  - [ ] **Layout & Data:** The `/dashboard` page, when viewed by a user with existing data, must display the responsive grid layout.
  - [ ] **Date Filtering:** The `DateRangePicker` must be present and functional. Changing the date range (e.g., "This Week," "This Month") must trigger a refetch of all dashboard data, and all KPI `StatCard`s and widgets must update accordingly.
  - [ ] **KPI Row:** The `StatCard`s for "Total Sales," "Total Profit," "Number of Sales," and "Average Sale Value" must display accurate, aggregated data calculated from the backend based on the selected date range.
  - [ ] **Actionable Widgets:**
    - The "Low Stock Items" widget must display a scrollable list of products at or below their reorder point.
    - The "Incomplete Products" widget must list all products created "on-the-fly" that are missing a `purchasePrice`. Clicking an item must open the full product edit modal.
    - The "Accounts Receivable" and "Accounts Payable" widgets must show the correct total amounts owed and provide a link to the respective detailed pages.
  - [ ] **Visualization:** A simple bar chart must render, showing "Sales vs. Profit" for the selected period.
- **Reports & History Pages:**
  - [ ] **Tabbed Layout:** The `/reports` page must use the `PageTabs` component to organize the different views ("Reports," "Sales History," "Purchase History," "Stock Adjustments").
  - [ ] **DataTables:** Each tab's content area must correctly use the `DataTable` component to display the relevant data.
  - [ ] **Interaction:** Clicking on a row in the "Sales History" or "Purchase History" tables must open a modal displaying the full, detailed receipt for that transaction.
- **Accounts Management (Receivable & Payable):**
  - [ ] **Page Content:** The `/customers/receivables` and `/purchases/payables` pages must each display a `DataTable` listing only the customers or suppliers with a non-zero balance.
  - [ ] **Record Payment:** The "Record Payment" action in the `DataTable` must open a modal pre-filled with the customer/supplier's name and their full outstanding balance.
  - [ ] **Update Logic:** Submitting the "Record Payment" modal must trigger a `POST` request to a new API endpoint. On success, the customer/supplier's balance must be correctly decreased in the database, and the `DataTable` on the page must refresh to reflect the change (potentially removing the entry if the balance becomes zero).
- **Subscription Management Page:**
  - [ ] **UI Display:** A page under a `/settings` route must display the three subscription plan `PricingCard`s.
  - [ ] **State Indication:** The user's current plan must be clearly highlighted. An `Alert` component should display their current status (e.g., "You are on the Standard Plan").
  - [ ] **Simulated Flow:** Clicking to "upgrade" or "downgrade" a plan must trigger a confirmation modal and, upon confirmation, update the user's `Subscription` record in the database. No real payment should be processed.

---

### **Phase 3: Granular Development Tasks**

#### **Part 1: Foundation for Reporting & Dashboards**

- **Task 1.1 (Shadcn UI Components):** In the terminal, add the following `shadcn/ui` components required for this phase: `date-picker`, `tabs`, `alert`, and `progress`.
- **Task 1.2 (Charting Library):** Install a simple, modern charting library suitable for React (e.g., `recharts`).
- **Task 1.3 (Backend Logic - Aggregation):**
  - Create a new file in the service layer (e.g., `src/lib/services/reporting-service.js`).
  - Implement complex Prisma aggregation queries within this service. Create functions to calculate total sales revenue, total COGS (Cost of Goods Sold), profit, and other KPIs within a given date range. These functions will be the backbone of the dashboard and reports.
- **Task 1.4 (API Endpoints):**
  - Create a new API route, `/api/dashboard-stats`, that accepts a date range and returns the aggregated data for the KPI `StatCard`s.
  - Create API routes for fetching the data needed for each widget (e.g., `/api/products/low-stock`, `/api/products/incomplete`).

#### **Part 2: The Main Dashboard ("Mission Control")**

- **Task 2.1 (Page Update):** Modify the main dashboard page at `src/app/(dashboard)/dashboard/page.jsx`.
- **Task 2.2 (Data Fetching):** This Server Component will now fetch the initial data for the default date range using the new aggregation endpoints.
- **Task 2.3 (Client-Side State):** The page will need to be a Client Component (or have a Client Component wrapper) to manage the state of the selected date range from the `DateRangePicker`.
- **Task 2.4 (KPI Row):** Create the `src/components/features/dashboard/stat-card.jsx` component. On the dashboard page, map over the fetched KPI data and render a `StatCard` for each metric.
- **Task 2.5 (Widgets):**
  - Create the `src/components/features/dashboard/low-stock-widget.jsx` component.
  - Create the `src/components/features/dashboard/incomplete-products-widget.jsx` component.
  - Compose the dashboard page by arranging these widgets in a responsive grid.
- **Task 2.6 (Chart Integration):** Create a `src/components/features/dashboard/sales-chart.jsx` client component that uses the chosen charting library to visualize the sales vs. profit data.

#### **Part 3: Reports & History Pages**

- **Task 3.1 (Page Creation):** Create the main reports page at `src/app/(dashboard)/reports/page.jsx`.
- **Task 3.2 (Tabbed Layout):**
  - Use the `shadcn/ui` `Tabs` component to create the main layout with tabs for "Reports," "Sales History," etc.
  - Each `TabsContent` section will contain a client component responsible for fetching and displaying its specific data.
- **Task 3.3 (Transaction Ledgers):**
  - For the "Sales History" and "Purchase History" tabs, create components that use the `DataTable` to display a searchable list of all individual transactions.
  - Implement the "View Details" modal using an intercepting route. This modal will fetch and display all line items for the selected transaction.

#### **Part 4: Accounts Management (Payables & Receivables)**

- **Task 4.1 (API Endpoint):** Create a new API route (e.g., `/api/payments`) with `POST` handlers for recording a payment made to a supplier and a payment received from a customer. These handlers must update the `outstanding_debt` or `outstanding_balance` fields respectively.
- **Task 4.2 (Page Creation):** Create the two pages: `src/app/(dashboard)/customers/receivables/page.jsx` and `src/app/(dashboard)/purchases/payables/page.jsx`.
- **Task 4.3 (UI & Data):** Both pages will fetch and display the list of customers/suppliers with non-zero balances in a `DataTable`.
- **Task 4.4 (Record Payment Modal):**
  - Implement the "Record Payment" action using an intercepting route modal.
  - The modal will contain a simple form with a pre-filled amount.
  - The form submission will use a `useMutation` hook to call the payments API endpoint. On success, it must invalidate the relevant query to refresh the `DataTable`.

#### **Part 5: Subscription Management**

- **Task 5.1 (Page Creation):** Create the page at `src/app/(dashboard)/settings/subscription/page.jsx`.
- **Task 5.2 (API Endpoint):** Create an API route (`/api/subscription`) with a `PUT` handler that allows a user to change their `Subscription` status in the database.
- **Task 5.3 (UI Composition):**
  - Use the `PricingCard` components created in Phase 0 to display the available plans.
  - Use an `Alert` component to show the user's current subscription status and limits.
  - The "Upgrade/Downgrade" buttons will trigger a confirmation modal.
- **Task 5.4 (Logic):** The confirmation modal's action will use a `useMutation` hook to call the `PUT /api/subscription` endpoint and update the user's plan.
