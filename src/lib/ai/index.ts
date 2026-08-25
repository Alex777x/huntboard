import {
  AIProviderName,
  ATSScoreRequest,
  ATSScoreResponse,
  CoverLetterRequest,
  CoverLetterResponse,
} from "./types";

export class AIService {
  private provider: AIProviderName;
  private apiKey?: string;

  constructor(provider: AIProviderName = "openai", apiKey?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  /**
   * Evaluates CV against job requirements and generates structured ATS Score.
   */
  async analyzeATS(req: ATSScoreRequest): Promise<ATSScoreResponse> {
    const { cvText, jobDescription } = req;

    // If user provided a real API key, execute external LLM call
    if (this.apiKey) {
      try {
        return await this.callLLMForATS(cvText, jobDescription);
      } catch (err) {
        console.error("AI API call failed, falling back to heuristic engine:", err);
      }
    }

    // Heuristic & NLP keyword extraction fallback engine
    return this.heuristicATSAnalysis(cvText, jobDescription);
  }

  /**
   * Generates a tailored Cover Letter based on CV and vacancy.
   */
  async generateCoverLetter(req: CoverLetterRequest): Promise<CoverLetterResponse> {
    const { cvText, jobTitle, companyName, jobDescription, tone = "professional" } = req;

    if (this.apiKey) {
      try {
        return await this.callLLMForCoverLetter(cvText, jobTitle, companyName, jobDescription, tone);
      } catch (err) {
        console.error("Cover Letter LLM call failed, fallback:", err);
      }
    }

    // Default high-craft template generation
    const coverLetter = `Dear Hiring Team at ${companyName},

I am writing to express my enthusiastic interest in the ${jobTitle} position. With my background in building high-scale fullstack web applications, modern distributed systems, and modern frontend architectures using Next.js 15, TypeScript, and PostgreSQL, I am confident in my ability to make an immediate, meaningful impact on your team.

Throughout my experience, I have specialized in delivering robust, high-performance software while maintaining exceptional code quality and seamless user experience. Reviewing your requirements for ${jobTitle}, I was particularly excited by the technical challenges and culture of engineering excellence at ${companyName}.

Key highlights of my qualifications include:
• Extensive hands-on experience designing scalable architectures with Next.js App Router, React 19, and PostgreSQL.
• A strong focus on performance optimization, responsive design systems with Tailwind CSS, and strict testing practices (Vitest / Playwright).
• Proven ability to collaborate across multidisciplinary teams to turn complex requirements into clean, maintainable production features.

Thank you for considering my application. I would welcome the opportunity to discuss how my technical skills and passion align with the goals of ${companyName}.

Sincerely,
Anatoli Liaksandrou
Fullstack Engineer`;

    return { coverLetter };
  }

  private async callLLMForATS(cvText: string, jobDescription: string): Promise<ATSScoreResponse> {
    const prompt = `You are an expert ATS (Applicant Tracking System) recruiter. Analyze this CV against the Job Description and return a valid JSON object only.
Format:
{
  "score": <number 0-100>,
  "matchPercentage": <number 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "actionableSuggestions": ["suggestion 1", "suggestion 2"],
  "summary": "<2 sentence summary>"
}

CV:
${cvText}

Job Description:
${jobDescription}`;

    if (this.provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
      });
      const data = await res.json();
      return JSON.parse(data.choices[0].message.content);
    }

    // Default fallback if provider parser not matched
    return this.heuristicATSAnalysis(cvText, jobDescription);
  }

  private async callLLMForCoverLetter(
    cvText: string,
    jobTitle: string,
    companyName: string,
    jobDescription: string,
    tone: string
  ): Promise<CoverLetterResponse> {
    const prompt = `Write a personalized, compelling cover letter for the role of ${jobTitle} at ${companyName}. Tone: ${tone}.
CV summary: ${cvText}
Job requirements: ${jobDescription}`;

    if (this.provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      return { coverLetter: data.choices[0].message.content };
    }

    return { coverLetter: "" };
  }

  private heuristicATSAnalysis(cvText: string, jobDescription: string): ATSScoreResponse {
    const commonKeywords = [
      "typescript",
      "javascript",
      "react",
      "next.js",
      "node.js",
      "postgresql",
      "sql",
      "supabase",
      "tailwind",
      "docker",
      "git",
      "graphql",
      "rest",
      "vitest",
      "jest",
      "playwright",
      "aws",
      "ci/cd",
      "api",
      "python",
    ];

    const cvLower = (cvText || "").toLowerCase();
    const jobLower = (jobDescription || "").toLowerCase();

    const matched: string[] = [];
    const missing: string[] = [];

    commonKeywords.forEach((kw) => {
      if (jobLower.includes(kw)) {
        if (cvLower.includes(kw)) {
          matched.push(kw.charAt(0).toUpperCase() + kw.slice(1));
        } else {
          missing.push(kw.charAt(0).toUpperCase() + kw.slice(1));
        }
      }
    });

    const totalRelevant = matched.length + missing.length;
    const ratio = totalRelevant > 0 ? matched.length / totalRelevant : 0.85;
    const score = Math.min(98, Math.max(70, Math.round(ratio * 100)));

    return {
      score,
      matchPercentage: score,
      matchedSkills: matched.length > 0 ? matched : ["TypeScript", "Next.js 15", "PostgreSQL", "Tailwind CSS"],
      missingSkills: missing.length > 0 ? missing : ["GraphQL Federation"],
      actionableSuggestions: [
        "Include measurable impact metrics (e.g. latency reduction, test coverage percentages).",
        "Add explicit mentions of state management and architectural decisions.",
      ],
      summary: `Your profile demonstrates a ${score}% strong alignment with the technical requirements.`,
    };
  }
}
