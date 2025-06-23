// src/components/providers/session-provider-wrapper.jsx
"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side session provider wrapper component
 * @param {{ children: React.ReactNode }} props
 */
export default function SessionProviderWrapper({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
