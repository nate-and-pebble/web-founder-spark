-- Custom auth tables (replaces Supabase Auth)
-- Run this against your Supabase DB via SQL editor or CLI.

CREATE EXTENSION IF NOT EXISTS citext;

-- Users table
CREATE TABLE IF NOT EXISTS app_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS app_sessions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  expires_at         timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_sessions_token_hash ON app_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id ON app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_sessions_expires ON app_sessions(expires_at);

-- Add owner_user_id to profiles so it references app_users instead of auth.users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES app_users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_profiles_owner ON profiles(owner_user_id);

-- Disable RLS on all app tables (we enforce auth in server code)
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE swipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
