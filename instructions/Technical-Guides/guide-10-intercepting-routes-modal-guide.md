### **Guide 10: Intercepting Routes for Contextual Modals (with Redirect on Reload)**

**Version:** 1.1
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction & Goal**

This document outlines the specific architectural pattern for implementing modals using **Next.js Parallel and Intercepting Routes**.

The primary goal is to leverage URL state for modals while ensuring the application feels like a true Single-Page Application (SPA).

**Key Requirement:** Modal URLs should **not** be permanent, shareable pages. If a user reloads the page while a modal is open, or navigates to the modal's URL directly, they **must be redirected back to the underlying base page**.

**2. Core Concept**

We use a combination of Next.js App Router features:

- **Parallel Routes:** Define a `@modal` "slot" in layouts to render modal content alongside primary page content
- **Intercepting Routes:** "Catch" navigation to standard routes and render them in the modal slot instead
- **Route Groups:** Isolate modal functionality to specific page contexts
- **Fallback Routes:** Handle direct navigation/reloads with redirect logic

**3. The Implementation Pattern: Step-by-Step**

The AI agent must follow these steps precisely when implementing modals.

**Example Use Case:** Login modal that can be triggered from the root layout.

#### **Step 1: Create the Route Group and Parallel Route Structure**

For the login modal (root level), the structure should be:

src/app/ ├── @modal/ <-- Parallel route slot │ ├── (.)login/ <-- Intercepting route (same level) │ │ └── page.jsx <-- Modal UI component │ └── default.jsx <-- Default slot content (returns null) ├── login/ │ └── page.jsx <-- Fallback redirect route ├── layout.jsx <-- Root layout (renders modal slot) └── page.jsx <-- Landing page

For dashboard-level modals (e.g., product editing), use route groups:
src/app/(dashboard)/ ├── products/ │ ├── @modal/ <-- Parallel route slot │ │ ├── (..)products/[id]/edit/ <-- Intercepting route (one level up) │ │ │ └── page.jsx <-- Modal UI component │ │ └── default.jsx <-- Default slot content │ ├── [id]/ │ │ └── edit/ │ │ └── page.jsx <-- Fallback redirect route │ ├── layout.jsx <-- Products layout (renders modal slot) │ └── page.jsx <-- Products list page └── layout.jsx <-- Dashboard layout

#### **Step 2: Create the Default Slot Handler**

Every `@modal` directory must include a `default.jsx` file:

```javascript
// src/app/@modal/default.jsx
/**
 * Default slot content for when no modal is active
 * @returns {null}
 */
export default function DefaultModal() {
  return null;
}
Step 3: Update the Layout to Render the Modal Slot
// src/app/layout.jsx (for root-level login modal)
/**
 * Root layout component
 * @param {{ children: React.ReactNode, modal: React.ReactNode }} props
 */
export default function RootLayout({ children, modal }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <QueryProvider>
            {children}
            {modal}
            <Toaster />
          </QueryProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
Step 4: Create the Intercepting Route (Modal UI)
// src/app/@modal/(.)login/page.jsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Authentication modal component
 */
export default function AuthModal() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * Handle Google sign in
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      });

      if (result?.error) {
        toast.error('Failed to sign in. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome Back</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <p className="text-center text-muted-foreground">
            Sign in to access your retail management dashboard
          </p>
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
Step 5: Create the Fallback Redirect Route
// src/app/login/page.jsx
import { redirect } from 'next/navigation';

/**
 * Fallback login page that redirects to home
 * This handles direct navigation or page reloads
 */
export default function LoginPage() {
  redirect('/');
}
Step 6: Trigger the Modal
// In any component (e.g., AppHeader)
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Trigger the modal with a standard Link
<Button asChild>
  <Link href="/login">Login</Link>
</Button>
4. Interceptor Path Conventions

(.) - Same level (for root-level interceptors)
(..) - One level up (most common for nested routes)
(..)(..) - Two levels up
(...) - From app root
Important: The convention is based on route segments, not file system levels. @modal slots don't count as segments.

5. Modal Component Requirements

Must be Client Components ('use client')
Must handle close events with router.back()
Must use shadcn/ui Dialog as base component
Must implement error handling with sonner toasts
Must prevent redirect on successful actions
6. When to Use This Pattern

Use for:

Login/authentication flows
Editing existing resources (products, customers)
Viewing resource details (sale receipts, reports)
Creating resources in context (on-the-fly customer creation)
Don't use for:

Simple confirmations ("Are you sure?")
Tooltips or dropdowns
Form validation messages
7. AI Agent's Responsibility

Create complete structure including route groups, slots, and fallbacks
Implement proper error handling with loading states and toast notifications
Ensure accessibility through proper dialog implementation
Test redirect behavior for direct navigation and reloads
Use consistent naming following the established conventions
```
