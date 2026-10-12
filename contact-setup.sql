BEGIN;
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  message text NOT NULL CHECK (length(message) BETWEEN 1 AND 5000)
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_messages FROM anon, authenticated;
GRANT SELECT ON public.contact_messages TO authenticated;
DROP POLICY IF EXISTS contact_admin_read ON public.contact_messages;
CREATE POLICY contact_admin_read ON public.contact_messages FOR SELECT TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'portfolio_admin') = 'true');
CREATE OR REPLACE FUNCTION public.submit_contact(p_name text, p_email text, p_message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF p_name IS NULL OR p_email IS NULL OR p_message IS NULL
    OR length(trim(p_name)) NOT BETWEEN 1 AND 100
    OR length(trim(p_email)) NOT BETWEEN 3 AND 254
    OR trim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR length(trim(p_message)) NOT BETWEEN 1 AND 5000 THEN
    RAISE EXCEPTION 'Please enter a valid name, email, and message.';
  END IF;
  -- Serialize submission checks so concurrent requests cannot bypass the limit.
  PERFORM pg_advisory_xact_lock(763291);
  IF (SELECT count(*) FROM public.contact_messages WHERE created_at > now() - interval '1 minute') >= 20
    OR (SELECT count(*) FROM public.contact_messages WHERE created_at > now() - interval '1 hour') >= 100
    OR (SELECT count(*) FROM public.contact_messages WHERE email = lower(trim(p_email)) AND created_at > now() - interval '10 minutes') >= 3 THEN
    RAISE EXCEPTION 'Too many messages. Please try again later.';
  END IF;
  INSERT INTO public.contact_messages(name, email, message)
  VALUES (trim(p_name), lower(trim(p_email)), trim(p_message));
END $$;
REVOKE ALL ON FUNCTION public.submit_contact(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_contact(text,text,text) TO anon, authenticated;
COMMIT;
