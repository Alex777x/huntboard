import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai";
import { z } from "zod";

const CoverLetterRequestSchema = z.object({
  cvText: z.string().min(10, "CV text is too short"),
  jobTitle: z.string().min(2, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  jobDescription: z.string().min(10, "Job description is required"),
  tone: z.enum(["professional", "enthusiastic", "concise"]).optional().default("professional"),
  provider: z.enum(["openai", "gemini", "anthropic"]).optional().default("openai"),
  apiKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CoverLetterRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { cvText, jobTitle, companyName, jobDescription, tone, provider, apiKey } = parsed.data;
    const ai = new AIService(provider, apiKey);

    const result = await ai.generateCoverLetter({
      cvText,
      jobTitle,
      companyName,
      jobDescription,
      tone,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Cover Letter API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error while generating Cover Letter" },
      { status: 500 }
    );
  }
}
