# TriHard — Claude Code Context

## 1. Project overview

TriHard is a Runna-style adaptive training app for triathletes. It targets everyday Olympic and 70.3 age-groupers who want high-quality, personalised plans without the complexity of TrainingPeaks or the coaching-focused workflow of TriDot.

The app generates a structured training plan based on a target race, adapts it around real life via a 30-second daily check-in, and explains every session in plain English. Race week and race day are first-class features, not afterthoughts.

## 2. Domain glossary

- **Session**: A single training unit (swim, bike, run, brick, strength, mobility, or rest)
- **Plan**: A complete training programme from today to race day, immutable once generated — changes create new versions
- **Plan block**: A named phase within a plan (base, build, peak, taper, race-week, recovery)
- **Brick**: A combined session involving two disciplines back-to-back, typically bike then run
- **TSS** (Training Stress Score): A measure of training load for a single session, combining duration and intensity
- **CTL** (Chronic Training Load): Exponentially weighted 42-day average of daily TSS — represents fitness
- **ATL** (Acute Training Load): Exponentially weighted 7-day average of daily TSS — represents fatigue
- **TSB** (Training Stress Balance): CTL minus ATL — represents form (positive = fresh, negative = fatigued)
- **FTP** (Functional Threshold Power): The highest average power a cyclist can sustain for ~1 hour, in watts
- **CSS** (Critical Swim Speed): The pace a swimmer can sustain for a 400m effort, expressed per 100m
- **Threshold pace**: The running pace sustainable for approximately 1 hour — used for run intensity targeting
- **Structured workout**: A JSON array of interval steps (warmup, interval, recovery, cooldown) with targets
- **Readiness**: A 0–100 daily signal derived from check-in inputs, TSB, and HealthKit data (sleep/HRV)
- **Adaptation**: A logged change to the plan triggered by a skip, poor readiness, life event, or illness

## 3. Tech stack

- **Mobile**: React Native + Expo (SDK 56), Expo Router for file-based navigation
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **Language**: TypeScript strict mode throughout
- **Subscriptions**: RevenueCat
- **Error tracking**: Sentry
- **Analytics**: PostHog

## 4. Database types

After every Supabase migration, regenerate TypeScript types:
```bash
npm run db:types
```
This updates `types/database.ts`. The Supabase client in `lib/supabase/client.ts` is typed against this file — always keep it in sync.

## 5. Architectural rules

- All database access goes through `lib/db/` wrappers — never call the Supabase client directly in components
- Fitness metrics are append-only — never update a row in `fitness_metrics`, always insert a new one
- Plans are immutable once generated — adaptations create a new plan version via `parent_plan_id`
- No business logic in components — components fetch data via hooks and render it
- No `any` types — use `unknown` and narrow with type guards

## 6. Naming conventions

- Database columns: `snake_case`
- TypeScript identifiers: `camelCase`
- File names: `kebab-case`
- React components: `PascalCase`

## 7. Hard do-nots

- No third-party UI kits beyond what is already in the stack
- No inline SQL in components
- No overwriting fitness metrics rows — always append
- No `console.log` left in committed code
- No `any` types

## 8. Definition of done

Before declaring any task complete, run:
1. `npm run typecheck` — must pass with zero errors
2. `npm run lint` — must pass with zero errors
3. `npm test` — must pass (if tests exist for the changed code)
4. Confirm no `console.log`, no commented-out code, no unexplained TODO markers
5. Summarise what changed and why in 3–5 bullets
