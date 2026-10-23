-- ==============================================================================
-- BrightPath CRM — Master Database Schema Migration
-- Version: 20261023000001_initial_schema.sql
-- Stack: Supabase PostgreSQL with Row Level Security (RLS)
-- Description: Creates profiles, leads, follow_ups, activities, triggers, & RLS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'counsellor' CHECK (role IN ('counsellor', 'manager', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users with CRM roles';
COMMENT ON COLUMN public.profiles.role IS 'Role controls pipeline visibility: counsellor, manager, or admin';

-- ------------------------------------------------------------------------------
-- 3. SECURITY DEFINER HELPER: GET CURRENT USER ROLE
-- ------------------------------------------------------------------------------
-- Prevents RLS recursive evaluation loops and protects against search_path hijack
CREATE OR REPLACE FUNCTION public.get_user_role(user_uid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_uid;
$$;

-- ------------------------------------------------------------------------------
-- 4. AUTOMATED TIMESTAMP TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach updated_at trigger to profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- ------------------------------------------------------------------------------
-- 5. AUTOMATED SIGNUP PROFILE TRIGGER
-- ------------------------------------------------------------------------------
-- Automatically provisions a public.profiles record when a user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      'Staff Member'
    ),
    'counsellor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 6. LEADS TABLE (Student Enquiries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  course_interest TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lost_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_lost_reason CHECK (
    status != 'Lost' OR (lost_reason IS NOT NULL AND length(trim(lost_reason)) > 0)
  )
);

COMMENT ON TABLE public.leads IS 'Student admissions pipeline enquiries';

-- Attach updated_at trigger to leads
DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;
CREATE TRIGGER set_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- ------------------------------------------------------------------------------
-- 7. FOLLOW-UPS TABLE (Scheduled Counselling Tasks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.follow_ups IS 'Scheduled counselling follow-up calls and meetings';

-- ------------------------------------------------------------------------------
-- 8. ACTIVITIES TABLE (Chronological Audit Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.activities IS 'Audit timeline of all lead updates, status transitions, and calls';

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_status ON public.follow_ups(status, due_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_assigned_to ON public.follow_ups(assigned_to);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- 1. Any authenticated user can read all profiles (needed for counsellor assignment)
CREATE POLICY "profiles_select_authenticated"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Users can update their own full_name, but CANNOT self-promote their role
CREATE POLICY "profiles_update_self"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND (
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    OR public.get_user_role(auth.uid()) = 'admin'
  )
);

-- 3. Admins can update any profile (including promoting roles)
CREATE POLICY "profiles_update_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- ------------------------------------------------------------------------------
-- LEADS POLICIES
-- ------------------------------------------------------------------------------
-- 1. SELECT: Managers/Admins see all leads. Counsellors see created or assigned leads.
CREATE POLICY "leads_select_policy"
ON public.leads
FOR SELECT
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('manager', 'admin')
  OR created_by = auth.uid()
  OR assigned_to = auth.uid()
);

-- 2. INSERT: Any authenticated staff member can create a lead
CREATE POLICY "leads_insert_policy"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 3. UPDATE: Managers/Admins can edit any lead. Counsellors can edit own/assigned leads.
CREATE POLICY "leads_update_policy"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('manager', 'admin')
  OR created_by = auth.uid()
  OR assigned_to = auth.uid()
)
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('manager', 'admin')
  OR created_by = auth.uid()
  OR assigned_to = auth.uid()
);

-- 4. DELETE: Only Managers and Admins can delete leads (prevents accidental data loss)
CREATE POLICY "leads_delete_policy"
ON public.leads
FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('manager', 'admin')
);

-- ------------------------------------------------------------------------------
-- FOLLOW-UPS POLICIES
-- ------------------------------------------------------------------------------
-- 1. SELECT: Permitted if user has access to the linked lead
CREATE POLICY "follow_ups_select_policy"
ON public.follow_ups
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = follow_ups.lead_id
    AND (
      public.get_user_role(auth.uid()) IN ('manager', 'admin')
      OR leads.created_by = auth.uid()
      OR leads.assigned_to = auth.uid()
    )
  )
);

-- 2. INSERT: Permitted if user has access to the linked lead
CREATE POLICY "follow_ups_insert_policy"
ON public.follow_ups
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = follow_ups.lead_id
    AND (
      public.get_user_role(auth.uid()) IN ('manager', 'admin')
      OR leads.created_by = auth.uid()
      OR leads.assigned_to = auth.uid()
    )
  )
);

-- 3. UPDATE: Permitted if user has access to the linked lead
CREATE POLICY "follow_ups_update_policy"
ON public.follow_ups
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = follow_ups.lead_id
    AND (
      public.get_user_role(auth.uid()) IN ('manager', 'admin')
      OR leads.created_by = auth.uid()
      OR leads.assigned_to = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = follow_ups.lead_id
    AND (
      public.get_user_role(auth.uid()) IN ('manager', 'admin')
      OR leads.created_by = auth.uid()
      OR leads.assigned_to = auth.uid()
    )
  )
);

-- 4. DELETE: Permitted for Managers/Admins or the creator
CREATE POLICY "follow_ups_delete_policy"
ON public.follow_ups
FOR DELETE
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('manager', 'admin')
  OR created_by = auth.uid()
);

-- ------------------------------------------------------------------------------
-- ACTIVITIES POLICIES
-- ------------------------------------------------------------------------------
-- 1. SELECT: Permitted if user has access to the linked lead
CREATE POLICY "activities_select_policy"
ON public.activities
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = activities.lead_id
    AND (
      public.get_user_role(auth.uid()) IN ('manager', 'admin')
      OR leads.created_by = auth.uid()
      OR leads.assigned_to = auth.uid()
    )
  )
);

-- 2. INSERT: Permitted for authenticated staff who have access to the lead
CREATE POLICY "activities_insert_policy"
ON public.activities
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = activities.lead_id
    AND (
      public.get_user_role(auth.uid()) IN ('manager', 'admin')
      OR leads.created_by = auth.uid()
      OR leads.assigned_to = auth.uid()
    )
  )
);
