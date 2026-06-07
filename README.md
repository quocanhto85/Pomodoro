This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Authentication

Sign-in is handled entirely through **Google OAuth** (via [NextAuth](https://next-auth.js.org/)) — there are no passwords. The session is stored in a persistent JWT cookie, so a user stays signed in after closing the tab or browser.

### Setup

1. Copy `.env.example` to `.env.local` and fill in the values.
2. Create an **OAuth 2.0 Client ID** (type: *Web application*) in the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - **Authorized JavaScript origin:** your site URL (e.g. `http://localhost:3000`)
   - **Authorized redirect URI:** `<site URL>/api/auth/callback/google`
     (e.g. `http://localhost:3000/api/auth/callback/google` and your production URL)
3. Generate a secret with `openssl rand -base64 32` for `NEXTAUTH_SECRET`.
4. In production (Vercel), set the same variables under **Settings → Environment Variables**.

### Behavior & options

- **Who can sign in:** any Google account by default. Set `ALLOWED_EMAILS`
  (comma-separated) to restrict sign-in to an allowlist.
- **Per-user data:** each account's Pomodoro history is keyed by its Google
  identity. The owner's email (`OWNER_EMAIL`) is mapped to `OWNER_USER_ID` so the
  pre-existing history is preserved after the switch to OAuth.
- App pages are protected by middleware; the Pomodoro API routes return `401`
  when unauthenticated. Global maintenance endpoints (`/api/pomodoro/migrate`,
  `/api/pomodoro/seed-subjects`) are restricted to the owner.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
