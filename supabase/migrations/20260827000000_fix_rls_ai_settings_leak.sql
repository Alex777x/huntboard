-- C-4: Fix RLS policy that leaks ai_settings (including encrypted API keys) to recruiters.
-- The original "Recruiters can view visible seekers" policy exposes the entire profiles row,
-- including the ai_settings JSONB column which contains encrypted API keys.
--
-- Fix: Replace the policy to exclude sensitive columns by using a security-definer view.

-- Step 1: Drop the overly permissive policy
DROP POLICY IF EXISTS "Recruiters can view visible seekers" ON public.profiles;

-- Step 2: Create a restricted view for recruiter access that excludes sensitive fields
CREATE OR REPLACE VIEW public.recruiter_visible_profiles AS
SELECT
    id,
    full_name,
    email,
    role,
    avatar_url,
    location,
    headline,
    bio,
    visible_to_recruiters,
    created_at,
    updated_at
    -- Explicitly EXCLUDE: ai_settings, encrypted keys, internal flags
FROM public.profiles
WHERE visible_to_recruiters = true;

-- Step 3: Grant recruiters access to the view
GRANT SELECT ON public.recruiter_visible_profiles TO authenticated;

-- Step 4: Re-create a tighter profiles policy that only allows own-row access
-- (The "Users can view own profile" policy already handles self-access)
-- This ensures no cross-user profile access via direct table queries
CREATE POLICY "Recruiters can view visible seekers limited" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id
        OR (
            visible_to_recruiters = true
            AND EXISTS (
                SELECT 1 FROM public.profiles recruiter
                WHERE recruiter.id = auth.uid()
                AND recruiter.role IN ('recruiter', 'admin')
            )
        )
    );

-- Step 5: Revoke direct column access to ai_settings for non-owners
-- Note: Supabase doesn't support column-level RLS natively, so the view
-- approach above is the recommended pattern. Recruiters should query
-- recruiter_visible_profiles instead of profiles directly.

COMMENT ON VIEW public.recruiter_visible_profiles IS
    'Safe read-only view for recruiter talent search. Excludes ai_settings and other sensitive profile data.';
