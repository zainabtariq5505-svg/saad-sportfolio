-- Anonymous visit counts only. Existing admin-only read policy stays in place.
CREATE OR REPLACE FUNCTION public.record_portfolio_visit()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(763292);
  IF (SELECT count(*) FROM public.visitors WHERE timestamp > now() - interval '1 minute') >= 120
    OR (SELECT count(*) FROM public.visitors WHERE timestamp > now() - interval '1 day') >= 10000 THEN
    RETURN;
  END IF;
  INSERT INTO public.visitors(timestamp, country, page_url)
  VALUES (now(), 'Not collected', '/');
END $$;
REVOKE ALL ON FUNCTION public.record_portfolio_visit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_portfolio_visit() TO anon, authenticated;
