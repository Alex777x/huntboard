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
  };
  locale: "en" | "ru" | "pl";
  theme: "dark" | "light" | "system";
  visible_to_recruiters: boolean;
  company_name: string | null;
  company_email: string | null;
  is_verified_recruiter: boolean;
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
