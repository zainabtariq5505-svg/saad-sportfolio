-- Browser type and visit time only; no raw user-agent, IP, or location. Existing admin-only read policy stays in place.
CREATE OR REPLACE FUNCTION public.record_portfolio_visit(p_browser text DEFAULT 'Other')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF p_browser IS NULL OR p_browser NOT IN ('Chrome', 'Edge', 'Firefox', 'Safari', 'Opera', 'Other') THEN
    RAISE EXCEPTION 'Invalid browser type';
  END IF;
  PERFORM pg_advisory_xact_lock(763292);
  IF (SELECT count(*) FROM public.visitors WHERE timestamp > now() - interval '1 minute') >= 120
    OR (SELECT count(*) FROM public.visitors WHERE timestamp > now() - interval '1 day') >= 10000 THEN
    RETURN;
  END IF;
  INSERT INTO public.visitors(timestamp, country, page_url, user_agent)
  VALUES (now(), 'Not collected', '/', p_browser);
END $$;
REVOKE ALL ON FUNCTION public.record_portfolio_visit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_portfolio_visit(text) TO anon, authenticated;
