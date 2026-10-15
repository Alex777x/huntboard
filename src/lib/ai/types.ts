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
    { id: "gpt-4o", name: "GPT-4o (Flagship Multimodal)", provider: "openai", description: "Top-tier complex reasoning, coding, and architecture", isLatest: true },
    { id: "gpt-4o-mini", name: "GPT-4o-mini (Fast & Affordable)", provider: "openai", description: "High intelligence and optimal cost/speed ratio", isLatest: true },
    { id: "o3-mini", name: "o3-mini (Algorithmic Reasoning)", provider: "openai", description: "STEM & deep reasoning model", isLatest: true },
    { id: "o1", name: "o1 (Deep Reasoning)", provider: "openai", description: "Full chain-of-thought deep reasoning" },
  ],
  gemini: [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Latest Flagship)", provider: "gemini", description: "High-capability multimodal model for fast execution and coding", isLatest: true },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Deep Context)", provider: "gemini", description: "Extended context window and deep analysis", isLatest: true },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "gemini", description: "Fast, versatile multimodal performance" },
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

const NON_TEXT_MODEL_KEYWORDS = [
  "imagen",
  "image",
  "veo",
  "video",
  "banana",
  "nano",
  "aqa",
  "embedding",
  "embed",
  "tts",
  "speech",
  "audio",
  "voice",
  "whisper",
  "transcribe",
  "transcription",
  "dall-e",
  "sora",
  "moderation",
  "realtime",
  "instruct",
  "babbage",
  "davinci",
  "curie",
  "ada",
  "canary",
  "robotics",
  "vision-only",
  "computer-use",
  "search-preview",
];

/**
 * Strict filter to exclude non-text, media, image, video, audio, TTS, embedding, and specialized models.
 */
export function isStrictTextLLM(
  id: string,
  displayName?: string,
  description?: string
): boolean {
  const text = `${id} ${displayName || ""} ${description || ""}`.toLowerCase();
  for (const word of NON_TEXT_MODEL_KEYWORDS) {
    if (text.includes(word)) {
      return false;
    }
  }
  return true;
}
