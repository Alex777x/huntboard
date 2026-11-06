-- ============================================================================
-- Migration: 20261106000000_audit_remediation.sql
-- Description:
-- 1. Prevent role escalation in handle_new_user() and protect INSERT/UPDATE on profiles
-- 2. Add INSERT RLS policy on profiles so .upsert() works for authenticated users
-- 3. Lock down recruiter_verifications RLS, add brute-force attempts limit, remove code leak
-- 4. Add recruiter_notes and recruiter RLS policies on applications + get_job_applicants RPC
-- 5. Add get_invite_notification_context RPC (verifies invite ownership)
-- 6. Add atomic increment_token_balance RPC for admins
-- ============================================================================

-- 1. Safe handle_new_user() — never allow 'admin' role via signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    v_role := CASE
        WHEN NEW.raw_user_meta_data->>'role' = 'recruiter' THEN 'recruiter'
        ELSE 'seeker'
    END;

    INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Member'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        v_role
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.ai_token_balance (profile_id, tokens_remaining, tokens_used)
    VALUES (NEW.id, 50, 0)
    ON CONFLICT (profile_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Add INSERT policy on profiles & harden privilege trigger for both INSERT and UPDATE
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF public.is_admin() THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.role = 'admin' THEN
            NEW.role := 'seeker';
        END IF;
        IF current_setting('huntboard.internal_verify', true) IS DISTINCT FROM '1' THEN
            NEW.is_verified_recruiter := false;
            NEW.verified := false;
        END IF;
        RETURN NEW;
    END IF;

    -- TG_OP = 'UPDATE'
    IF NEW.is_verified_recruiter IS DISTINCT FROM OLD.is_verified_recruiter AND NEW.is_verified_recruiter = true THEN
        IF current_setting('huntboard.internal_verify', true) IS DISTINCT FROM '1' THEN
            NEW.is_verified_recruiter := OLD.is_verified_recruiter;
            NEW.verified := OLD.verified;
        END IF;
    END IF;

    IF NEW.verified IS DISTINCT FROM OLD.verified AND NEW.verified = true THEN
        IF current_setting('huntboard.internal_verify', true) IS DISTINCT FROM '1' THEN
            NEW.verified := OLD.verified;
        END IF;
    END IF;

    IF NEW.role IS DISTINCT FROM OLD.role AND NEW.role = 'admin' THEN
        NEW.role := OLD.role;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_fields
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- 3. Lock down recruiter_verifications (prevent client SELECT/INSERT bypass & add attempt limit)
ALTER TABLE public.recruiter_verifications
    ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;

DROP POLICY IF EXISTS "Users can view own verifications" ON public.recruiter_verifications;
DROP POLICY IF EXISTS "Users can insert own verifications" ON public.recruiter_verifications;
DROP POLICY IF EXISTS "Admins can view verifications" ON public.recruiter_verifications;

CREATE POLICY "Admins can view verifications" ON public.recruiter_verifications
    FOR ALL TO authenticated
    USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.request_recruiter_verification(
    p_company_name TEXT,
    p_work_email TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_code TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    IF p_company_name IS NULL OR length(trim(p_company_name)) < 2 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Valid company name is required');
    END IF;

    IF p_work_email IS NULL OR position('@' in p_work_email) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid work email address');
    END IF;

    v_code := lpad(floor(random() * 1000000)::text, 6, '0');

    -- Invalidate previous pending codes for this user
    UPDATE public.recruiter_verifications
    SET expires_at = NOW()
    WHERE profile_id = v_user_id AND verified_at IS NULL AND expires_at > NOW();

    INSERT INTO public.recruiter_verifications (
        profile_id, company_name, work_email, code, expires_at, attempts
    ) VALUES (
        v_user_id, trim(p_company_name), trim(p_work_email), v_code, NOW() + INTERVAL '15 minutes', 0
    );

    -- Do NOT leak v_code in the standard response
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.confirm_recruiter_verification(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_record RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    SELECT * INTO v_record
    FROM public.recruiter_verifications
    WHERE profile_id = v_user_id
      AND verified_at IS NULL
      AND expires_at > NOW()
      AND attempts < 5
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'No active verification code or maximum attempts exceeded');
    END IF;

    IF v_record.code IS DISTINCT FROM trim(p_code) THEN
        UPDATE public.recruiter_verifications
        SET attempts = attempts + 1
        WHERE id = v_record.id;

        RETURN jsonb_build_object('success', false, 'error', 'Invalid verification code');
    END IF;

    UPDATE public.recruiter_verifications
    SET verified_at = NOW()
    WHERE id = v_record.id;

    PERFORM set_config('huntboard.internal_verify', '1', true);

    UPDATE public.profiles
    SET is_verified_recruiter = true,
        verified = true,
        company_name = v_record.company_name,
        company_email = v_record.work_email,
        updated_at = NOW()
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'company_name', v_record.company_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Update recruiter_visible_profiles view & add safe public_recruiter_profiles view for invites
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
    is_verified_recruiter,
    reputation_score,
    created_at,
    updated_at
FROM public.profiles
WHERE visible_to_recruiters = true AND role = 'seeker';

GRANT SELECT ON public.recruiter_visible_profiles TO authenticated;

-- Safe RPC for seekers to fetch their received invites with sender name & job details
CREATE OR REPLACE FUNCTION public.get_seeker_invites()
RETURNS TABLE (
    id UUID,
    recruiter_job_id UUID,
    recruiter_name TEXT,
    company_name TEXT,
    is_verified_company BOOLEAN,
    job_title TEXT,
    location TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    message TEXT,
    created_at TIMESTAMPTZ,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.recruiter_job_id,
        COALESCE(p.full_name, 'Recruiter') AS recruiter_name,
        COALESCE(rj.company_name, p.company_name, 'Company') AS company_name,
        COALESCE(p.is_verified_recruiter, false) AS is_verified_company,
        COALESCE(rj.title, 'Open Role') AS job_title,
        COALESCE(rj.location, 'Remote') AS location,
        COALESCE(rj.salary_min, 0) AS salary_min,
        COALESCE(rj.salary_max, 0) AS salary_max,
        COALESCE(i.message, '') AS message,
        i.created_at,
        i.status
    FROM public.invites i
    LEFT JOIN public.profiles p ON p.id = i.sender_id
    LEFT JOIN public.recruiter_jobs rj ON rj.id = i.recruiter_job_id
    WHERE i.receiver_id = auth.uid()
    ORDER BY i.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 5. Recruiter ATS Pipeline: add recruiter_notes to applications, RLS policies & RPC
ALTER TABLE public.applications
    ADD COLUMN IF NOT EXISTS recruiter_notes TEXT;

DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON public.applications;
CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications
    FOR SELECT TO authenticated
    USING (
        recruiter_job_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.recruiter_jobs rj
            WHERE rj.id = applications.recruiter_job_id AND rj.recruiter_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Recruiters can update applications for their jobs" ON public.applications;
CREATE POLICY "Recruiters can update applications for their jobs" ON public.applications
    FOR UPDATE TO authenticated
    USING (
        recruiter_job_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.recruiter_jobs rj
            WHERE rj.id = applications.recruiter_job_id AND rj.recruiter_id = auth.uid()
        )
    );

CREATE OR REPLACE FUNCTION public.get_job_applicants_with_profiles(p_job_id UUID)
RETURNS TABLE (
    id UUID,
    status TEXT,
    created_at TIMESTAMPTZ,
    cover_letter TEXT,
    notes TEXT,
    recruiter_notes TEXT,
    ats_score JSONB,
    full_name TEXT,
    email TEXT,
    current_role TEXT,
    skills JSONB
) AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.recruiter_jobs rj
        WHERE rj.id = p_job_id AND (rj.recruiter_id = auth.uid() OR public.is_admin())
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.status,
        a.created_at,
        a.cover_letter,
        a.notes,
        a.recruiter_notes,
        a.ats_score,
        COALESCE(p.full_name, 'Candidate') AS full_name,
        COALESCE(p.email, '') AS email,
        COALESCE(p.current_role, 'Candidate') AS current_role,
        COALESCE(p.skills, '[]'::jsonb) AS skills
    FROM public.applications a
    LEFT JOIN public.profiles p ON p.id = a.profile_id
    WHERE a.recruiter_job_id = p_job_id
    ORDER BY a.created_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 6. Safe Invite Notification Context RPC (verifies invite exists from auth.uid() to receiver)
CREATE OR REPLACE FUNCTION public.get_invite_notification_context(
    p_receiver_id UUID,
    p_job_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_sender_id UUID;
    v_receiver RECORD;
    v_sender RECORD;
    v_job RECORD;
BEGIN
    v_sender_id := auth.uid();
    IF v_sender_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Unauthorized');
    END IF;

    -- Verify an invite from this sender to this receiver for this job actually exists
    IF NOT EXISTS (
        SELECT 1 FROM public.invites
        WHERE sender_id = v_sender_id
          AND receiver_id = p_receiver_id
          AND recruiter_job_id = p_job_id
    ) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'No matching invite found');
    END IF;

    SELECT telegram_bot_token, telegram_chat_id INTO v_receiver
    FROM public.profiles
    WHERE id = p_receiver_id;

    SELECT full_name, company_name INTO v_sender
    FROM public.profiles
    WHERE id = v_sender_id;

    SELECT title, company_name INTO v_job
    FROM public.recruiter_jobs
    WHERE id = p_job_id;

    RETURN jsonb_build_object(
        'ok', true,
        'telegram_bot_token', v_receiver.telegram_bot_token,
        'telegram_chat_id', v_receiver.telegram_chat_id,
        'recruiter_name', COALESCE(v_sender.full_name, 'Recruiter'),
        'company_name', COALESCE(v_job.company_name, v_sender.company_name, 'Company'),
        'job_title', COALESCE(v_job.title, 'Position')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 7. Atomic Token Top-Up RPC for Admins (Required #7)
CREATE OR REPLACE FUNCTION public.increment_token_balance(
    p_profile_id UUID,
    p_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: admin privileges required';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 1000000 THEN
        RAISE EXCEPTION 'Invalid token amount';
    END IF;

    INSERT INTO public.ai_token_balance (profile_id, tokens_remaining, tokens_used, last_topped_up_at, updated_at)
    VALUES (p_profile_id, p_amount, 0, NOW(), NOW())
    ON CONFLICT (profile_id) DO UPDATE
    SET tokens_remaining = public.ai_token_balance.tokens_remaining + EXCLUDED.tokens_remaining,
        last_topped_up_at = NOW(),
        updated_at = NOW()
    RETURNING tokens_remaining INTO v_new_balance;

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
