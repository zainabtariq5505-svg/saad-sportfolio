-- Only the public profile is readable by visitors; admin edits use the existing admin policy.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='settings' AND policyname='public_portfolio_profile') THEN
    CREATE POLICY public_portfolio_profile ON public.settings FOR SELECT TO anon, authenticated USING (key='portfolio_profile');
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.portfolio_daily_visits(p_days integer, p_timezone text)
RETURNS TABLE(day text, visits bigint)
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF (auth.jwt()->'app_metadata'->>'portfolio_admin') IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF p_days NOT IN (7,30) THEN RAISE EXCEPTION 'Invalid range'; END IF;
  RETURN QUERY
    WITH dates AS (SELECT generate_series((now() AT TIME ZONE p_timezone)::date - (p_days-1), (now() AT TIME ZONE p_timezone)::date, interval '1 day')::date AS d)
    SELECT dates.d::text, count(v.id)
    FROM dates LEFT JOIN public.visitors v ON (v.timestamp AT TIME ZONE p_timezone)::date = dates.d
    GROUP BY dates.d ORDER BY dates.d;
END $$;
REVOKE ALL ON FUNCTION public.portfolio_daily_visits(integer,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portfolio_daily_visits(integer,text) TO authenticated;
