### **Guide 12: Application Design System & Component Library**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Core Philosophy & Aesthetic**

This document defines the visual language and component library for the application. The goal is to create a **minimalist, modern, and consistent** user interface that is professional and intuitive for inventory management tasks.

The design system is built upon three pillars:

1.  **Design Tokens:** A core set of predefined values (colors, fonts, spacing) that ensure consistency.
2.  **`shadcn/ui`:** Our base component library, providing accessible and unstyled primitives.
3.  **Custom Application Components:** A curated set of reusable components built by composing and styling `shadcn/ui` primitives according to our specific needs.

**2. Foundations (Design Tokens)**

These are the primitive values of our design. They **must** be configured in `tailwind.config.js` and the global CSS file to ensure application-wide consistency.

#### **2.1. Color Palette**

We will customize the default `shadcn/ui` color theme. The AI agent, during initial setup, must modify the `globals.css` file with these HSL values. This provides a consistent, modern, and professional color scheme with our chosen primary color.

- **Primary Color:** `#359EFF`
- **AI Action:** During project setup, use a color converter to get the HSL values for our primary color and update the CSS variables in `globals.css`. Then, use the `shadcn-ui theme` command or manually update the theme configuration.

  **Example `globals.css` modifications:**

  ```css
  /* This is a conceptual example. The AI will generate the full list of variables. */
  :root {
    --background: 0 0% 100%; /* White */
    --foreground: 222.2 84% 4.9%; /* Dark Slate Gray */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    /* Our Primary Brand Color: #359EFF */
    --primary: 214 100% 61%;
    --primary-foreground: 210 40% 98%; /* A light color for text on primary buttons */

    --secondary: 210 40% 96.1%; /* Light Gray */
    --secondary-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%; /* Red */
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 214 100% 61%; /* Ring color for focus states, matches primary */

    --radius: 0.5rem; /* Default border radius */
  }

  .dark {
    /* AI will generate corresponding dark theme variables */
  }
  ```

#### **2.2. Typography**

To achieve a modern and clean look, we will use the "Inter" font family.

- **Font:** Inter
- **AI Action:** In the root `layout.jsx`, the AI must use `next/font` to import and apply the Inter font to the entire application.

  ```javascript
  // src/app/layout.jsx
  import { Inter } from "next/font/google";
  const inter = Inter({ subsets: ["latin"] });

  export default function RootLayout({ children }) {
    return (
      <html lang="en" className={inter.className}>
        {/* ... */}
      </html>
    );
  }
  ```

#### **2.3. Spacing & Sizing**

- **Rule:** All margins, padding, and gaps **must** use Tailwind's default spacing scale (e.g., `p-4`, `m-8`, `gap-2`). This ensures a consistent visual rhythm. Do not use arbitrary values like `p-[10px]`.

#### **2.4. Border Radius**

- **Rule:** The standard border radius for all elements (cards, buttons, inputs) is defined by the `--radius` CSS variable, which is set to `0.5rem`. This corresponds to the `rounded-md` utility class in Tailwind.

**3. The Core Component Library**

This is the catalog of our application's specific, reusable components. The AI agent **must** use these components wherever applicable, rather than creating one-off styles. They are built by styling and composing `shadcn/ui` primitives.

- **`PrimaryButton`**
  - **Purpose:** For the main, most important action on a page or in a modal.
  - **Composition:** A styled `shadcn/ui` `Button` component using the `primary` color variant.
- **`SecondaryButton`**
  - **Purpose:** For secondary actions that are less important than the primary action.
  - **Composition:** A styled `shadcn/ui` `Button` with the `secondary` color variant.
- **`PageHeader`**
  - **Purpose:** To provide a consistent title and action bar for every main page.
  - **Composition:** An `<h1>` for the title and a container for action buttons (e.g., a `PrimaryButton` for "Add New Product").
- **`Modal`**
  - **Purpose:** To provide a focused context for tasks like editing or creating items.
  - **Composition:** Built using `shadcn/ui`'s `Dialog` component. It will include a `DialogHeader`, `DialogTitle`, `DialogContent`, and `DialogFooter`.
- **`DataTable`**
  - **Purpose:** The standard for displaying all lists of data.
  - **Composition:** A complex component built using `@tanstack/react-table` and styled with `shadcn/ui`'s `Table` components, as detailed in Guide #11.
- **`StatCard`**
  - **Purpose:** To display a key performance indicator (KPI) on the dashboard.
  - **Composition:** Built using `shadcn/ui`'s `Card` component. It will contain a title (`CardTitle`), a large metric display (`CardContent`), and an optional description (`CardDescription`).
- **`CreatableSelect`**
  - **Purpose:** A specialized dropdown that allows users to either select an existing item or create a new one on the fly (e.g., for customers or suppliers).
  - **Composition:** This will be built using a combination of `shadcn/ui`'s `Command` and `Popover` components to create a custom combobox experience.

**4. Layout & Composition Patterns**

This section defines how core components are assembled into consistent page layouts.

- **The "Cockpit" Layout:**
  - **Purpose:** For bulk data entry screens.
  - **Structure:** A responsive two-column grid. The left column contains the main data entry `Form`. The right column contains the `SessionCreationList` component to show immediate feedback.
- **The `DataTable` Page Layout:**
  - **Purpose:** For all main data list views.
  - **Structure:** A single-column layout containing the `PageHeader` at the top, followed by a filter/search bar, and finally the main `DataTable` component.
- **The Main Dashboard Layout:**
  - **Purpose:** For the "Mission Control" overview.
  - **Structure:** A responsive grid layout. It will feature a row of `StatCard` components at the top, followed by a multi-column grid of actionable widgets.

**5. Iconography**

- **Library:** `lucide-react` is the exclusive icon library for this project.
- **Consistency:** The AI must ensure icons are used consistently. For example, the "edit" action should always use the same icon (`Pencil`), and the "delete" action should always use another (`Trash2`).
- **Sizing:** Use standard Tailwind size classes (`h-4 w-4`, `h-5 w-5`) to maintain visual harmony.

**6. AI Agent's Responsibility**

- **Setup First:** During the initial project setup phase, the AI must configure `tailwind.config.js` and `globals.css` according to the tokens defined in this guide.
- **Component-First Development:** The AI must prioritize creating and using the reusable components defined in this guide.
- **No One-Off Styles:** The AI should avoid applying one-off, arbitrary styles. All visual elements should be derived from the design tokens and component library.
- **Adherence to Layouts:** When creating new pages, the AI must adhere to the standard page layout patterns defined here.
