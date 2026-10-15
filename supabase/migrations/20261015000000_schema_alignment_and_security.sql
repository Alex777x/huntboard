-- ============================================================================
-- Migration: 20261015000000_schema_alignment_and_security.sql
-- Description:
-- 1. Profiles and Feedback schema synchronization for Admin & Seeker (B-2)
-- 2. Recruiter Verification table, functions & privilege protection (B-1)
-- 3. Telegram & notification preferences in profiles (B-3)
-- 4. Invites security policies and foreign key relations (B-5)
-- ============================================================================

-- 1. Profiles Table Updates (B-2, B-3)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT,
    ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

UPDATE public.profiles
SET verified = COALESCE(is_verified_recruiter, false)
WHERE verified IS NULL OR verified = false;

-- 2. Feedback Tickets Table Updates (B-2)
ALTER TABLE public.feedback_tickets
    ADD COLUMN IF NOT EXISTS user_email TEXT,
    ADD COLUMN IF NOT EXISTS user_name TEXT,
    ADD COLUMN IF NOT EXISTS type TEXT,
    ADD COLUMN IF NOT EXISTS severity TEXT;

UPDATE public.feedback_tickets
SET type = COALESCE(type, ticket_type),
    severity = COALESCE(severity, priority);

-- 3. Recruiter Verifications Table (B-1)
CREATE TABLE IF NOT EXISTS public.recruiter_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    work_email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.recruiter_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verifications" ON public.recruiter_verifications;
CREATE POLICY "Users can view own verifications" ON public.recruiter_verifications
    FOR SELECT TO authenticated
    USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own verifications" ON public.recruiter_verifications;
CREATE POLICY "Users can insert own verifications" ON public.recruiter_verifications
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = profile_id);

CREATE INDEX IF NOT EXISTS idx_recruiter_verifications_profile ON public.recruiter_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_verifications_code ON public.recruiter_verifications(code, expires_at);

-- 4. Function & Trigger to prevent direct client escalation of role and verification (B-1)
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow admins to update anything
    IF public.is_admin() THEN
        RETURN NEW;
    END IF;

    -- Non-admins cannot self-verify recruiter status directly
    IF NEW.is_verified_recruiter IS DISTINCT FROM OLD.is_verified_recruiter AND NEW.is_verified_recruiter = true THEN
        IF current_setting('huntboard.internal_verify', true) IS DISTINCT FROM '1' THEN
            NEW.is_verified_recruiter := OLD.is_verified_recruiter;
            NEW.verified := OLD.verified;
        END IF;
    END IF;

    -- Non-admins cannot self-promote to admin
    IF NEW.role IS DISTINCT FROM OLD.role AND NEW.role = 'admin' THEN
        NEW.role := OLD.role;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- 5. Safe Recruiter Verification Functions (B-1)
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

    IF p_work_email IS NULL OR position('@' in p_work_email) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid work email address');
    END IF;

    -- Generate 6-digit random code
    v_code := lpad(floor(random() * 1000000)::text, 6, '0');

    -- Insert verification record expiring in 15 minutes
    INSERT INTO public.recruiter_verifications (
        profile_id, company_name, work_email, code, expires_at
    ) VALUES (
        v_user_id, p_company_name, p_work_email, v_code, NOW() + INTERVAL '15 minutes'
    );

    RETURN jsonb_build_object('success', true, 'code', v_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
      AND code = trim(p_code)
      AND verified_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired code');
    END IF;

    -- Mark code as used
    UPDATE public.recruiter_verifications
    SET verified_at = NOW()
    WHERE id = v_record.id;

    -- Set internal flag so trigger allows updating verification status
    PERFORM set_config('huntboard.internal_verify', '1', true);

    -- Update profile
    UPDATE public.profiles
    SET is_verified_recruiter = true,
        verified = true,
        company_name = v_record.company_name,
        company_email = v_record.work_email,
        updated_at = NOW()
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'company_name', v_record.company_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Invites Policies & Relations (B-5)
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Senders can manage sent invites" ON public.invites;
CREATE POLICY "Senders can manage sent invites" ON public.invites
    FOR ALL TO authenticated
    USING (auth.uid() = sender_id OR public.is_admin());

DROP POLICY IF EXISTS "Receivers can view and respond to received invites" ON public.invites;
CREATE POLICY "Receivers can view and respond to received invites" ON public.invites
    FOR SELECT TO authenticated
    USING (auth.uid() = receiver_id OR public.is_admin());

DROP POLICY IF EXISTS "Receivers can update status of received invites" ON public.invites;
CREATE POLICY "Receivers can update status of received invites" ON public.invites
    FOR UPDATE TO authenticated
    USING (auth.uid() = receiver_id);
