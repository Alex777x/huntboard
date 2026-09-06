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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own events" ON public.events FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users can manage own feedback" ON public.feedback_tickets FOR ALL USING (auth.uid() = profile_id);
