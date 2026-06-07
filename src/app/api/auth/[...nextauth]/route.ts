import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth route handler for the App Router. Serves all /api/auth/* endpoints
// (sign in, callback, sign out, session, etc.).
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
