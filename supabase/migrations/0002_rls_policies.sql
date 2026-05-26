-- =============================================================================
-- 0002_rls_policies.sql
-- Row Level Security for all TriHard tables.
--
-- RLS MODEL SUMMARY
-- -----------------
-- Every table is locked down so users can only see and write their own rows.
-- Ownership is checked two ways:
--
--   Direct:   tables with a user_id column → user_id = auth.uid()
--   Indirect: tables owned through a parent → EXISTS join to the parent table
--             (plan_blocks and sessions → plans,
--              race_plans → races,
--              adaptations → plans)
--
-- Append-only / system-managed tables have NO DELETE policy:
--   fitness_metrics, completed_activities, adaptations,
--   readiness_scores, training_load
--
-- Edge Functions and server-side code use the service_role key which bypasses
-- RLS entirely — it never touches the mobile app.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- athlete_profile  (direct, full CRUD)
-- ---------------------------------------------------------------------------

ALTER TABLE athlete_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "athlete_profile: select own"
  ON athlete_profile FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "athlete_profile: insert own"
  ON athlete_profile FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athlete_profile: update own"
  ON athlete_profile FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athlete_profile: delete own"
  ON athlete_profile FOR DELETE
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- fitness_metrics  (direct, append-only — no UPDATE or DELETE)
-- ---------------------------------------------------------------------------

ALTER TABLE fitness_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fitness_metrics: select own"
  ON fitness_metrics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "fitness_metrics: insert own"
  ON fitness_metrics FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- races  (direct, full CRUD)
-- ---------------------------------------------------------------------------

ALTER TABLE races ENABLE ROW LEVEL SECURITY;

CREATE POLICY "races: select own"
  ON races FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "races: insert own"
  ON races FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "races: update own"
  ON races FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "races: delete own"
  ON races FOR DELETE
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- plans  (direct, full CRUD)
-- Plans are logically immutable but we allow delete so orphaned plans can be
-- cleaned up. The app layer never calls delete — the policy is a safety net.
-- ---------------------------------------------------------------------------

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans: select own"
  ON plans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "plans: insert own"
  ON plans FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "plans: update own"
  ON plans FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "plans: delete own"
  ON plans FOR DELETE
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- plan_blocks  (indirect via plans — full CRUD)
-- ---------------------------------------------------------------------------

ALTER TABLE plan_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_blocks: select own"
  ON plan_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = plan_blocks.plan_id
        AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_blocks: insert own"
  ON plan_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = plan_blocks.plan_id
        AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_blocks: update own"
  ON plan_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = plan_blocks.plan_id
        AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_blocks: delete own"
  ON plan_blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = plan_blocks.plan_id
        AND plans.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- sessions  (indirect via plans — full CRUD)
-- ---------------------------------------------------------------------------

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions: select own"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = sessions.plan_id
        AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "sessions: insert own"
  ON sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = sessions.plan_id
        AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "sessions: update own"
  ON sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = sessions.plan_id
        AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "sessions: delete own"
  ON sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = sessions.plan_id
        AND plans.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- completed_activities  (direct, append-only — no DELETE)
-- ---------------------------------------------------------------------------

ALTER TABLE completed_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "completed_activities: select own"
  ON completed_activities FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "completed_activities: insert own"
  ON completed_activities FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "completed_activities: update own"
  ON completed_activities FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- daily_check_ins  (direct, full CRUD — user can edit today's check-in)
-- ---------------------------------------------------------------------------

ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_check_ins: select own"
  ON daily_check_ins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "daily_check_ins: insert own"
  ON daily_check_ins FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_check_ins: update own"
  ON daily_check_ins FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_check_ins: delete own"
  ON daily_check_ins FOR DELETE
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- readiness_scores  (direct, system-managed — no UPDATE or DELETE)
-- Written by Edge Functions after each check-in and via daily cron.
-- ---------------------------------------------------------------------------

ALTER TABLE readiness_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "readiness_scores: select own"
  ON readiness_scores FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "readiness_scores: insert own"
  ON readiness_scores FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- training_load  (direct, system-managed — no UPDATE or DELETE)
-- Recomputed and re-inserted by Edge Functions after each activity.
-- ---------------------------------------------------------------------------

ALTER TABLE training_load ENABLE ROW LEVEL SECURITY;

CREATE POLICY "training_load: select own"
  ON training_load FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "training_load: insert own"
  ON training_load FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- adaptations  (indirect via plans, append-only — no UPDATE or DELETE)
-- Audit log: written by Edge Functions only, never modified or removed.
-- ---------------------------------------------------------------------------

ALTER TABLE adaptations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adaptations: select own"
  ON adaptations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = adaptations.plan_id
        AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "adaptations: insert own"
  ON adaptations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = adaptations.plan_id
        AND plans.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- race_plans  (indirect via races — full CRUD)
-- ---------------------------------------------------------------------------

ALTER TABLE race_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "race_plans: select own"
  ON race_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM races
      WHERE races.id = race_plans.race_id
        AND races.user_id = auth.uid()
    )
  );

CREATE POLICY "race_plans: insert own"
  ON race_plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM races
      WHERE races.id = race_plans.race_id
        AND races.user_id = auth.uid()
    )
  );

CREATE POLICY "race_plans: update own"
  ON race_plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM races
      WHERE races.id = race_plans.race_id
        AND races.user_id = auth.uid()
    )
  );

CREATE POLICY "race_plans: delete own"
  ON race_plans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM races
      WHERE races.id = race_plans.race_id
        AND races.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- equipment  (direct, full CRUD)
-- ---------------------------------------------------------------------------

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipment: select own"
  ON equipment FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "equipment: insert own"
  ON equipment FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "equipment: update own"
  ON equipment FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "equipment: delete own"
  ON equipment FOR DELETE
  USING (user_id = auth.uid());
