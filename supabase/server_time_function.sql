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
