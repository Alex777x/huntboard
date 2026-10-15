-- ============================================================================
-- HuntBoard — Security fixes, admin function, and schema updates
-- ============================================================================

-- 1. Helper function: is_admin() with SECURITY DEFINER
-- Avoids infinite recursion when checking admin privileges in profiles policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 2. Profiles Admin Policy (Fixes B-2 infinite recursion)
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- 3. AI Token Balance Admin Policy (Use is_admin())
DROP POLICY IF EXISTS "Admins can manage all token balances" ON public.ai_token_balance;
CREATE POLICY "Admins can manage all token balances" ON public.ai_token_balance
    FOR ALL USING (public.is_admin());

-- 4. Feedback Tickets Schema & Policies (R-1, R-2)
ALTER TABLE public.feedback_tickets 
    ADD COLUMN IF NOT EXISTS upvotes INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS admin_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_events_profile_date ON public.events(profile_id, event_date);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_created ON public.feedback_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_profile ON public.feedback_tickets(profile_id);

-- Restrict feedback ticket viewing to authenticated users only (R-2)
DROP POLICY IF EXISTS "Anyone can view feedback tickets" ON public.feedback_tickets;
DROP POLICY IF EXISTS "Authenticated users can view feedback tickets" ON public.feedback_tickets;
CREATE POLICY "Authenticated users can view feedback tickets" ON public.feedback_tickets
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage all feedback tickets" ON public.feedback_tickets;
CREATE POLICY "Admins can manage all feedback tickets" ON public.feedback_tickets
    FOR ALL USING (public.is_admin());

-- 5. Community Reports Policies
DROP POLICY IF EXISTS "Users can create community reports" ON public.community_reports;
CREATE POLICY "Users can create community reports" ON public.community_reports
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can manage community reports" ON public.community_reports;
CREATE POLICY "Admins can manage community reports" ON public.community_reports
    FOR ALL USING (public.is_admin());

-- 6. Add company_name to applications and contacts (B-4)
ALTER TABLE public.applications 
    ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE public.contacts 
    ADD COLUMN IF NOT EXISTS company_name TEXT;

CREATE INDEX IF NOT EXISTS idx_applications_company_name ON public.applications(company_name);
