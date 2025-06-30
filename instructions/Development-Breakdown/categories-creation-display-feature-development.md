Part 1: Backend - API & Service Layer Expansion
Task 1.1 (Extend Category Service):

In category-service.js, add new functions for updating and deleting categories: updateCategory(userId, categoryId, data) and deleteCategoryById(userId, categoryId).
The delete function must include a check to prevent deletion if any products are assigned to the category.
Task 1.2 (Create Category Schemas):

Create a new file: src/lib/schemas/category-schemas.js.
Inside, define and export a CategoryFormSchema using Zod for validating the category name and description, applying the normalizeName transform to the name field.
Task 1.3 (Implement API Endpoints):

Create the dynamic API route file: src/app/api/categories/[id]/route.js.
Implement the PUT and DELETE handlers in this file. These handlers will call the corresponding service functions created in Task 1.1, ensuring user authentication and data validation with the new Zod schema.
Part 2: Frontend - The "Cockpit" Creation Workflow
Task 2.1 (Creation "Cockpit" Page):

Create the main page file at src/app/(dashboard)/inventory/categories/new/page.jsx.
This server component will render a PageHeader and the main CategoryCreationCockpit client component.
Task 2.2 (Creation Mutation Hook):

Create a new hook: src/hooks/use-category-creation.js.
This hook will encapsulate the useMutation logic for creating a new category, including optimistic updates that add the new category to the queryKeys.session("categories") cache.
Task 2.3 (Creation Form Component):

Create the src/components/features/categories/category-creation-form.jsx client component.
This form will use react-hook-form with the CategoryFormSchema and will call the mutation from the useCategoryCreation hook on submit.
Task 2.4 (Session List Component):

Create the src/components/features/categories/category-session-creation-list.jsx client component.
This component will read from the queryKeys.session("categories") cache to display a real-time list of categories added in the current session. It will include buttons for editing and deleting session items.
Task 2.5 (Compose the "Cockpit"):

Create the src/components/features/categories/category-creation-cockpit.jsx client component.
This component will render the creation form and the session list in a two-column layout and will manage the state for opening the edit modal.
Part 3: Frontend - DataTable and Modal Editing
Task 3.1 (Main Category List Page):

Create the main category list page at src/app/(dashboard)/inventory/categories/page.jsx.
This server component will fetch the initial list of categories and render a PageHeader and the CategoryDataTable client component.
Task 3.2 (DataTable Columns):

Create src/components/features/categories/category-columns.jsx.
Define the columns for the categories table, including an "Actions" column with "Edit" and "Delete" options.
Task 3.3 (DataTable Component):

Create src/components/features/categories/category-data-table.jsx.
This client component will manage fetching, displaying, and deleting categories using TanStack Query and TanStack Table. It will handle the empty state and render the CategoryEditModal and CategoryDeleteDialog.
Task 3.4 (Edit/Delete Hooks & Modals):

Create the useCategoryEdit hook to manage useQuery for fetching a single category and useMutation for updates and deletions.
Create the CategoryEditModal component, which uses the useCategoryEdit hook and a reusable form for updates.
Create the CategoryDeleteDialog component for confirming deletions.
