# BrightPath CRM — Database & Migration Guide

This directory contains the PostgreSQL schema, Row Level Security (RLS) policies, triggers, and sample seed data for BrightPath CRM on Supabase.

---

## 1. Quick Setup via Supabase SQL Editor (Recommended)

You do **not** need the Supabase CLI installed. You can apply everything in 60 seconds from your browser:

### Step 1: Run the Schema Migration
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project (`brightpath-crm`).
2. In the left navigation, click the **SQL Editor** icon (`>_`).
3. Click **"New query"**.
4. Copy the entire contents of [`supabase/migrations/20261023000001_initial_schema.sql`](./migrations/20261023000001_initial_schema.sql).
5. Paste it into the editor and click **Run** (green button).
6. Verify output says: `Success. No rows returned`.
7. Repeat steps 3–6 with [`supabase/migrations/20261029000001_restrict_get_user_role.sql`](./migrations/20261029000001_restrict_get_user_role.sql), which limits the role helper function to signed-in users.

### Step 2: (Optional) Run the Demo Seed Data
1. In the **SQL Editor**, click **"New query"**.
2. Copy the contents of [`supabase/seed.sql`](./seed.sql).
3. Paste and click **Run**.
4. Output will display: `Demo seed data inserted successfully: 6 leads, 4 follow-ups, and audit history.`

### Step 3: Verify Tables in the Dashboard
1. In the left navigation, click the **Table Editor** icon.
2. You will see 4 tables created:
   - `profiles` (with RLS enabled 🛡️)
   - `leads` (with RLS enabled 🛡️)
   - `follow_ups` (with RLS enabled 🛡️)
   - `activities` (with RLS enabled 🛡️)

---

## 2. Admin Promotion Procedure (Safe Bootstrap)

By design, all new user registrations default to the least-privileged role (`counsellor`). Users cannot elevate their own role through client-side API requests.

To promote your own user account to `admin` or `manager`:

1. Sign up a new account in the BrightPath CRM application (e.g. `admin@brightpath.edu`).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Run this query (replace with your email):
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id IN (
     SELECT id FROM auth.users WHERE email = 'admin@brightpath.edu'
   );
   ```
4. Verify the role has updated:
   ```sql
   SELECT p.id, p.full_name, p.role, u.email
   FROM public.profiles p
   JOIN auth.users u ON u.id = p.id;
   ```

---

## 3. Database Reset Procedure (Workshop Safe Reset)

If you ever need to clean the workshop database and re-run migrations from scratch:

```sql
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.follow_ups CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.trigger_set_updated_at CASCADE;
```
Then re-run every file in `migrations/` in filename order, starting with `20261023000001_initial_schema.sql`.
