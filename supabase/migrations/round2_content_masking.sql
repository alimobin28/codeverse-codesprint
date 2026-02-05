-- ====================================================================
-- Round 2 Content Masking & Security
-- 
-- Features:
-- 1. Sequential content unlocking for Round 2
-- 2. 10-second preview window before problem unlock
-- 3. RLS policies for admin/public access control
-- ====================================================================

-- Clean up existing objects
DROP VIEW IF EXISTS public.problems_masked;
DROP POLICY IF EXISTS "Public read problems" ON public.problems;
DROP POLICY IF EXISTS "Public read hints" ON public.hints;
DROP FUNCTION IF EXISTS is_problem_visible(UUID);

-- ============================
-- Visibility Function
-- ============================
CREATE OR REPLACE FUNCTION is_problem_visible(p_problem_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_round_number INTEGER;
    v_is_unlocked BOOLEAN;
    v_timer_active BOOLEAN;
    v_timer_started_at TIMESTAMPTZ;
    v_sort_order INTEGER;
    v_elapsed_seconds INTEGER;
    v_unlock_time INTEGER;
    v_cumulative_time INTEGER;
BEGIN
    SELECT 
        p.round_number,
        p.sort_order,
        r.is_unlocked,
        r.timer_active,
        r.timer_started_at
    INTO 
        v_round_number,
        v_sort_order,
        v_is_unlocked,
        v_timer_active,
        v_timer_started_at
    FROM public.problems p
    JOIN public.rounds r ON p.round_number = r.round_number
    WHERE p.id = p_problem_id;
    
    IF NOT v_is_unlocked THEN
        RETURN FALSE;
    END IF;
    
    IF v_round_number != 2 THEN
        RETURN TRUE;
    END IF;
    
    IF v_sort_order = 1 THEN
        RETURN TRUE;
    END IF;
    
    IF NOT v_timer_active OR v_timer_started_at IS NULL THEN
        RETURN FALSE;
    END IF;
    
    v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_timer_started_at))::INTEGER;
    
    SELECT COALESCE(SUM(individual_time_limit_seconds), 0)
    INTO v_cumulative_time
    FROM public.problems
    WHERE round_number = 2
      AND sort_order < v_sort_order;
    
    -- 10-second preview window
    v_unlock_time := GREATEST(0, v_cumulative_time - 10);
    
    RETURN v_elapsed_seconds >= v_unlock_time;
END;
$$;

GRANT EXECUTE ON FUNCTION is_problem_visible(UUID) TO anon, authenticated;

-- ============================
-- RLS Policies
-- ============================
CREATE POLICY "Public read problems"
ON public.problems
FOR SELECT
USING (
    auth.role() = 'authenticated'
    OR EXISTS (
        SELECT 1 FROM public.rounds r 
        WHERE r.round_number = problems.round_number 
        AND r.is_unlocked = true
    )
);

CREATE POLICY "Public read hints"
ON public.hints
FOR SELECT
USING (
    auth.role() = 'authenticated'
    OR EXISTS (
        SELECT 1 
        FROM public.problems p
        WHERE p.id = hints.problem_id 
        AND is_problem_visible(p.id)
    )
);

-- ============================
-- Masked View
-- ============================
CREATE VIEW public.problems_masked AS
SELECT 
    id,
    round_number,
    problem_code,
    title,
    sort_order,
    individual_time_limit_seconds,
    points,
    created_at,
    updated_at,
    CASE 
        WHEN auth.role() = 'authenticated' THEN statement
        WHEN is_problem_visible(id) THEN statement
        ELSE '🔒 This problem will be unlocked soon. Please wait...'
    END as statement,
    CASE 
        WHEN auth.role() = 'authenticated' THEN guidance
        WHEN is_problem_visible(id) THEN guidance
        ELSE NULL
    END as guidance,
    is_problem_visible(id) as is_content_visible
FROM public.problems;

GRANT SELECT ON public.problems_masked TO anon, authenticated;

-- Enable realtime (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'problems'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.problems;
  END IF;
END $$;
