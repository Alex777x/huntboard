-- ============================================================================
-- HuntBoard — Production PostgreSQL Schema with Supabase RLS Policies
-- ============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'seeker' CHECK (role IN ('seeker', 'recruiter', 'admin')),
    full_name TEXT,
    avatar_url TEXT,
    current_role TEXT,
    desired_role TEXT,
    location TEXT,
    open_to_relocation BOOLEAN DEFAULT false,
    skills JSONB DEFAULT '[]'::jsonb,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    ai_settings JSONB DEFAULT '{"provider": "openai", "model": "gpt-4o"}'::jsonb,
    locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'ru', 'pl')),
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
    visible_to_recruiters BOOLEAN NOT NULL DEFAULT false, -- Opt-in by default
    company_name TEXT, -- For recruiters
    company_email TEXT, -- For recruiter verification
    is_verified_recruiter BOOLEAN DEFAULT false,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AI Token Balance Table
CREATE TABLE IF NOT EXISTS public.ai_token_balance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    tokens_remaining INTEGER NOT NULL DEFAULT 50, -- Initial free 50 AI tokens
    tokens_used INTEGER NOT NULL DEFAULT 0,
    uses_own_key BOOLEAN NOT NULL DEFAULT false,
    last_topped_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Companies Directory Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    size TEXT,
    location TEXT,
    notes TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT,
    linkedin_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CVs Table
CREATE TABLE IF NOT EXISTS public.cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Main Resume',
    file_url TEXT,
    file_type TEXT CHECK (file_type IN ('pdf', 'docx')),
    content_text TEXT,
    structured_data JSONB DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Custom Statuses Table
CREATE TABLE IF NOT EXISTS public.custom_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6366f1',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#8b5cf6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Recruiter Jobs Table (Platform posted jobs)
CREATE TABLE IF NOT EXISTS public.recruiter_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    description TEXT NOT NULL,
    requirements TEXT,
    work_format TEXT CHECK (work_format IN ('remote', 'hybrid', 'onsite')),
    location TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
    view_count INTEGER DEFAULT 0,
    published_to_community BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Applications Table (Core Kanban Cards)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
    recruiter_job_id UUID REFERENCES public.recruiter_jobs(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    job_url TEXT,
    job_description TEXT,
    status TEXT NOT NULL DEFAULT 'wishlist' CHECK (
        status IN ('wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'withdrawn', 'no_response', 'custom')
    ),
    custom_status_id UUID REFERENCES public.custom_statuses(id) ON DELETE SET NULL,
    source TEXT DEFAULT 'other' CHECK (source IN ('linkedin', 'indeed', 'referral', 'company_site', 'community', 'platform', 'other')),
    work_format TEXT DEFAULT 'remote' CHECK (work_format IN ('remote', 'hybrid', 'onsite')),
    job_location TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    notes TEXT,
    cover_letter TEXT,
    applied_at DATE,
    next_interview_at TIMESTAMPTZ,
    deadline_at DATE,
    ats_score JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Application Timeline / History Table
CREATE TABLE IF NOT EXISTS public.application_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Application Contacts Join Table
CREATE TABLE IF NOT EXISTS public.application_contacts (
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    PRIMARY KEY (application_id, contact_id)
);

-- 13. Application Tags Join Table
CREATE TABLE IF NOT EXISTS public.application_tags (
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (application_id, tag_id)
);

-- 14. Job Applicants Table (Recruiter ATS)
CREATE TABLE IF NOT EXISTS public.job_applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_job_id UUID NOT NULL REFERENCES public.recruiter_jobs(id) ON DELETE CASCADE,
    seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
    cover_letter TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired')),
    recruiter_notes TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recruiter_job_id UUID REFERENCES public.recruiter_jobs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    job_url TEXT,
    description TEXT NOT NULL,
    work_format TEXT,
    location TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT false,
    ai_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Community Votes Table
CREATE TABLE IF NOT EXISTS public.community_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_upvote BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

-- 17. Community Reports Table
CREATE TABLE IF NOT EXISTS public.community_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Invites Table (Recruiter -> Seeker)
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recruiter_job_id UUID NOT NULL REFERENCES public.recruiter_jobs(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_applications_profile_id ON public.applications(profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_profile_id ON public.companies(profile_id);
CREATE INDEX IF NOT EXISTS idx_contacts_profile_id ON public.contacts(profile_id);
CREATE INDEX IF NOT EXISTS idx_cvs_profile_id ON public.cvs(profile_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_jobs_recruiter ON public.recruiter_jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_applicants_job ON public.job_applicants(recruiter_job_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invites_receiver ON public.invites(receiver_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_token_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Recruiters can view visible seekers" ON public.profiles
    FOR SELECT USING (visible_to_recruiters = true OR auth.uid() = id);

-- 2. Token Balance Policies
CREATE POLICY "Users view own token balance" ON public.ai_token_balance
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Admins can manage all token balances" ON public.ai_token_balance
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 3. Applications Policies (Seeker owns their data)
CREATE POLICY "Seekers own applications full access" ON public.applications
    FOR ALL USING (auth.uid() = profile_id);

-- 4. Companies & Contacts & CVs
CREATE POLICY "Users own companies" ON public.companies FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users own contacts" ON public.contacts FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users own cvs" ON public.cvs FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users own custom statuses" ON public.custom_statuses FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users own tags" ON public.tags FOR ALL USING (auth.uid() = profile_id);

-- 5. Application Timeline & Joins
CREATE POLICY "Timeline belongs to application owner" ON public.application_timeline
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND profile_id = auth.uid())
    );

-- 6. Recruiter Jobs (Public read for active, full access for recruiter)
CREATE POLICY "Anyone can view active recruiter jobs" ON public.recruiter_jobs
    FOR SELECT USING (status = 'active' OR auth.uid() = recruiter_id);

CREATE POLICY "Recruiters manage own jobs" ON public.recruiter_jobs
    FOR ALL USING (auth.uid() = recruiter_id);

-- 7. Job Applicants (Seeker can insert, Recruiter can view)
CREATE POLICY "Seekers can apply to jobs" ON public.job_applicants
    FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Seekers can view own job applications" ON public.job_applicants
    FOR SELECT USING (auth.uid() = seeker_id);

CREATE POLICY "Recruiters can view applicants for their jobs" ON public.job_applicants
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.recruiter_jobs WHERE id = recruiter_job_id AND recruiter_id = auth.uid())
    );

-- 8. Community Board (Public read, authenticated insert)
CREATE POLICY "Anyone can view community posts" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts" ON public.community_posts
    FOR UPDATE USING (auth.uid() = author_id);

-- 9. Community Votes
CREATE POLICY "Users can view and manage own votes" ON public.community_votes
    FOR ALL USING (auth.uid() = user_id);

-- 10. Invites
CREATE POLICY "Users can view invites they sent or received" ON public.invites
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Recruiters can send invites" ON public.invites
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update invite status" ON public.invites
    FOR UPDATE USING (auth.uid() = receiver_id);

-- ============================================================================
-- AUTH SIGNUP TRIGGER (Automatic Profile & Token Balance creation)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Member'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'seeker')
    );

    INSERT INTO public.ai_token_balance (profile_id, tokens_remaining, tokens_used)
    VALUES (NEW.id, 50, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
