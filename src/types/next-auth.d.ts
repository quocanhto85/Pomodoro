// Module augmentation so the resolved application user id is available on the
// session (client + server) and the JWT, without unsafe casts.
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      /** The application user id used as the key for all Pomodoro data. */
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** The application user id (owner email is mapped to the legacy id). */
    userId?: string;
  }
}
