export type AIProviderName = "openai" | "gemini" | "anthropic";

export interface ATSScoreRequest {
  cvText: string;
  jobDescription: string;
}

export interface ATSScoreResponse {
  score: number; // 0-100
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  actionableSuggestions: string[];
  summary: string;
}

export interface CoverLetterRequest {
  cvText: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  tone?: "professional" | "enthusiastic" | "concise";
}

export interface CoverLetterResponse {
  coverLetter: string;
}

export const AI_TOKEN_COSTS = {
  atsScore: 5,
  coverLetter: 10,
  cvSuggestions: 8,
  moderation: 1,
} as const;
