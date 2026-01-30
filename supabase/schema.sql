-- ====================================================================
-- Codeverse Logic Arena - Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ====================================================================

-- ============================
-- ENABLE UUID EXTENSION
-- ============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================
-- TABLE: rounds
-- ============================
CREATE TABLE public.rounds (
    id SERIAL PRIMARY KEY,
    round_number INTEGER NOT NULL UNIQUE CHECK (round_number IN (1, 2, 3)),
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'standard' CHECK (type IN ('standard', 'sequential')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    duration_minutes INTEGER, -- Total round duration (for R1, R3)
    is_unlocked BOOLEAN NOT NULL DEFAULT false,
    timer_active BOOLEAN NOT NULL DEFAULT false,
    timer_started_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default rounds
INSERT INTO public.rounds (round_number, title, type, duration_minutes) VALUES
    (1, 'Round 1: The Awakening', 'standard', 60),
    (2, 'Round 2: The Temporal Rift', 'sequential', NULL),
    (3, 'Round 3: The Confrontation', 'standard', 45);

-- ============================
-- TABLE: problems
-- ============================
CREATE TABLE public.problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_number INTEGER NOT NULL REFERENCES public.rounds(round_number) ON DELETE CASCADE,
    problem_code TEXT NOT NULL,
    title TEXT NOT NULL,
    statement TEXT NOT NULL,
    guidance TEXT, -- Hints/guidance text (used in R1)
    sort_order INTEGER NOT NULL DEFAULT 0,
    individual_time_limit_seconds INTEGER, -- For Round 2 sequential problems
    points INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (round_number, problem_code)
);

-- ============================
-- TABLE: hints
-- ============================
CREATE TABLE public.hints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    unlock_after_minutes INTEGER DEFAULT 0, -- Minutes after round start to unlock
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================
-- TABLE: teams
-- ============================
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    session_id TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================
-- TABLE: team_progress
-- ============================
CREATE TABLE public.team_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    is_solved BOOLEAN NOT NULL DEFAULT false,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    locked_at TIMESTAMPTZ,
    current_problem_started_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id, problem_id)
);

-- ============================
-- TABLE: team_round_state
-- ============================
CREATE TABLE public.team_round_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL REFERENCES public.rounds(round_number),
    current_problem_id UUID REFERENCES public.problems(id),
    round_started_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id, round_number)
);

-- ============================
-- TABLE: admin_settings
-- ============================
CREATE TABLE public.admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
    ('admin_password', 'codeverse2024'),
    ('competition_name', 'PROCOM 26 Code Sprint');

-- ============================
-- ROW LEVEL SECURITY (RLS)
-- ============================

-- Enable RLS on all tables
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_round_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Public read for most tables (competition use case)
CREATE POLICY "Public read rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Public update rounds" ON public.rounds FOR UPDATE USING (true);

CREATE POLICY "Public read problems" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Public manage problems" ON public.problems FOR ALL USING (true);

CREATE POLICY "Public read hints" ON public.hints FOR SELECT USING (true);
CREATE POLICY "Public manage hints" ON public.hints FOR ALL USING (true);

CREATE POLICY "Public read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public insert teams" ON public.teams FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read team_progress" ON public.team_progress FOR SELECT USING (true);
CREATE POLICY "Public manage team_progress" ON public.team_progress FOR ALL USING (true);

CREATE POLICY "Public read team_round_state" ON public.team_round_state FOR SELECT USING (true);
CREATE POLICY "Public manage team_round_state" ON public.team_round_state FOR ALL USING (true);

CREATE POLICY "Public read admin_settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Public update admin_settings" ON public.admin_settings FOR UPDATE USING (true);

-- ============================
-- REALTIME SUBSCRIPTIONS
-- ============================
ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_round_state;

-- ============================
-- SAMPLE DATA: Problems
-- ============================

-- Round 1: 5 Problems with hints (global timer)
INSERT INTO public.problems (round_number, problem_code, title, statement, guidance, sort_order) VALUES
    (1, 'A', 'Binary Reconstruction', 'In the fragmented memory banks of CodeVerse, a catastrophic data corruption event has scattered critical binary sequences across multiple sectors. Your mission is to reconstruct the original data structure from these corrupted fragments. Given an array of integers where each element represents a fragment of the original sequence, you must apply logical operations to restore the complete pattern.', 'Hint: XOR operation is commutative and associative. Think about what happens when you XOR a number with itself.', 1),
    (1, 'B', 'Logic Gate Repair', 'A critical logic gate in the system has malfunctioned. Given a boolean expression in CNF form, determine if it is satisfiable. The complexity increases with the number of variables and clauses, requiring sophisticated constraint-solving techniques.', 'Hint: For small inputs, try all possible truth assignments. For larger ones, look for unit clauses first.', 2),
    (1, 'C', 'Memory Fragment Merge', 'Two sorted memory fragments need to be merged into a single sorted sequence. Write an algorithm to merge them efficiently while maintaining proper sort order and minimizing computational overhead.', 'Hint: Use two pointers, one for each array. Compare and advance the pointer with smaller value.', 3),
    (1, 'D', 'Recursion Recovery', 'A recursive function has lost its base case. Given the recursive relation f(n) = f(n-1) + f(n-2) with f(1)=1, f(2)=1, compute f(n). Consider using memoization or dynamic programming for efficiency.', 'Hint: This is the Fibonacci sequence. Consider using memoization or bottom-up DP.', 4),
    (1, 'E', 'Encryption Anomaly', 'The encryption subsystem has detected an anomaly in its key generation algorithm. Analyze the key generation process and implement a solution that ensures generated keys meet minimum security requirements.', 'Hint: Look for patterns in the key generation that could lead to predictable outputs.', 5);

-- Round 2: 4 Problems with individual timers (sequential)
INSERT INTO public.problems (round_number, problem_code, title, statement, individual_time_limit_seconds, sort_order) VALUES
    (2, 'A', 'Temporal Paradox', 'In the failing time flow of CodeVerse, temporal anomalies have created a paradox. You are given a sequence of events that must occur in a specific order. Determine if all events can be scheduled without violating any dependencies. Output YES if a valid schedule exists, NO otherwise.', 180, 1),
    (2, 'B', 'Quantum State Collapse', 'The quantum processing unit has entered an unstable state. Given probability amplitudes as complex numbers, calculate the probability of each outcome and determine which state is most likely to be observed.', 180, 2),
    (2, 'C', 'Entropy Cascade', 'The entropy of the system is increasing rapidly. Each second, adjacent characters may swap if they are different. Calculate the minimum number of seconds required to reach maximum entropy. If impossible, return -1.', 180, 3),
    (2, 'D', 'Time Loop Detection', 'A section of code is stuck in an infinite loop across time. Detect if there exists a cycle in this temporal graph. If a cycle exists, return the length of the shortest cycle.', 180, 4);

-- Round 3: 6 Problems, no hints (global timer)
INSERT INTO public.problems (round_number, problem_code, title, statement, sort_order) VALUES
    (3, 'A', 'Core Logic Alpha', 'The first layer of the core logic has been exposed. Solve the primary decryption challenge to proceed.', 1),
    (3, 'B', 'Core Logic Beta', 'The second layer requires pattern recognition across multiple dimensions of data.', 2),
    (3, 'C', 'Core Logic Gamma', 'The third layer tests your understanding of recursive structures and self-referential systems.', 3),
    (3, 'D', 'Core Logic Delta', 'The fourth layer combines all previous concepts in a final synthesis challenge.', 4),
    (3, 'E', 'Core Logic Epsilon', 'The fifth layer demands mastery of algorithmic optimization under extreme constraints.', 5),
    (3, 'F', 'The Impossible Script', 'This is it. The final challenge. Erevos-901 watches. Prove your worth.', 6);

CREATE TABLE public.broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read broadcasts" ON public.broadcasts FOR SELECT USING (true);
CREATE POLICY "Public manage broadcasts" ON public.broadcasts FOR ALL USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;

-- Migration: Move all guidance from problems to hints table
-- Run this in Supabase SQL Editor

-- Insert guidance from problems into hints table (only where guidance exists)
INSERT INTO public.hints (problem_id, content, unlock_after_minutes, sort_order)
SELECT 
    id,
    guidance,
    0,  -- All hints unlock immediately (0 minutes)
    0   -- Sort order 0
FROM public.problems 
WHERE guidance IS NOT NULL AND guidance != '';

-- Update all existing hints to have 0 unlock time
UPDATE public.hints SET unlock_after_minutes = 0;

-- Clear the guidance field from problems (optional, can keep for backup)
-- UPDATE public.problems SET guidance = NULL;

-- Confirm migration
SELECT 
    h.id as hint_id,
    p.problem_code,
    p.title,
    h.content,
    h.unlock_after_minutes
FROM public.hints h
JOIN public.problems p ON h.problem_id = p.id
ORDER BY p.round_number, p.sort_order;

ALTER TABLE rounds 
ADD COLUMN vjudge_url TEXT DEFAULT NULL,
ADD COLUMN scoreboard_url TEXT DEFAULT NULL;

-- ====================================================================
-- Security Update: Admin Authentication Migration
-- Run this AFTER existing schema.sql
-- ====================================================================

-- ============================
-- UPDATE: admin_settings table
-- ============================

-- Add new security columns
ALTER TABLE public.admin_settings 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Update the admin_password row to admin_account for new structure
INSERT INTO public.admin_settings (setting_key, setting_value, password_hash, failed_attempts)
VALUES ('admin_account', NULL, NULL, 0)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================
-- CREATE: admin_sessions table
-- ============================

CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()::text,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- ============================
-- RLS: admin_sessions
-- ============================

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage sessions (Edge Functions)
-- No client-side access
CREATE POLICY "Service role only" ON public.admin_sessions
FOR ALL USING (false);

-- ============================
-- UPDATE: admin_settings RLS
-- ============================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public read admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Public update admin_settings" ON public.admin_settings;

-- Only allow reading competition name (not password hash)
CREATE POLICY "Public read competition name" ON public.admin_settings
FOR SELECT USING (setting_key = 'competition_name');

-- All other operations only via service role (Edge Functions)
CREATE POLICY "Service role full access" ON public.admin_settings
FOR ALL USING (false);

-- ============================
-- CLEANUP: Remove old password
-- ============================

-- Remove plaintext password from old admin_password row
UPDATE public.admin_settings
SET setting_value = NULL
WHERE setting_key = 'admin_password';

-- ============================
-- AUTOMATIC SESSION CLEANUP
-- ============================

-- Function to delete expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.admin_sessions
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- You can set up a cron job to run this periodically:
-- SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();');

COMMENT ON TABLE public.admin_sessions IS 'Stores active admin sessions with JWT tokens';
COMMENT ON COLUMN public.admin_settings.password_hash IS 'Bcrypt hashed admin password';
COMMENT ON COLUMN public.admin_settings.failed_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN public.admin_settings.locked_until IS 'Account locked until this timestamp (15 min after 5 failed attempts)';

-- Allow the client to read the admin account row (needed for client-side auth)
CREATE POLICY "Public read admin account" ON public.admin_settings
FOR SELECT USING (setting_key = 'admin_account');
-- Allow the client to update failed attempts (needed for lockout logic)
CREATE POLICY "Public update admin stats" ON public.admin_settings
FOR UPDATE USING (setting_key = 'admin_account');

-- Update admin password
UPDATE admin_settings
SET password_hash = '$2a$10$tQ.Xu9nMx/P/qGkCx7XRgO8S/rsd5aE0j6tL1vxvuZjAa150WLRTC',
    failed_attempts = 0,
    locked_until = NULL,
    setting_value = NULL
WHERE setting_key = 'admin_account';

-- If admin_account doesn't exist, create it:
INSERT INTO admin_settings (setting_key, password_hash, failed_attempts)
VALUES ('admin_account', '$2a$10$tQ.Xu9nMx/P/qGkCx7XRgO8S/rsd5aE0j6tL1vxvuZjAa150WLRTC', 0)
ON CONFLICT (setting_key) 
DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- ====================================================================
-- Server Time Function for Clock Synchronization
-- Run this in Supabase SQL Editor
-- ====================================================================

-- Function to get current server timestamp
-- Used by clients to calculate clock offset
CREATE OR REPLACE FUNCTION get_server_time()
RETURNS TIMESTAMPTZ
LANGUAGE SQL
STABLE
AS $$
  SELECT NOW();
$$;

-- Grant execute permission to all users (already authenticated via RLS)
GRANT EXECUTE ON FUNCTION get_server_time() TO anon, authenticated;

COMMENT ON FUNCTION get_server_time() IS 'Returns server timestamp for client clock synchronization';


-- ============================
-- END OF SCHEMA
-- ============================
