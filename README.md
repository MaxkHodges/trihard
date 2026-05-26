# TriHard

Adaptive triathlon training app for everyday Olympic and 70.3 athletes.

## Stack

- React Native + Expo (SDK 56)
- Expo Router (file-based navigation)
- Supabase (Postgres, Auth, Storage, Edge Functions)
- TypeScript (strict)
- RevenueCat (subscriptions)
- Sentry (error tracking)
- PostHog (analytics)

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Supabase CLI: `brew install supabase/tap/supabase`

### Install dependencies

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `EXPO_PUBLIC_SUPABASE_URL` — from your Supabase project settings
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project settings

### Supabase — first-time setup

1. Create a free project at [supabase.com](https://supabase.com)
2. In your Supabase project: **Settings → API** — copy the Project URL and anon key into `.env`
3. Link the CLI to your project:

```bash
supabase login                        # opens browser to authenticate
supabase link --project-ref <ref>     # <ref> is the ID from your Supabase project URL
```

### Supabase local development

```bash
supabase start        # starts local Supabase stack (Postgres, Auth, Storage)
npm run db:seed       # resets local DB, applies all migrations + seed data
npm run db:types:local  # regenerates types/database.ts from local schema
supabase stop         # shuts down local stack
```

Run `supabase start` once — it gives you a local URL and anon key to use in `.env` during development.

The seed creates a test user (`dev@trihard.dev` / `password123`) with a full
athlete profile, a 70.3 race 16 weeks out, fitness metrics, and today's check-in.

### Database types

After pushing a migration to the remote database, regenerate TypeScript types:

```bash
npm run db:types        # pulls from remote Supabase project
npm run db:types:local  # pulls from local Supabase stack (must be running)
```

Always commit the updated `types/database.ts` alongside the migration.

### Run the app

```bash
npm run ios       # iOS simulator
npm run android   # Android emulator
npm start         # Expo Go / dev client
```

### Code quality

```bash
npm run typecheck   # TypeScript type check
npm run lint        # ESLint
npm run lint:fix    # ESLint with auto-fix
npm run format      # Prettier
```

### Apple Sign-In setup

Required to ship on iOS. Takes ~30 minutes.

1. **Apple Developer Portal** → Certificates, Identifiers & Profiles → Identifiers → your App ID
   - Enable **Sign In with Apple** capability
2. **Supabase** → Authentication → Providers → Apple → enable and paste your:
   - **Team ID** (top-right of Apple Developer Portal)
   - **Key ID** and **Private Key** (create a new key with Sign In with Apple enabled)
3. Apple Sign-In only works on a **real device or simulator with iOS 13+** — not Expo Go.
   Run `eas build --profile development --platform ios` for a dev build.

### Google Sign-In setup

1. **Google Cloud Console** → APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Create one for **Web** — copy the client ID into `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - Create one for **iOS** — you'll need your iOS bundle ID (`com.yourname.trihard`)
   - Create one for **Android** — you'll need your SHA-1 signing key fingerprint
2. **Supabase** → Authentication → Providers → Google → enable and paste the Web client ID and secret
3. Google Sign-In requires a **native build** — not Expo Go.

### Deploy Edge Functions

```bash
supabase functions deploy delete-account
```

Run this after any change to `supabase/functions/`. The function uses the service role key
which is automatically available as `SUPABASE_SERVICE_ROLE_KEY` in the Edge Function runtime.

### GitHub branch protection

Enable branch protection on `main` in GitHub → Settings → Branches:
- Require status checks to pass (CI: typecheck, lint)
- Require branches to be up to date before merging
