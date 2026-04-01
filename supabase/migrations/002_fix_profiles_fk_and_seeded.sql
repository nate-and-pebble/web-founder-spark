-- 002: Fix profiles FK constraint and add is_seeded column
-- Problem: profiles.id has FK to auth.users(id), blocking inserts for custom auth users.
-- Fix: Drop that FK. profiles.id stays as UUID PK (set to user.id in app code).
--       owner_user_id already references app_users(id) via 001.

-- Dynamically drop any FK on profiles referencing auth.users
DO $$
DECLARE
  _constraint_name text;
BEGIN
  FOR _constraint_name IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.constraint_schema = ccu.constraint_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'profiles'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', _constraint_name);
    RAISE NOTICE 'Dropped FK constraint: %', _constraint_name;
  END LOOP;
END $$;

-- Add is_seeded column for deck ordering (real users first)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_seeded boolean NOT NULL DEFAULT false;

-- Mark profiles without a real app_users entry as seeded
UPDATE profiles
SET is_seeded = true
WHERE owner_user_id IS NULL
   OR owner_user_id NOT IN (SELECT id FROM app_users);
