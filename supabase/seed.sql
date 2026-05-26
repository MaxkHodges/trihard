-- =============================================================================
-- seed.sql — Local development seed data for TriHard
-- Applied automatically by: supabase db reset  (npm run db:seed)
--
-- Uses a fixed UUID so the dataset is deterministic across resets.
-- This seed bypasses RLS because it runs as the postgres role.
-- =============================================================================

-- Fixed test user UUID — used everywhere so foreign keys resolve cleanly
-- DO NOT change this value or the seed will break.
DO $$
DECLARE
  test_user_id  UUID := '00000000-0000-0000-0000-000000000001';
  test_race_id  UUID := '00000000-0000-0000-0000-000000000002';
BEGIN

-- ---------------------------------------------------------------------------
-- 1. Auth user (local only — remote auth users are created via the dashboard)
-- ---------------------------------------------------------------------------

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  test_user_id,
  'dev@trihard.dev',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  FALSE,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Athlete profile
-- Experienced age-grouper: 8h/week, turbo trainer, 25m pool,
-- open water April (4) through October (10)
-- ---------------------------------------------------------------------------

INSERT INTO athlete_profile (
  user_id,
  experience_level,
  weekly_hours_target,
  preferred_long_day_bike,   -- Saturday = 6
  preferred_long_day_run,    -- Sunday = 0
  preferred_long_day_swim,   -- Wednesday = 3
  has_turbo,
  pool_length_m,
  open_water_access,
  open_water_season_months
) VALUES (
  test_user_id,
  'experienced',
  8.0,
  6,
  0,
  3,
  TRUE,
  25,
  TRUE,
  '{4,5,6,7,8,9,10}'
)
ON CONFLICT (user_id) DO UPDATE SET
  experience_level          = EXCLUDED.experience_level,
  weekly_hours_target       = EXCLUDED.weekly_hours_target,
  preferred_long_day_bike   = EXCLUDED.preferred_long_day_bike,
  preferred_long_day_run    = EXCLUDED.preferred_long_day_run,
  preferred_long_day_swim   = EXCLUDED.preferred_long_day_swim,
  has_turbo                 = EXCLUDED.has_turbo,
  pool_length_m             = EXCLUDED.pool_length_m,
  open_water_access         = EXCLUDED.open_water_access,
  open_water_season_months  = EXCLUDED.open_water_season_months;

-- ---------------------------------------------------------------------------
-- 3. Target race — 70.3 in 16 weeks, rolling, lake swim, B priority
-- ---------------------------------------------------------------------------

INSERT INTO races (
  id,
  user_id,
  name,
  race_date,
  distance,
  course_profile,
  swim_type,
  wetsuit_likely,
  priority,
  notes
) VALUES (
  test_race_id,
  test_user_id,
  'Dev Test 70.3',
  CURRENT_DATE + INTERVAL '16 weeks',
  'half_ironman',
  'rolling',
  'lake',
  TRUE,
  'B',
  'Seed data race — 16 weeks out'
)
ON CONFLICT (id) DO UPDATE SET
  race_date      = EXCLUDED.race_date,
  notes          = EXCLUDED.notes;

-- ---------------------------------------------------------------------------
-- 4. Fitness metrics
-- FTP: 240W | Threshold run pace: 270 sec/km (4:30/km) | CSS: 105 sec/100m (1:45)
-- ---------------------------------------------------------------------------

INSERT INTO fitness_metrics (user_id, discipline, metric_type, value, source, recorded_at)
VALUES
  (test_user_id, 'bike', 'ftp',            240,  'manual', NOW()),
  (test_user_id, 'run',  'threshold_pace', 270,  'manual', NOW()),
  (test_user_id, 'swim', 'css',            105,  'manual', NOW())
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. Daily check-in for today
-- Good-ish day: decent sleep, low fatigue, motivated, low stress
-- ---------------------------------------------------------------------------

INSERT INTO daily_check_ins (
  user_id,
  check_in_date,
  sleep_quality,
  fatigue,
  motivation,
  soreness_areas,
  life_stress,
  available_time_today_minutes
) VALUES (
  test_user_id,
  CURRENT_DATE,
  4,            -- sleep quality: good
  2,            -- fatigue: low
  4,            -- motivation: high
  '{}',         -- no soreness
  2,            -- life stress: low
  NULL          -- available time: same as planned
)
ON CONFLICT (user_id, check_in_date) DO UPDATE SET
  sleep_quality  = EXCLUDED.sleep_quality,
  fatigue        = EXCLUDED.fatigue,
  motivation     = EXCLUDED.motivation,
  life_stress    = EXCLUDED.life_stress;

END $$;
