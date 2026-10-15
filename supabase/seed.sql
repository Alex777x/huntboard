-- HuntBoard Database Seed
-- User Profile
INSERT INTO profiles (id, full_name, email, role, current_role, desired_role, location, open_to_relocation, visible_to_recruiters, is_verified_recruiter, verified, skills) VALUES
('00000000-0000-0000-0000-000000000001', 'Anatoli Aliaksandrou', 'alexandroff103@gmail.com', 'seeker', 'Senior Fullstack Engineer', 'Staff / Lead Engineer', 'Warsaw, Poland', true, true, false, false, '[{"name": "Next.js 15", "level": "Expert"}, {"name": "TypeScript", "level": "Expert"}, {"name": "PostgreSQL & Supabase", "level": "Senior"}, {"name": "Tailwind CSS v4", "level": "Senior"}]'::jsonb),
('00000000-0000-0000-0000-000000000002', 'Elena Rostova', 'elena.rostova@example.com', 'seeker', 'Frontend Architect', 'Principal UI Engineer', 'Berlin, Germany / Remote', true, true, false, false, '[{"name": "React 19", "level": "Expert"}, {"name": "TypeScript", "level": "Expert"}, {"name": "Design Systems", "level": "Expert"}, {"name": "Next.js", "level": "Senior"}]'::jsonb),
('00000000-0000-0000-0000-000000000003', 'Marcus Vance', 'marcus.vance@example.com', 'seeker', 'Senior Systems Engineer', 'Staff Infrastructure Engineer', 'London, UK / Remote', true, true, false, false, '[{"name": "PostgreSQL & SQL Optimization", "level": "Expert"}, {"name": "Kafka & Streams", "level": "Expert"}, {"name": "Docker & K8s", "level": "Senior"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, skills = EXCLUDED.skills, visible_to_recruiters = EXCLUDED.visible_to_recruiters;

-- Companies
INSERT INTO companies (
  id, profile_id, name, website, industry, size, location, notes, logo_url, created_at, updated_at
) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Stripe', 'https://stripe.com', 'Fintech & Payments', 'Enterprise (7,000+)', 'San Francisco / Remote', 'Engineering culture focuses on high API reliability and written communication.', NULL, '2026-08-20T10:00:00Z', '2026-08-20T10:00:00Z'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Vercel', 'https://vercel.com', 'Developer Tools & Cloud', 'Mid-size (500+)', 'Remote (Global)', 'Creators of Next.js and Turbopack. Fast interview turnaround.', NULL, '2026-08-22T10:00:00Z', '2026-08-22T10:00:00Z'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Linear', 'https://linear.app', 'Productivity Software', 'Startup (80+)', 'Remote', 'Heavy emphasis on product craft, UI responsiveness, and sync engines.', NULL, '2026-08-15T10:00:00Z', '2026-08-15T10:00:00Z'),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Spotify', 'https://spotify.com', 'Audio Streaming', 'Enterprise (9,000+)', 'Stockholm / Hybrid', 'Platform engineering teams use microfrontends and internal developer portals.', NULL, '2026-08-18T10:00:00Z', '2026-08-18T10:00:00Z');

-- Applications
INSERT INTO applications (
  id, profile_id, company_id, company_name, cv_id, recruiter_job_id, job_title, job_url, 
  job_description, status, custom_status_id, source, work_format, job_location, 
  salary_min, salary_max, salary_currency, priority, notes, cover_letter, 
  applied_at, next_interview_at, deadline_at, ats_score, created_at, updated_at
) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Stripe', NULL, NULL, 'Senior Fullstack Engineer', 'https://stripe.com/jobs', 'Core Payments platform engineering.', 'interview', NULL, 'linkedin', 'remote', 'Remote (EU)', 140000, 170000, 'USD', 5, 'Passed coding interview. System design scheduled for tomorrow.', NULL, '2026-08-20', '2026-08-27T14:00:00Z', NULL, '{"score": 92, "matched_skills": ["Next.js", "TypeScript", "Postgres"], "missing_skills": ["Ruby"], "suggestions": ["Add high-throughput API metrics"]}', '2026-08-20T10:00:00Z', '2026-08-24T10:00:00Z'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Vercel', NULL, NULL, 'Frontend Systems Engineer', 'https://vercel.com/careers', 'App Router & Turbopack Core team.', 'phone_screen', NULL, 'referral', 'remote', 'Remote', 150000, 180000, 'USD', 5, 'Warm intro from David Chen. HR screen was very positive.', NULL, '2026-08-22', '2026-08-29T16:30:00Z', NULL, '{"score": 88, "matched_skills": ["React 19", "Next.js", "Tailwind"], "missing_skills": ["Rust"], "suggestions": ["Highlight Turbopack benchmark work"]}', '2026-08-22T10:00:00Z', '2026-08-22T10:00:00Z'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'Spotify', NULL, NULL, 'Staff Web Platform Engineer', 'https://spotify.com/jobs', 'Web SDK and creator tools.', 'applied', NULL, 'linkedin', 'hybrid', 'Stockholm', 110000, 130000, 'EUR', 4, 'Applied with tailored Frontend CV.', NULL, '2026-08-20', NULL, NULL, '{"score": 85, "matched_skills": ["TypeScript", "Audio Web APIs"], "missing_skills": ["Java"], "suggestions": ["Tailor experience to platform SDKs"]}', '2026-08-20T10:00:00Z', '2026-08-20T10:00:00Z'),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Linear', NULL, NULL, 'Product Engineer', 'https://linear.app/careers', 'Fast keyboard-first issue tracker.', 'offer', NULL, 'community', 'remote', 'Remote', 160000, 190000, 'USD', 5, 'Offer received! Negotiating equity and remote equipment budget.', NULL, '2026-08-10', NULL, '2026-09-05', '{"score": 96, "matched_skills": ["React", "TypeScript", "Sync Engines", "Tailwind"], "missing_skills": [], "suggestions": []}', '2026-08-10T10:00:00Z', '2026-08-25T10:00:00Z'),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', NULL, 'OpenAI', NULL, NULL, 'Fullstack Platform Engineer', 'https://openai.com/careers', 'Developer platform & API playground.', 'wishlist', NULL, 'company_site', 'remote', 'San Francisco / Remote', 200000, 250000, 'USD', 5, 'Preparing CV before submitting.', NULL, NULL, NULL, NULL, '{"score": 91, "matched_skills": ["Python", "TypeScript", "Next.js", "LLM"], "missing_skills": [], "suggestions": ["Run ATS Benchmark on CV"]}', '2026-08-25T10:00:00Z', '2026-08-25T10:00:00Z');

-- Contacts
INSERT INTO contacts (
  id, profile_id, name, role, company_id, company_name, email, phone, linkedin_url, notes, created_at, updated_at
) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Jessica Miller', 'Senior Tech Recruiter', '20000000-0000-0000-0000-000000000001', 'Stripe', 'jmiller@stripe.com', '+1 (415) 555-0199', 'https://linkedin.com/in/example', 'Initial phone screen contact. Very responsive to follow-up emails.', '2026-08-20T10:00:00Z', '2026-08-20T10:00:00Z'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'David Chen', 'Engineering Manager (Next.js Team)', '20000000-0000-0000-0000-000000000002', 'Vercel', 'dchen@vercel.com', NULL, 'https://linkedin.com/in/example', 'Interviewer for System Design stage. Focuses on SSR caching & Edge Runtime.', '2026-08-22T10:00:00Z', '2026-08-22T10:00:00Z'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Karolina Wisniewska', 'Talent Acquisition Partner', '20000000-0000-0000-0000-000000000004', 'Spotify', 'kwisniewska@spotify.com', NULL, 'https://linkedin.com/in/example', 'Coordinates technical panels and interview scheduling.', '2026-08-18T10:00:00Z', '2026-08-18T10:00:00Z');

-- Events
INSERT INTO events (
  id, profile_id, title, company_name, event_type, event_date, time_range, video_link, interviewers, notes, status
) VALUES
('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'System Design & Architecture Panel', 'Stripe', 'System Design', '2026-08-30', '16:00 - 17:00 (CET)', 'https://meet.google.com/abc-defg-hij', 'Jessica Miller & David Chen', 'Focus on high-concurrency payment ledger database schema and edge caching.', 'confirmed'),
('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Vercel Technical Deep-Dive', 'Vercel', 'Technical Interview', '2026-09-02', '17:30 - 18:30 (CET)', 'https://zoom.us/j/12345678', 'Sarah Jenkins (Staff Engineer)', 'Deep dive into React 19 Server Components and Turbopack bundler internals.', 'confirmed'),
('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Follow-up on Spotify Application', 'Spotify', 'Follow-up Reminder', '2026-09-01', '10:00 (CET)', NULL, 'Karolina Wisniewska', 'Applied 6 days ago. Send friendly LinkedIn message checking on status.', 'pending'),
('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Linear Offer Sign-off Deadline', 'Linear', 'Offer Deadline', '2026-09-05', '23:59 (CET)', NULL, 'Karri Saarinen', 'Review final equity grants and remote workspace setup allowance.', 'pending');

-- Recruiter Jobs
INSERT INTO recruiter_jobs (
  id, recruiter_id, title, company_name, description, requirements, work_format, location, salary_min, salary_max, salary_currency, status, view_count, published_to_community, applicants_count, created_at
) VALUES
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Senior Fullstack Engineer (Payments)', 'Stripe', 'Core billing & payment infrastructure engineering team.', '• 5+ years with React, Next.js, Node.js\n• Experience with high-availability systems', 'remote', 'Remote (EU / US)', 150000, 185000, 'USD', 'active', 482, true, 14, '2026-08-20T10:00:00Z'),
('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Frontend Architect (Design Systems)', 'Stripe', 'Building scalable UI primitives and accessibility standards.', '• Deep TypeScript, Tailwind CSS, Radix UI mastery\n• Performance optimization', 'remote', 'Remote', 160000, 195000, 'USD', 'active', 319, true, 8, '2026-08-22T10:00:00Z'),
('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Staff Backend Engineer (Postgres & Data)', 'Stripe', 'Distributed ledger & transaction processing.', '• PostgreSQL query optimization, connection pooling\n• Distributed databases', 'hybrid', 'San Francisco, CA', 190000, 230000, 'USD', 'active', 245, false, 5, '2026-08-24T10:00:00Z');

-- Invites
INSERT INTO invites (
  id, sender_id, receiver_id, recruiter_job_id, message, status, created_at
) VALUES
('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Hi! We noticed your profile and open-to-relocation status on HuntBoard. Would you be open to an initial technical screen this week?', 'pending', '2026-08-25T10:00:00Z'),
('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'Hello, our Design Systems core team is expanding. We saw your CV and would love to invite you for a conversation with the team.', 'accepted', '2026-08-22T10:00:00Z');

-- Feedback Tickets
INSERT INTO feedback_tickets (
  id, profile_id, ticket_type, title, description, priority, status, created_at, upvotes, admin_notes
) VALUES
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'feature', 'Phase 4: LinkedIn Chrome Extension (Manifest V3)', '1-Click capture of job postings from LinkedIn, Indeed, and Glassdoor directly into the Kanban pipeline.', 'high', 'resolved', '2026-09-06T10:00:00Z', 42, 'Implemented with Manifest V3 and In-App URL Parser.'),
('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'feature', 'Phase 4: Google Calendar 1-Click Sync & .ICS Export', 'Export interview rounds directly to Google Calendar and download universal .ICS calendar files.', 'high', 'resolved', '2026-09-06T10:00:00Z', 38, 'Live on /calendar with single & batch .ICS export.'),
('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'feature', 'Phase 4: Telegram Instant Alerts for Recruiter Invites', 'Receive instant notifications in Telegram whenever a verified employer sends a direct interview invitation.', 'high', 'resolved', '2026-09-06T10:00:00Z', 35, 'Live in Settings -> Integrations with Bot API test runner.'),
('70000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'feature', 'Support for custom color tags on Kanban cards', 'It would be great to define custom color codes for tags like ''High Priority'', ''Referral'', or ''Remote EU''.', 'medium', 'open', '2026-08-24T10:00:00Z', 18, 'Scheduled for release in next minor update.'),
('70000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'bug', 'ATS Scorer score bar layout on narrow mobile screens', 'On mobile screen sizes under 360px, the match percentage badge wraps awkwardly.', 'low', 'resolved', '2026-08-22T10:00:00Z', 4, 'Fixed in CSS media queries.');

-- Community Posts
INSERT INTO community_posts (
  id, author_id, company_name, title, job_url, work_format, location, description, tags, upvotes, downvotes, is_flagged, ai_verified, created_at
) VALUES
('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Stripe', 'Senior Fullstack Engineer (Billing & Payments)', 'https://stripe.com/jobs', 'remote', 'Remote (EU / US Timezones)', 'We''re hiring a Senior Fullstack Engineer to lead our billing UI and ledger microservices. Great culture, deep written asynchronous work, and top-tier compensation ($150k-$185k).', '["Next.js 15", "TypeScript", "PostgreSQL", "Tailwind CSS"]'::jsonb, 42, 1, false, true, '2026-09-06T11:20:40Z'),
('80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Linear', 'Product Engineer (Sync Engine & Web)', 'https://linear.app/careers', 'remote', 'Remote (Worldwide)', 'Linear is looking for product engineers who obsess over 60fps UI responsiveness, local-first SQLite sync, and high craftsmanship.', '["React 19", "TypeScript", "Local-first", "Tailwind"]'::jsonb, 68, 0, false, false, '2026-09-06T08:20:40Z'),
('80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Supabase', 'Database Platform Engineer', 'https://supabase.com/careers', 'remote', 'Remote', 'Work on open-source PostgreSQL extensions, realtime replication, and edge functions. Fully distributed team.', '["PostgreSQL", "Go", "Docker", "Supabase"]'::jsonb, 35, 2, false, true, '2026-09-05T13:20:40Z'),
('80000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Vercel', 'Developer Experience Engineer', 'https://vercel.com/careers', 'remote', 'Remote', 'Help thousands of developers ship faster with Next.js 15, Turbopack, and AI SDK integrations.', '["Next.js", "AI SDK", "TypeScript"]'::jsonb, 29, 1, false, false, '2026-09-04T13:20:40Z');
