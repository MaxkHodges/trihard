# RLS Test Plan

Verify that Row Level Security policies are working correctly. Run these tests
in the Supabase SQL editor using two test users (User A and User B) to confirm
isolation is enforced.

## Setup

Create two test users via the Supabase dashboard → Authentication → Users:
- **User A**: `test-a@trihard.dev`
- **User B**: `test-b@trihard.dev`

Sign in as each user using the Supabase JS client and capture their JWTs for
testing. In the SQL editor, set the role with:
```sql
SET request.jwt.claims = '{"sub": "<user-a-uuid>", "role": "authenticated"}';
SET ROLE authenticated;
```

---

## 1. athlete_profile

| Test | Expected |
|------|----------|
| User A inserts their own profile | ✅ succeeds |
| User A selects their own profile | ✅ returns 1 row |
| User B selects User A's profile | ❌ returns 0 rows |
| User B inserts a row with User A's user_id | ❌ blocked by WITH CHECK |
| User A updates their own profile | ✅ succeeds |
| User B updates User A's profile | ❌ 0 rows affected |
| User A deletes their own profile | ✅ succeeds |

---

## 2. fitness_metrics (append-only — no DELETE)

| Test | Expected |
|------|----------|
| User A inserts a metric for themselves | ✅ succeeds |
| User A selects their own metrics | ✅ returns rows |
| User B selects User A's metrics | ❌ returns 0 rows |
| User A attempts DELETE | ❌ blocked (no DELETE policy) |
| User A attempts UPDATE | ❌ blocked (no UPDATE policy) |

---

## 3. races

| Test | Expected |
|------|----------|
| User A inserts a race | ✅ succeeds |
| User A selects their races | ✅ returns rows |
| User B selects all races | ❌ returns only User B's races (0 if none) |
| User A updates their race | ✅ succeeds |
| User B updates User A's race | ❌ 0 rows affected |
| User A deletes their race | ✅ succeeds |

---

## 4. plans

| Test | Expected |
|------|----------|
| User A inserts a plan | ✅ succeeds |
| User A selects their plans | ✅ returns rows |
| User B selects all plans | ❌ returns only User B's (0 if none) |
| User B updates User A's plan | ❌ 0 rows affected |

---

## 5. plan_blocks (indirect via plans)

| Test | Expected |
|------|----------|
| User A inserts a block for their own plan | ✅ succeeds |
| User A inserts a block for User B's plan | ❌ blocked by WITH CHECK |
| User A selects blocks | ✅ returns only blocks from their plans |
| User B selects all blocks | ❌ returns only User B's plan blocks |
| User A deletes a block from their plan | ✅ succeeds |

---

## 6. sessions (indirect via plans)

| Test | Expected |
|------|----------|
| User A inserts a session for their plan | ✅ succeeds |
| User A inserts a session for User B's plan | ❌ blocked |
| User B selects all sessions | ❌ returns only sessions from User B's plans |
| User A updates their session | ✅ succeeds |

---

## 7. completed_activities (append-only — no DELETE)

| Test | Expected |
|------|----------|
| User A inserts an activity | ✅ succeeds |
| User A selects their activities | ✅ returns rows |
| User B selects all activities | ❌ returns only User B's |
| User A attempts DELETE | ❌ blocked (no DELETE policy) |
| User A attempts UPDATE | ✅ succeeds (UPDATE allowed for manual corrections) |

---

## 8. daily_check_ins

| Test | Expected |
|------|----------|
| User A inserts a check-in | ✅ succeeds |
| User A selects their check-ins | ✅ returns rows |
| User B selects all check-ins | ❌ returns only User B's |
| User A updates today's check-in | ✅ succeeds |
| User A inserts a second check-in for the same date | ❌ blocked by UNIQUE constraint |

---

## 9. readiness_scores (system-managed — no UPDATE or DELETE)

| Test | Expected |
|------|----------|
| User A inserts a score | ✅ succeeds |
| User A selects their scores | ✅ returns rows |
| User B selects all scores | ❌ returns only User B's |
| User A attempts UPDATE | ❌ blocked (no UPDATE policy) |
| User A attempts DELETE | ❌ blocked (no DELETE policy) |

---

## 10. training_load (system-managed — no UPDATE or DELETE)

| Test | Expected |
|------|----------|
| User A inserts a load row | ✅ succeeds |
| User B selects all training_load | ❌ returns only User B's |
| User A attempts DELETE | ❌ blocked |

---

## 11. adaptations (indirect via plans, append-only)

| Test | Expected |
|------|----------|
| User A inserts an adaptation for their plan | ✅ succeeds |
| User A inserts an adaptation for User B's plan | ❌ blocked |
| User B selects all adaptations | ❌ returns only User B's plan adaptations |
| User A attempts DELETE | ❌ blocked (no DELETE policy) |

---

## 12. race_plans (indirect via races)

| Test | Expected |
|------|----------|
| User A inserts a race plan for their race | ✅ succeeds |
| User A inserts a race plan for User B's race | ❌ blocked |
| User B selects all race_plans | ❌ returns only User B's |
| User A updates their race plan | ✅ succeeds |
| User A deletes their race plan | ✅ succeeds |

---

## 13. equipment

| Test | Expected |
|------|----------|
| User A inserts equipment | ✅ succeeds |
| User B selects all equipment | ❌ returns only User B's |
| User A updates their equipment | ✅ succeeds |
| User A deletes their equipment | ✅ succeeds |

---

## Cross-cutting checks

- Confirm `service_role` key bypasses all RLS (needed for Edge Functions)
- Confirm `anon` key (unauthenticated) returns 0 rows from every table
- Confirm that after account deletion, cascade deletes remove all user data
