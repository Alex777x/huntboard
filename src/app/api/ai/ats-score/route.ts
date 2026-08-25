import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai";
import { z } from "zod";

const ATSRequestSchema = z.object({
  cvText: z.string().min(10, "CV text is too short"),
  jobDescription: z.string().min(10, "Job description is too short"),
  provider: z.enum(["openai", "gemini", "anthropic"]).optional().default("openai"),
  apiKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ATSRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { cvText, jobDescription, provider, apiKey } = parsed.data;
    const ai = new AIService(provider, apiKey);

    const result = await ai.analyzeATS({ cvText, jobDescription });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("ATS Score API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error while evaluating ATS score" },
      { status: 500 }
    );
  }
}
