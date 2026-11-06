export type UserRole = "seeker" | "recruiter" | "admin";

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "no_response"
  | "custom";

export type WorkFormat = "remote" | "hybrid" | "onsite";

export type ApplicationSource =
  | "linkedin"
  | "indeed"
  | "referral"
  | "company_site"
  | "community"
  | "platform"
  | "other";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email?: string | null;
  avatar_url: string | null;
  current_role: string | null;
  desired_role: string | null;
  location: string | null;
  open_to_relocation: boolean;
  skills: Array<{ name: string; level?: string }>;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  ai_settings: {
    provider?: "openai" | "gemini" | "anthropic";
    model?: string;
    encrypted_key?: string;
    encrypted_keys?: Record<string, string>;
  };
  locale: "en" | "ru" | "pl";
  theme: "dark" | "light" | "system";
  visible_to_recruiters: boolean;
  company_name: string | null;
  company_email: string | null;
  is_verified_recruiter: boolean;
  verified?: boolean;
  telegram_bot_token?: string | null;
  telegram_chat_id?: string | null;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export interface AITokenBalance {
  id: string;
  profile_id: string;
  tokens_remaining: number;
  tokens_used: number;
  uses_own_key: boolean;
  last_topped_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  profile_id: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  notes: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  profile_id: string;
  company_id: string | null;
  company_name: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CV {
  id: string;
  profile_id: string;
  name: string;
  file_url: string | null;
  file_type: "pdf" | "docx" | null;
  content_text: string | null;
  structured_data: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  profile_id: string;
  company_id: string | null;
  company_name: string | null;
  cv_id: string | null;
  recruiter_job_id: string | null;
  job_title: string;
  job_url: string | null;
  job_description: string | null;
  status: ApplicationStatus;
  custom_status_id: string | null;
  source: ApplicationSource;
  work_format: WorkFormat;
  job_location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  priority: number;
  notes: string | null;
  recruiter_notes?: string | null;
  cover_letter: string | null;
  applied_at: string | null;
  next_interview_at: string | null;
  deadline_at: string | null;
  ats_score: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    suggestions: string[];
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  recruiter_job_id: string | null;
  title: string;
  company_name: string;
  job_url: string | null;
  description: string;
  work_format: WorkFormat | null;
  location: string | null;
  tags: string[];
  upvotes: number;
  downvotes: number;
  is_flagged: boolean;
  ai_verified: boolean;
  created_at: string;
}

export interface RecruiterJob {
  id: string;
  recruiter_id: string;
  title: string;
  company_name: string;
  department?: string;
  work_format: WorkFormat;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency?: string;
  description: string;
  requirements: string;
  status: "active" | "paused" | "closed";
  published_to_community: boolean;
  applicants_count: number;
  view_count: number;
  created_at: string;
}


export interface Event {
  id: string;
  profile_id: string;
  title: string;
  company_name: string | null;
  event_type: string | null;
  event_date: string;
  time_range: string | null;
  interviewers: string | null;
  video_link: string | null;
  location: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface FeedbackTicket {
  id: string;
  profile_id: string;
  ticket_type: string;
  type?: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  severity?: string;
  user_email?: string | null;
  user_name?: string | null;
  admin_notes?: string | null;
  upvotes?: number;
  created_at: string;
}

export interface Invite {
  id: string;
  sender_id: string;
  receiver_id: string;
  recruiter_job_id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  responded_at?: string | null;
}

export interface RecruiterVerification {
  id: string;
  profile_id: string;
  company_name: string;
  work_email: string;
  code: string;
  attempts?: number;
  expires_at: string;
  verified_at?: string | null;
  created_at: string;
}
