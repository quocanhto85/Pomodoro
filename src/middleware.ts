import { withAuth } from "next-auth/middleware";

// Protects application pages: unauthenticated visitors are redirected to the
// Google sign-in page. API routes guard themselves (returning 401 JSON) and the
// auth pages / static assets are excluded via the matcher below.
export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    // Match everything except: NextAuth & app API routes, the auth pages,
    // Next.js internals, and any file with an extension (static assets).
    "/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
