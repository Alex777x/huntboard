-- C-5: Fix RLS policy that leaks ai_settings (including encrypted API keys) to recruiters.
-- The original "Recruiters can view visible seekers" policy exposes the entire profiles row,
-- including the ai_settings JSONB column which contains encrypted API keys.
--
-- Fix: Replace the policy to exclude sensitive columns by using a security-definer view.
-- Recruiters MUST query recruiter_visible_profiles, never the base profiles table directly.

-- Step 1: Drop all overly permissive recruiter policies on base table
DROP POLICY IF EXISTS "Recruiters can view visible seekers" ON public.profiles;
DROP POLICY IF EXISTS "Recruiters can view visible seekers limited" ON public.profiles;

-- Step 2: Create a restricted view for recruiter access that excludes sensitive fields
CREATE OR REPLACE VIEW public.recruiter_visible_profiles AS
SELECT
    id,
    full_name,
    role,
    avatar_url,
    current_role,
    desired_role,
    location,
    open_to_relocation,
    skills,
    linkedin_url,
    github_url,
    portfolio_url,
    visible_to_recruiters,
    company_name,
    reputation_score,
    created_at,
    updated_at
    -- Explicitly EXCLUDE: ai_settings, company_email, is_verified_recruiter internals
FROM public.profiles
WHERE visible_to_recruiters = true;

-- Step 3: Grant recruiters access to the view
GRANT SELECT ON public.recruiter_visible_profiles TO authenticated;

-- Step 4: Ensure the base profiles table ONLY allows own-row access
-- No cross-user SELECT is permitted — recruiters must use the view above
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- NOTE: There is NO cross-user SELECT policy on public.profiles.
-- Recruiters query recruiter_visible_profiles for talent discovery.

COMMENT ON VIEW public.recruiter_visible_profiles IS
    'Safe read-only view for recruiter talent search. Excludes ai_settings, encrypted keys, and other sensitive profile data. Recruiters must use this view instead of querying public.profiles directly.';
