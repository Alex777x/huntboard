-- Missing tables required for mock data migration

-- 1. Events (Calendar)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company_name TEXT,
    event_type TEXT,
    event_date DATE NOT NULL,
    time_range TEXT,
    interviewers TEXT,
    video_link TEXT,
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Feedback Tickets
CREATE TABLE IF NOT EXISTS public.feedback_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    upvotes INTEGER NOT NULL DEFAULT 0,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for WHERE / ORDER BY scalability
CREATE INDEX IF NOT EXISTS idx_events_profile_date ON public.events(profile_id, event_date);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_created ON public.feedback_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_profile ON public.feedback_tickets(profile_id);

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own events" ON public.events
    FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can view feedback tickets" ON public.feedback_tickets
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own feedback" ON public.feedback_tickets
    FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Admins can manage all feedback tickets" ON public.feedback_tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can create community reports" ON public.community_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage community reports" ON public.community_reports
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
