import { redirect } from "next/navigation";

// Registration is no longer a separate step — signing in with Google creates the
// account on first use. Redirect any old links to the single sign-in page.
export default function RegisterPage() {
  redirect("/auth/login");
}
