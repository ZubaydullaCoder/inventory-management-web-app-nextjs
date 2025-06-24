### **Development Breakdown Document**

### **Phase 2: Daily Operations (The High-Speed Cockpit)**

**Goal of the Phase:** To build the specialized, highly optimized interfaces for the two most frequent and time-sensitive tasks: processing sales and receiving new stock. The design must prioritize speed, keyboard-centric control, and intuitive clarity to maximize user efficiency.

---

#### **Comprehensive Technical Test for Successful Implementation**

_Note on Data Fetching Pattern:_  
**Hybrid Approach Update:**

- For all session/user-specific data, Server Components must fetch data by calling shared service/data functions directly (not via internal API fetch).
- API routes exist for client-driven fetches (e.g., TanStack Query, client-side refetch, widgets) and must use the same shared service/data functions.
- This ensures a single source of truth, maximum performance, and security.

- **Sales (POS) Screen:**
  - [ ] **Layout:** The `/sales` page must render the dedicated two-column `POSLayout`. This layout must be full-screen and responsive, transforming into a usable single-column or tabbed view on mobile.
  - [ ] **Keyboard Focus:** On page load, keyboard focus must automatically be placed in the `ProductSearchInput`.
  - [ ] **Product Search:** Typing in the search input must trigger a debounced query to the backend, displaying matching products instantly.
  - [ ] **Keyboard Workflow:** The full keyboard-centric workflow must be implemented as defined in the UI/UX guide:
    - `Enter` on a search result adds the item to the transaction list.
    - Focus immediately moves to the `Selling Price` input of the new line item.
    - `Enter` on `Selling Price` moves focus to `Quantity`.
    - `Enter` on `Quantity` finalizes the line item and returns focus to the `ProductSearchInput`.
    - `Up Arrow` from the search input must move focus into the transaction list for editing.
  - [ ] **On-the-Fly Product Creation:** Clicking the "+" button next to the search bar must open a minimal modal to add a new, "incomplete" product (Name, Selling Price). Upon saving, this product must be immediately available in the current transaction.
  - [ ] **Cash Sale Finalization:** Clicking "Complete Sale (Cash)" must trigger a `POST` request to the sales API. On success, the transaction list must clear, a success `sonner` notification must appear, and the system must be ready for a new sale. The stock levels for sold products must be correctly decremented in the database.
- **"Finalize On Account" Workflow:**
  - [ ] **Modal Trigger:** Clicking "Finalize On Account" must open the intercepting route modal for selecting or creating a customer.
  - [ ] **Customer Search:** The `CreatableSelect` component inside the modal must be auto-focused and allow searching for existing customers or creating a new one.
  - [ ] **State Update:** Selecting an existing customer must populate the disabled `CustomerInfoForm` and display their current outstanding balance. The form fields must become editable.
  - [ ] **Finalization:** Clicking "Save and Complete Sale" must:
    - Trigger the sales API `POST` request.
    - On success, the sale must be linked to the customer, and their `outstanding_balance` in the database must be increased by the sale's total amount.
    - The modal must close, and the main sales screen must reset for the next transaction.
- **Receive Stock Page:**
  - [ ] **Layout:** The `/inventory/receive-stock` page must use the same two-column "Cockpit" layout as the creation pages from Phase 1.
  - [ ] **Supplier Selection:** The `CreatableSelect` for suppliers must allow searching for or creating a supplier on-the-fly.
  - [ ] **Product Entry:** The product entry workflow must mirror the sales screen for adding items to a list.
  - [ ] **On-the-Fly Product Creation:** The "+" button must open a modal containing the **full product creation form**, including the `purchasePrice` field, as this is critical information known at the time of receiving stock.
  - [ ] **Finalization:** Clicking "Add to Inventory" must trigger a `POST` request to a purchases/receiving API. The stock levels for received products must be correctly incremented. If "On Credit" is selected, the supplier's `outstanding_debt` must be increased.

---

### **Phase 2: Granular Development Tasks**

#### **Part 1: Foundation & Shared Components for Daily Operations**

- **Task 1.1 (Shadcn UI Components):** In the terminal, add the following `shadcn/ui` components required for this phase: `command` (for building the creatable select) and `popover`.
- **Task 1.2 (Database Schema):**
  - Open `prisma/schema.prisma`.
  - Define the `Sale` model (linking to `User` and `Customer`) and the `SaleItem` model (linking `Sale` to `Product`).
  - Define the `Purchase` model (linking to `User` and `Supplier`) and the `PurchaseItem` model.
  - Add the `outstanding_balance` field to the `Customer` model and `outstanding_debt` to the `Supplier` model.
- **Task 1.3 (Database Migration):** Run the Prisma migrate command with a name like `add-sales-and-purchases-schema`.
- **Task 1.4 (Specialized Components):**
  - Create the `src/components/ui/product-search-input.jsx` component. This will be a client component that encapsulates the logic for debounced searching.
  - Create the `src/components/ui/creatable-select.jsx` component. This will be a reusable component built from `shadcn/ui`'s `Command` and `Popover` for searching/creating customers and suppliers.

#### **Part 2: The Sales (POS) Screen**

- **Task 2.1 (API Endpoint):**  
  Create the API route `src/app/api/sales/route.js`.  
  _**Hybrid Approach Update:**_  
  The API handler must call a shared service/data function for all business logic. Server Components must call this function directly for SSR.

- **Task 2.2 (Page Creation):** Create the main sales page at `src/app/(dashboard)/sales/page.jsx`. This will be a client component, as the entire screen is a single, stateful application.
- **Task 2.3 (Layout):** Implement the dedicated, responsive two-column `POSLayout`.
- **Task 2.4 (Transaction State):** Use `useState` or `useReducer` within the sales page component to manage the state of the current in-progress transaction (the list of line items, customer info, etc.).
- **Task 2.5 (Action Zone - Left Column):**
  - Integrate the `ProductSearchInput` component.
  - Implement the `IconButton` for "On-the-Fly Product" creation, which will open a modal.
- **Task 2.6 (Status Zone - Right Column):**
  - Create the `src/components/features/sales/transaction-line-item.jsx` component. This component must contain the editable inputs for `Selling Price` and `Quantity`.
  - Implement the logic where changing one input (`Quantity` or `Total Line Price`) recalculates the other.
  - Build the `TransactionList` that maps over the current transaction state and renders the line items.
  - Implement the "Checkout Area" with the two finalization buttons.
- **Task 2.7 (Keyboard Workflow):** Implement the focus management logic using `useRef` for the various input fields and event handlers (`onKeyDown`) to capture `Enter` and `Arrow` key presses to control the flow as defined in the UI/UX guide.

#### **Part 3: The "Finalize On Account" Modal Workflow**

- **Task 3.1 (Modal Setup):** Implement the intercepting route structure for the "On Account" flow, e.g., at `src/app/(dashboard)/sales/@modal/finalize-on-account/`. Create the corresponding redirect fallback page.
- **Task 3.2 (Modal UI):**
  - Create the modal UI page within the intercepting route folder.
  - At the top, integrate the `CreatableSelect` component for finding/creating a customer.
  - Below it, create a disabled `CustomerInfoForm` component.
  - Include the `StatCard` for displaying the "Current Outstanding Balance".
- **Task 3.3 (Interaction Logic):**
  - When a customer is selected from the `CreatableSelect`, fetch their full details, populate the form, make the form fields editable, and display their balance.
  - If a new customer is created, simply enable the form for data entry.
  - The "Save and Complete Sale" button's `onClick` handler will pass the selected customer's ID along with the transaction data to the sales finalization mutation.

#### **Part 4: The "Receive Stock" Page**

- **Task 4.1 (API Endpoint):**  
  Create an API route for receiving stock (e.g., `src/app/api/purchases/route.js`).  
  _**Hybrid Approach Update:**_  
  The API handler must call a shared service/data function for all business logic. Server Components must call this function directly for SSR.

- **Task 4.2 (Page Creation):** Create the page at `src/app/(dashboard)/inventory/receive-stock/page.jsx`.
- **Task 4.3 (UI Composition):**
  - Reuse the "Cockpit" layout.
  - In the left column, use the `CreatableSelect` for suppliers and the `ProductSearchInput` for adding products to the receiving session.
  - The "+" button for on-the-fly product creation must open a modal containing the **full product creation form**.
  - The right column will show a summary and the finalization buttons ("Paid in Full" or "On Credit").
- **Task 4.4 (Logic):** Implement the client-side state management and mutation hooks required to track the receiving session and call the backend API upon finalization.
