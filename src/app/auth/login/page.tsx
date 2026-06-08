import { Timer } from "lucide-react";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { ThemeSwitcher } from "./ThemeSwitcher";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "This Google account isn't allowed to sign in.",
  OAuthAccountNotLinked: "This email is already linked to a different sign-in method.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
  Verification: "The sign-in link is no longer valid. Please try again.",
  default: "Something went wrong while signing in. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default : null;

  return (
    <div data-mode="pomodoro" className="relative min-h-screen bg-pomodoro flex items-center justify-center px-4">
      <div className="absolute right-4 top-4 z-10">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white/20 p-3 rounded-full mb-4">
              <Timer className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/80">Sign in to continue your focus journey</p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-white"
            >
              {errorMessage}
            </div>
          )}

          <GoogleSignInButton callbackUrl={callbackUrl ?? "/"} />

          <p className="mt-6 text-center text-sm text-white/70">
            We use your Google account to sign you in securely
          </p>
        </div>
      </div>
    </div>
  );
}
