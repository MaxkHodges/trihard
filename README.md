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

### Supabase local setup

```bash
supabase start          # starts local Supabase stack
supabase db reset       # applies migrations and seed data
npm run db:types        # regenerates TypeScript types from schema
```

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
