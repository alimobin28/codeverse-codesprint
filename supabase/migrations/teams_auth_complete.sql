-- ====================================================================
-- Codeverse Teams Authentication - Complete Migration
-- Run this ONCE in Supabase SQL Editor
-- ====================================================================

-- =====================
-- STEP 1: Enable pgcrypto for password hashing
-- =====================
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- =====================
-- STEP 2: Add columns to teams table
-- =====================
DO $$
BEGIN
  -- Add username column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'username'
  ) THEN
    ALTER TABLE teams ADD COLUMN username TEXT UNIQUE;
    RAISE NOTICE 'Added username column';
  END IF;
  
  -- Add password_hash column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE teams ADD COLUMN password_hash TEXT;
    RAISE NOTICE 'Added password_hash column';
  END IF;
  
  -- Add auth_user_id column (optional, for future Supabase Auth integration)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE teams ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
    RAISE NOTICE 'Added auth_user_id column';
  END IF;
END $$;

-- =====================
-- STEP 3: Fix RLS policies for session lookup
-- =====================
DROP POLICY IF EXISTS "Allow session lookup" ON public.teams;
DROP POLICY IF EXISTS "Users can view own team" ON public.teams;
DROP POLICY IF EXISTS "Public read teams" ON public.teams;

-- Allow anyone to read teams (needed for session restore)
CREATE POLICY "Allow session lookup"
ON public.teams FOR SELECT
USING (true);

-- =====================
-- STEP 4: Create password verification function
-- =====================
CREATE OR REPLACE FUNCTION verify_team_credentials(
  p_username TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  team_record RECORD;
BEGIN
  SELECT id, name, username, session_id, created_at, auth_user_id
  INTO team_record
  FROM teams
  WHERE LOWER(username) = LOWER(p_username)
    AND password_hash = extensions.crypt(p_password, password_hash);
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'team', json_build_object(
        'id', team_record.id,
        'name', team_record.name,
        'username', team_record.username,
        'session_id', team_record.session_id,
        'created_at', team_record.created_at,
        'auth_user_id', team_record.auth_user_id
      )
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid username or password'
    );
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_team_credentials(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_team_credentials(TEXT, TEXT) TO authenticated;

-- =====================
-- STEP 5: Create function to insert teams from CSV data
-- =====================
CREATE OR REPLACE FUNCTION insert_team_with_password(
  p_name TEXT,
  p_username TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_team RECORD;
BEGIN
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM teams WHERE LOWER(username) = LOWER(p_username)) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Username already exists: ' || p_username
    );
  END IF;
  
  -- Insert new team with hashed password
  INSERT INTO teams (name, username, session_id, password_hash)
  VALUES (
    p_name,
    LOWER(p_username),
    gen_random_uuid()::text,
    extensions.crypt(p_password, extensions.gen_salt('bf'))
  )
  RETURNING * INTO new_team;
  
  RETURN json_build_object(
    'success', true,
    'team', json_build_object(
      'id', new_team.id,
      'name', new_team.name,
      'username', new_team.username
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION insert_team_with_password(TEXT, TEXT, TEXT) TO authenticated;

-- =====================
-- STEP 6: Add test user if not exists
-- =====================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM teams WHERE LOWER(username) = 'testuser') THEN
    INSERT INTO teams (name, username, session_id, password_hash)
    VALUES (
      'Test User',
      'testuser',
      gen_random_uuid()::text,
      extensions.crypt('testpassword', extensions.gen_salt('bf'))
    );
    RAISE NOTICE 'Created testuser';
  ELSE
    UPDATE teams 
    SET password_hash = extensions.crypt('testpassword', extensions.gen_salt('bf'))
    WHERE LOWER(username) = 'testuser';
    RAISE NOTICE 'Updated testuser password';
  END IF;
END $$;

-- =====================
-- Verify setup
-- =====================
SELECT username, name, 
       CASE WHEN password_hash IS NOT NULL THEN '✅ Password SET' ELSE '❌ NO PASSWORD' END as status
FROM teams 
ORDER BY created_at;
