"use client";

import { SessionProvider } from "next-auth/react";

// Makes the NextAuth session available to client components via `useSession`.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
