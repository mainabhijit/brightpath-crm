-- ==============================================================================
-- BrightPath CRM — Restrict get_user_role() to signed-in users
-- Version: 20261029000001_restrict_get_user_role.sql
-- Description: get_user_role() is SECURITY DEFINER, so it reads profiles past RLS.
--   By default Postgres grants EXECUTE to PUBLIC, and Supabase also grants it to
--   `anon`, which let signed-out visitors call /rest/v1/rpc/get_user_role and learn
--   any user's role from their id. Every RLS policy that calls it is scoped
--   `TO authenticated`, so only that role (plus service_role) needs EXECUTE.
-- Safe to re-run.
-- ==============================================================================

REVOKE EXECUTE ON FUNCTION public.get_user_role(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(UUID) FROM anon;

GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO service_role;
