-- ============================================
-- COMPLETE SUPABASE SETUP - RUN THIS ONCE
-- Copy ALL of this and paste in Supabase SQL Editor
-- ============================================

-- Drop tables if they exist (clean start)
DROP TABLE IF EXISTS visitors;
DROP TABLE IF EXISTS settings;

-- Create visitors table
CREATE TABLE visitors (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    country TEXT,
    country_code TEXT,
    region TEXT,
    city TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    timezone TEXT,
    org TEXT,
    user_agent TEXT,
    screen_resolution TEXT,
    language TEXT,
    referrer TEXT,
    page_url TEXT
);

-- Create settings table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_visitors_timestamp ON visitors(timestamp DESC);
CREATE INDEX idx_visitors_country ON visitors(country);
CREATE INDEX idx_visitors_ip ON visitors(ip_address);

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
