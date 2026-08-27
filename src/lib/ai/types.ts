export type AIProviderName = "openai" | "gemini" | "anthropic";

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProviderName;
  description?: string;
  isLatest?: boolean;
}

export const LATEST_CURATED_MODELS: Record<AIProviderName, AIModelOption[]> = {
  openai: [
    { id: "gpt-5.6-sol", name: "GPT-5.6 Sol (Flagship Frontier)", provider: "openai", description: "Top-tier complex reasoning, coding, and architecture", isLatest: true },
    { id: "gpt-5.6-terra", name: "GPT-5.6 Terra (Balanced)", provider: "openai", description: "High intelligence and optimal cost/speed ratio", isLatest: true },
    { id: "gpt-5.6-luna", name: "GPT-5.6 Luna (Fast)", provider: "openai", description: "Ultra-fast low-latency text transformations", isLatest: true },
    { id: "gpt-4o", name: "GPT-4o (Standard Omnimodel)", provider: "openai", description: "Standard multimodal model for reasoning & coding" },
    { id: "gpt-4o-mini", name: "GPT-4o-mini", provider: "openai", description: "Lightweight fast model" },
    { id: "o3-mini", name: "o3-mini", provider: "openai", description: "STEM & algorithmic reasoning model" },
    { id: "o1", name: "o1 (Deep Reasoning)", provider: "openai", description: "Full chain-of-thought deep reasoning" },
  ],
  gemini: [
    { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash (Latest Flagship)", provider: "gemini", description: "High-capability multimodal model for agentic execution and coding", isLatest: true },
    { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro (Deep Reasoning)", provider: "gemini", description: "Flagship model for deep reasoning and complex prompts", isLatest: true },
    { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite", provider: "gemini", description: "High-volume, low-latency fast execution", isLatest: true },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "gemini", description: "Multimodal standard model" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "gemini", description: "Extended context window (2M tokens)" },
  ],
  anthropic: [
    { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (Hybrid Reasoning)", provider: "anthropic", description: "Frontier hybrid reasoning and elite coding writing", isLatest: true },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "anthropic", description: "Standard high-performance model for enterprise tasks" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", provider: "anthropic", description: "Ultra-fast response for immediate text transformations" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus", provider: "anthropic", description: "Deep nuanced analysis for executive CVs" },
  ],
};

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

export interface InterviewPrepQuestion {
  question: string;
  category: "technical" | "behavioral" | "system-design";
  suggestedTalkingPoints: string[];
}

export interface InterviewPrepResponse {
  questions: InterviewPrepQuestion[];
  overview: string;
}

export const AI_TOKEN_COSTS = {
  atsScore: 5,
  coverLetter: 10,
  cvSuggestions: 8,
  interviewPrep: 8,
  moderation: 1,
} as const;
