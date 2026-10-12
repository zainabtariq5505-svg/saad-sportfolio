# Required before Vercel deployment

The website now uses Supabase Auth. There is no password in the source, and the old browser session flag no longer grants access. Database permissions must be updated in the existing Supabase project before this site is safe to deploy.

1. In the Supabase SQL Editor, run `fix-policies.sql` for the existing database. This replaces all existing settings/visitors policies, restricts edits to admins, and makes visitor records private. For a fresh database only, use `supabase-setup.sql` instead.
2. In Supabase Authentication > Users, create your admin user with an email and a new unique password. Do not reuse the old password. Disable public sign-ups if this project only needs an admin account.
3. Copy that user's UUID. In the SQL Editor, replace the placeholder below with that UUID and run:

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
  || '{"portfolio_admin": true}'::jsonb
WHERE id = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid;
```

4. Sign in at `/admin` with the new email/password. If already signed in, sign out and back in so the token includes the admin permission.
5. Confirm logged-out visitors can view the video setting but cannot read visitor records or modify settings. Confirm the admin can save a video. The SQL update is essential: changing website code does not change existing database policies.
6. Import this GitHub repository into Vercel. Choose framework **Other**, repository root as the root directory, no build command, and output directory `.`. The included `vercel.json` supplies `/admin` and `/dashboard` routes.

Only the Supabase public/anon key is shipped to the browser. Never place a service-role key, database password, or admin password in website files or GitHub.

Public visitor collection is disabled. Historical records remain available to the authorized admin after the SQL migration. Do not run older permissive policy snippets from historical guides.

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security
