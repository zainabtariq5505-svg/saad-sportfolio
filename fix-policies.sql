-- Apply in Supabase SQL Editor before deploying the website.
BEGIN;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
-- Remove every prior policy; permissive policies combine with OR.
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('settings', 'visitors')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;
REVOKE ALL ON public.settings, public.visitors FROM anon, authenticated;
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT SELECT ON public.visitors TO authenticated;
-- Visitor collection is disabled until a protected server endpoint is available.
CREATE POLICY settings_public_video ON public.settings FOR SELECT TO anon, authenticated
  USING (key = 'background_video');
CREATE POLICY settings_admin ON public.settings FOR ALL TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'portfolio_admin') = 'true')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'portfolio_admin') = 'true');
CREATE POLICY visitors_admin_read ON public.visitors FOR SELECT TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'portfolio_admin') = 'true');
COMMIT;
