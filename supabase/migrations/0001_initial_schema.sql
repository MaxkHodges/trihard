-- =============================================================================
-- 0001_initial_schema.sql
-- Core tables for TriHard triathlon training app.
-- RLS is NOT enabled here — see 0002_rls_policies.sql.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE experience_level AS ENUM ('new', 'developing', 'experienced', 'advanced');

CREATE TYPE discipline AS ENUM ('swim', 'bike', 'run', 'brick', 'strength', 'mobility', 'rest');

CREATE TYPE metric_type AS ENUM ('ftp', 'threshold_pace', 'css', 'threshold_hr', 'max_hr');

CREATE TYPE metric_source AS ENUM ('manual', 'test', 'device_estimated', 'inferred');

CREATE TYPE race_distance AS ENUM ('sprint', 'olympic', 'half_ironman', 'ironman', 'custom');

CREATE TYPE course_profile AS ENUM ('flat', 'rolling', 'hilly', 'very_hilly');

CREATE TYPE swim_type AS ENUM ('pool', 'lake', 'sea', 'river');

CREATE TYPE race_priority AS ENUM ('A', 'B', 'C');

CREATE TYPE plan_type AS ENUM ('race_build', 'base', 'off_season', 'return_from_injury');

CREATE TYPE plan_status AS ENUM ('active', 'superseded', 'paused', 'completed');

CREATE TYPE block_type AS ENUM ('base', 'build', 'peak', 'taper', 'race_week', 'recovery');

CREATE TYPE session_type AS ENUM (
  'easy', 'tempo', 'threshold', 'vo2', 'long', 'race_pace',
  'recovery', 'open_water', 'brick'
);

CREATE TYPE session_environment AS ENUM ('outdoor', 'indoor', 'pool', 'open_water');

CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'skipped', 'moved', 'modified');

CREATE TYPE activity_source AS ENUM ('manual', 'strava', 'garmin', 'healthkit');

CREATE TYPE readiness_recommendation AS ENUM ('green', 'yellow', 'red', 'rest');

CREATE TYPE adaptation_trigger AS ENUM (
  'user_skip', 'readiness', 'life_event', 'illness', 'injury', 'missed_streak'
);

CREATE TYPE adaptation_change AS ENUM (
  'reschedule', 'reduce_volume', 'replace_session', 'insert_recovery'
);

CREATE TYPE race_confidence AS ENUM ('low', 'medium', 'high');

CREATE TYPE equipment_type AS ENUM (
  'bike', 'wetsuit', 'running_shoes', 'trainer', 'power_meter'
);

-- ---------------------------------------------------------------------------
-- Updated-at trigger function (reused by multiple tables)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- athlete_profile
-- One-to-one extension of auth.users. Created during onboarding.
-- ---------------------------------------------------------------------------

CREATE TABLE athlete_profile (
  user_id                 UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth           DATE,
  experience_level        experience_level NOT NULL DEFAULT 'developing',
  weekly_hours_target     NUMERIC(4,1) NOT NULL DEFAULT 8,
  preferred_long_day_swim SMALLINT,            -- 0=Mon … 6=Sun
  preferred_long_day_bike SMALLINT,
  preferred_long_day_run  SMALLINT,
  has_turbo               BOOLEAN NOT NULL DEFAULT FALSE,
  pool_length_m           INT,                 -- null = no pool access
  open_water_access       BOOLEAN NOT NULL DEFAULT FALSE,
  open_water_season_months SMALLINT[],         -- e.g. {4,5,6,7,8,9}
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER athlete_profile_updated_at
  BEFORE UPDATE ON athlete_profile
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- fitness_metrics
-- Append-only time series. NEVER UPDATE — always INSERT a new row.
-- ---------------------------------------------------------------------------

CREATE TABLE fitness_metrics (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discipline  discipline  NOT NULL,
  metric_type metric_type NOT NULL,
  value       NUMERIC     NOT NULL,           -- watts (FTP), secs/km (pace), secs/100m (CSS)
  source      metric_source NOT NULL DEFAULT 'manual',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX fitness_metrics_user_discipline_type
  ON fitness_metrics(user_id, discipline, metric_type, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- races
-- Target races the athlete is training toward.
-- ---------------------------------------------------------------------------

CREATE TABLE races (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT           NOT NULL,
  race_date      DATE           NOT NULL,
  distance       race_distance  NOT NULL,
  course_profile course_profile NOT NULL DEFAULT 'rolling',
  swim_type      swim_type      NOT NULL DEFAULT 'lake',
  wetsuit_likely BOOLEAN        NOT NULL DEFAULT TRUE,
  priority       race_priority  NOT NULL DEFAULT 'A',
  notes          TEXT,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX races_user_date ON races(user_id, race_date);

CREATE TRIGGER races_updated_at
  BEFORE UPDATE ON races
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- plans
-- Immutable once generated. Changes create a new version via parent_plan_id.
-- ---------------------------------------------------------------------------

CREATE TABLE plans (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_race_id      UUID        REFERENCES races(id) ON DELETE SET NULL,
  parent_plan_id      UUID        REFERENCES plans(id) ON DELETE SET NULL,
  start_date          DATE        NOT NULL,
  end_date            DATE        NOT NULL,
  plan_type           plan_type   NOT NULL DEFAULT 'race_build',
  weekly_hours_target NUMERIC(4,1) NOT NULL,
  generator_version   TEXT        NOT NULL,
  generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status              plan_status NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX plans_user_status ON plans(user_id, status);
CREATE INDEX plans_target_race ON plans(target_race_id);

-- ---------------------------------------------------------------------------
-- plan_blocks
-- Phases within a plan (base, build, peak, taper, race_week, recovery).
-- ---------------------------------------------------------------------------

CREATE TABLE plan_blocks (
  id           UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      UUID       NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  block_type   block_type NOT NULL,
  start_date   DATE       NOT NULL,
  end_date     DATE       NOT NULL,
  focus        TEXT,
  weekly_hours NUMERIC(4,1),
  sequence     INT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX plan_blocks_plan_id ON plan_blocks(plan_id, sequence);

-- ---------------------------------------------------------------------------
-- sessions
-- One row per planned training session. structured_workout generated 3 days
-- before the session date so adaptations can rewrite the tail without churn.
-- ---------------------------------------------------------------------------

CREATE TABLE sessions (
  id                 UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id            UUID               NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  block_id           UUID               NOT NULL REFERENCES plan_blocks(id) ON DELETE CASCADE,
  scheduled_date     DATE               NOT NULL,
  discipline         discipline         NOT NULL,
  session_type       session_type       NOT NULL,
  duration_minutes   INT                NOT NULL,
  target_tss         NUMERIC(6,1),
  structured_workout JSONB,             -- null until generated 3 days before
  environment        session_environment NOT NULL DEFAULT 'outdoor',
  purpose_text       TEXT,
  fueling_notes      TEXT,
  status             session_status     NOT NULL DEFAULT 'scheduled',
  moved_from_date    DATE,
  created_at         TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX sessions_plan_date     ON sessions(plan_id, scheduled_date);
CREATE INDEX sessions_block_id      ON sessions(block_id);
CREATE INDEX sessions_status_date   ON sessions(status, scheduled_date);

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- completed_activities
-- Logged workouts from manual entry, Strava, Garmin, or HealthKit.
-- ---------------------------------------------------------------------------

CREATE TABLE completed_activities (
  id               UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id       UUID            REFERENCES sessions(id) ON DELETE SET NULL,
  discipline       discipline      NOT NULL,
  started_at       TIMESTAMPTZ     NOT NULL,
  duration_seconds INT             NOT NULL,
  distance_meters  NUMERIC(10,1),
  avg_power        NUMERIC(6,1),   -- watts
  avg_pace         NUMERIC(8,2),   -- secs/km
  avg_hr           NUMERIC(5,1),   -- bpm
  tss_computed     NUMERIC(6,1),
  perceived_effort SMALLINT CHECK (perceived_effort BETWEEN 1 AND 10),
  source           activity_source NOT NULL DEFAULT 'manual',
  external_id      TEXT,           -- Strava/Garmin activity id
  notes            TEXT,
  raw_data         JSONB,
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX completed_activities_user_date  ON completed_activities(user_id, started_at DESC);
CREATE INDEX completed_activities_session    ON completed_activities(session_id);
CREATE UNIQUE INDEX completed_activities_external
  ON completed_activities(source, external_id) WHERE external_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- daily_check_ins
-- One per user per day. Feeds readiness scoring and adaptation engine.
-- ---------------------------------------------------------------------------

CREATE TABLE daily_check_ins (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date               DATE        NOT NULL,
  sleep_quality               SMALLINT    NOT NULL CHECK (sleep_quality BETWEEN 1 AND 5),
  fatigue                     SMALLINT    NOT NULL CHECK (fatigue BETWEEN 1 AND 5),
  motivation                  SMALLINT    NOT NULL CHECK (motivation BETWEEN 1 AND 5),
  soreness_areas              TEXT[],
  life_stress                 SMALLINT    NOT NULL CHECK (life_stress BETWEEN 1 AND 5),
  available_time_today_minutes INT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, check_in_date)
);

CREATE INDEX daily_check_ins_user_date ON daily_check_ins(user_id, check_in_date DESC);

-- ---------------------------------------------------------------------------
-- readiness_scores
-- Computed after each check-in and via daily cron at 05:00 user-local time.
-- ---------------------------------------------------------------------------

CREATE TABLE readiness_scores (
  id               UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID                     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_date       DATE                     NOT NULL,
  score            SMALLINT                 NOT NULL CHECK (score BETWEEN 0 AND 100),
  inputs           JSONB                    NOT NULL DEFAULT '{}',
  recommendation   readiness_recommendation NOT NULL,
  rationale_text   TEXT                     NOT NULL,
  created_at       TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, score_date)
);

CREATE INDEX readiness_scores_user_date ON readiness_scores(user_id, score_date DESC);

-- ---------------------------------------------------------------------------
-- training_load
-- Daily CTL / ATL / TSB. One overall row + one per discipline per day.
-- ---------------------------------------------------------------------------

CREATE TABLE training_load (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  load_date DATE        NOT NULL,
  discipline discipline,            -- null = overall across all disciplines
  ctl       NUMERIC(8,2) NOT NULL,  -- chronic training load (fitness)
  atl       NUMERIC(8,2) NOT NULL,  -- acute training load (fatigue)
  tsb       NUMERIC(8,2) NOT NULL,  -- training stress balance (form)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, load_date, discipline)
);

CREATE INDEX training_load_user_date ON training_load(user_id, load_date DESC);

-- ---------------------------------------------------------------------------
-- adaptations
-- Audit log of every plan change. Users can see why their plan changed.
-- ---------------------------------------------------------------------------

CREATE TABLE adaptations (
  id                  UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id             UUID               NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  triggered_by        adaptation_trigger NOT NULL,
  change_type         adaptation_change  NOT NULL,
  affected_session_ids UUID[]            NOT NULL DEFAULT '{}',
  before_snapshot     JSONB              NOT NULL DEFAULT '{}',
  after_snapshot      JSONB              NOT NULL DEFAULT '{}',
  rationale_text      TEXT               NOT NULL,
  created_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX adaptations_plan_id ON adaptations(plan_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- race_plans
-- Generated ~21 days before race day. Pacing, fueling, transitions.
-- ---------------------------------------------------------------------------

CREATE TABLE race_plans (
  id                    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id               UUID            NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  swim_pacing_strategy  TEXT,
  bike_power_targets    JSONB,
  run_pacing            JSONB,
  nutrition_plan        JSONB,
  transition_checklist  JSONB,
  predicted_finish_seconds INT,
  confidence            race_confidence NOT NULL DEFAULT 'medium',
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX race_plans_race_id ON race_plans(race_id);

CREATE TRIGGER race_plans_updated_at
  BEFORE UPDATE ON race_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- equipment
-- Athlete's gear. Used to tailor session prescriptions.
-- ---------------------------------------------------------------------------

CREATE TABLE equipment (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_type equipment_type NOT NULL,
  details        JSONB          NOT NULL DEFAULT '{}',
  active         BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX equipment_user_active ON equipment(user_id, active);
