CREATE TABLE IF NOT EXISTS public.ai_quota (
  bucket text PRIMARY KEY,
  day date NOT NULL DEFAULT current_date,
  minute timestamptz NOT NULL DEFAULT date_trunc('minute',now()),
  daily integer NOT NULL DEFAULT 0,
  per_minute integer NOT NULL DEFAULT 0
);
ALTER TABLE public.ai_quota ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_quota FROM anon,authenticated;
CREATE OR REPLACE FUNCTION public.consume_ai_quota(p_bucket text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE b text; q public.ai_quota;
BEGIN
  IF p_bucket IS NULL OR p_bucket !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
  PERFORM pg_advisory_xact_lock(763295);
  FOREACH b IN ARRAY ARRAY['global',p_bucket] LOOP
    INSERT INTO public.ai_quota(bucket) VALUES(b) ON CONFLICT DO NOTHING;
    UPDATE public.ai_quota SET daily=CASE WHEN day=current_date THEN daily ELSE 0 END,
      per_minute=CASE WHEN minute=date_trunc('minute',now()) THEN per_minute ELSE 0 END,
      day=current_date,minute=date_trunc('minute',now()) WHERE bucket=b;
    SELECT * INTO q FROM public.ai_quota WHERE bucket=b;
    IF q.daily >= CASE WHEN b='global' THEN 150 ELSE 10 END OR q.per_minute >= CASE WHEN b='global' THEN 15 ELSE 3 END THEN RETURN false; END IF;
  END LOOP;
  UPDATE public.ai_quota SET daily=daily+1,per_minute=per_minute+1 WHERE bucket IN ('global',p_bucket);
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.consume_ai_quota(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(text) TO anon,authenticated;
