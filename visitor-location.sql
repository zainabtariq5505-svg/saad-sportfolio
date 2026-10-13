CREATE OR REPLACE FUNCTION public.record_visit_details(p_browser text, p_ip text, p_country text, p_city text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF p_browser IS NULL OR p_browser NOT IN ('Chrome','Edge','Firefox','Safari','Opera','Other')
    OR length(p_country) > 100 OR length(p_city) > 100 OR length(p_ip) > 45 THEN
    RAISE EXCEPTION 'Invalid visit details';
  END IF;
  IF p_ip IS NOT NULL THEN PERFORM p_ip::inet; END IF;
  PERFORM pg_advisory_xact_lock(763292);
  IF (SELECT count(*) FROM public.visitors WHERE timestamp > now() - interval '1 minute') >= 120
    OR (SELECT count(*) FROM public.visitors WHERE timestamp > now() - interval '1 day') >= 10000
    OR (p_ip IS NOT NULL AND EXISTS (SELECT 1 FROM public.visitors WHERE ip_address = p_ip AND timestamp > now() - interval '30 minutes')) THEN
    RETURN;
  END IF;
  INSERT INTO public.visitors(timestamp,user_agent,ip_address,country,city,page_url)
  VALUES (now(),p_browser,p_ip,coalesce(nullif(p_country,''),'Location unavailable'),p_city,'/');
END $$;
REVOKE ALL ON FUNCTION public.record_visit_details(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_visit_details(text,text,text,text) TO anon, authenticated;
