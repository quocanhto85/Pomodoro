import type { NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

/**
 * Authentication configuration for the Pomodoro app.
 *
 * Sign-in is handled entirely through Google OAuth (no passwords). Sessions use
 * a JWT stored in a persistent cookie, so a user stays signed in after closing
 * the tab or browser (see `session.maxAge`).
 */

/**
 * The owner's Google email is mapped to a fixed user id so the existing
 * Pomodoro history (stored under this id) is preserved after the switch to
 * OAuth. Override via env vars if needed.
 */
export const OWNER_EMAIL = (process.env.OWNER_EMAIL ?? "quocanhtophuong@gmail.com")
  .trim()
  .toLowerCase();
export const OWNER_USER_ID = process.env.OWNER_USER_ID ?? "anhtpq";

/**
 * Optional allowlist of emails permitted to sign in. When empty, any Google
 * account may sign in (each gets its own isolated data). Configure with the
 * `ALLOWED_EMAILS` env var (comma-separated).
 */
function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Resolve a Google email into the stable application user id that keys all of a
 * user's Pomodoro data. The owner's email maps to the legacy id; everyone else
 * is keyed by their (normalized) email.
 */
export function userIdFromEmail(email?: string | null): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  return normalized === OWNER_EMAIL ? OWNER_USER_ID : normalized;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
    // 30 days. The session cookie is persistent (not a session-only cookie),
    // so the login survives closing the tab/browser.
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = allowedEmails();
      if (allowed.length === 0) return true; // open to any Google account
      return !!user.email && allowed.includes(user.email.toLowerCase());
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      const userId = userIdFromEmail(email);
      if (userId) token.userId = userId;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.userId;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Resolve the authenticated user's application id inside a Pages Router API
 * route. Returns `null` when the request is unauthenticated.
 */
export async function getUserIdFromRequest(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  const session = await getServerSession(req, res, authOptions);
  return userIdFromEmail(session?.user?.email);
}
