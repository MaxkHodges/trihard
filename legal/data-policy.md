# TriHard Data Policy

## What we store

| Category | Data | Why |
|----------|------|-----|
| Account | Email address | Authentication and account recovery |
| Profile | Date of birth, experience level, weekly hours | Generating an appropriate training plan |
| Training | Plans, sessions, completed activities | Core product functionality |
| Health | Sleep quality, fatigue, motivation, soreness (self-reported) | Daily readiness scoring and plan adaptation |
| Device | HealthKit sleep/HRV (read-only, iOS only) | Readiness signal improvement |
| Integrations | Strava OAuth tokens, activity data | Automatic activity import |

## What we do not store

- Payment card details (handled entirely by RevenueCat / Apple / Google)
- Location data
- Contacts or calendar data
- Data from any app other than those explicitly connected by the user

## Data retention

Your data is retained for as long as your account is active. When you delete your account, all data is permanently and immediately deleted from our systems. There are no backups of deleted accounts.

## Account deletion

In-app account deletion is available at **Settings → Delete account**. Deleting your account:

1. Immediately invalidates your session
2. Permanently deletes all rows associated with your user ID across every table:
   - athlete_profile, fitness_metrics, races, plans, plan_blocks, sessions
   - completed_activities, daily_check_ins, readiness_scores, training_load
   - adaptations, race_plans, equipment
3. Deletes your authentication record

This is irreversible. We do not offer data export at this time — this will be added before public launch to comply with GDPR Article 20.

## Third-party services

| Service | Purpose | Data shared |
|---------|---------|-------------|
| Supabase | Database and authentication | All user data (EU region) |
| RevenueCat | Subscription management | User ID, purchase events |
| Sentry | Error reporting | User ID, device info, crash traces |
| PostHog | Analytics | User ID, feature usage events |
| Strava | Activity import | OAuth tokens, activity data |
| Apple HealthKit | Readiness signal | Sleep, HRV (read-only, never leaves device in raw form) |

## Contact

For data requests or questions: **privacy@trihard.dev** (set up before launch)
