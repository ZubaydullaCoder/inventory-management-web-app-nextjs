// src/app/login/page.jsx
import { redirect } from "next/navigation";

/**
 * Fallback login page that redirects to home
 * This handles direct navigation or page reloads to /login
 * Users should only access login through the intercepting modal
 */
export default function LoginPage() {
  redirect("/");
}
