import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

const ATSRequestSchema = z.object({
  cvText: z.string().min(10, "CV text is too short").max(50000, "CV text exceeds limit (max 50,000 chars)"),
  jobDescription: z.string().min(10, "Job description is too short").max(50000, "Job description exceeds limit (max 50,000 chars)"),
  provider: z.enum(["openai", "gemini", "anthropic"]).optional().default("openai"),
  apiKey: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    let user: { id: string } | null = null;
    // Authenticate user unconditionally when Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data: authData } = await supabase.auth.getUser();
      user = authData?.user || null;
      if (!user) {
        return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
      }
    }

    // Rate limit: max 20 requests per minute per user or IP
    const clientIp = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "ats-client";
    const rateLimitKey = user?.id ? `ats:user:${user.id}` : `ats:ip:${clientIp}`;
    const rl = checkRateLimit(rateLimitKey, { max: 20, windowMs: 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many ATS analysis requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

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
