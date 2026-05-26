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

### GitHub branch protection

Enable branch protection on `main` in GitHub → Settings → Branches:
- Require status checks to pass (CI: typecheck, lint)
- Require branches to be up to date before merging
