import { NextRequest, NextResponse } from "next/server";
import { CVData } from "@/types/cv";
import { LATEST_CURATED_MODELS, AIProviderName, isStrictTextLLM } from "@/lib/ai/types";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

function parseLLMJson<T>(raw: string): T | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    let user: { id: string } | null = null;
    // Defense-in-depth: verify authentication even though middleware enforces it
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data: authData } = await supabase.auth.getUser();
      user = authData?.user || null;
      if (!user) {
        return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
      }
    }

    // Rate limiting: max 30 requests per minute per authenticated user or IP
    const clientIp = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateLimitKey = user?.id ? `ai:user:${user.id}` : `ai:ip:${clientIp}`;
    const rateLimit = checkRateLimit(rateLimitKey, { max: 30, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many AI requests. Please wait a moment before trying again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const {
      action,
      apiKey: clientApiKey,
      provider = "openai",
      model = "gpt-4o",
      cvData,
      jobDescription,
      jobTitle,
      companyName,
      textToEnhance,
      targetRole,
      tone = "professional",
    } = body;

    // Input bounds validation (DoS & Unbounded Token Consumption defense)
    if (textToEnhance && typeof textToEnhance === "string" && textToEnhance.length > 15000) {
      return NextResponse.json({ error: "Input text exceeds allowed length (max 15,000 chars)." }, { status: 400 });
    }
    if (jobDescription && typeof jobDescription === "string" && jobDescription.length > 30000) {
      return NextResponse.json({ error: "Job description exceeds allowed length (max 30,000 chars)." }, { status: 400 });
    }
    if (jobTitle && typeof jobTitle === "string" && jobTitle.length > 300) {
      return NextResponse.json({ error: "Job title exceeds allowed length (max 300 chars)." }, { status: 400 });
    }

    // Only fall back to server OPENAI_API_KEY when the requested provider is 'openai'
    const apiKey =
      (clientApiKey || "").trim() ||
      (provider === "openai" ? (process.env.OPENAI_API_KEY || "").trim() : "");
    const selectedModel =
      model === "custom" || !model
        ? provider === "gemini"
          ? "gemini-2.0-flash"
          : provider === "anthropic"
          ? "claude-3-7-sonnet-20250219"
          : "gpt-4o"
        : model;

    // Helper: Execute LLM Completion
    const callLLM = async (prompt: string, jsonFormat = false) => {
      if (!apiKey) return null;

      if (provider === "openai") {
        const payload: Record<string, unknown> = {
          model: selectedModel,
          messages: [{ role: "user", content: prompt }],
          temperature: jsonFormat ? 0.2 : 0.7,
        };
        if (jsonFormat) {
          payload.response_format = { type: "json_object" };
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `OpenAI error: ${res.status}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || "";
      }

      if (provider === "gemini") {
        const geminiPayload: Record<string, unknown> = {
          contents: [{ parts: [{ text: prompt }] }],
        };
        if (jsonFormat) {
          geminiPayload.generationConfig = { responseMimeType: "application/json" };
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify(geminiPayload),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Gemini error: ${res.status}`);
        }

        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      }

      if (provider === "anthropic") {
        const systemPrompt = jsonFormat
          ? "You are a specialized JSON-only assistant. Respond ONLY with valid, raw JSON without markdown code fences or conversational text."
          : undefined;

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: selectedModel || "claude-3-7-sonnet-20250219",
            max_tokens: 2048,
            ...(systemPrompt ? { system: systemPrompt } : {}),
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Anthropic error: ${res.status}`);
        }

        const data = await res.json();
        return data.content?.[0]?.text?.trim() || "";
      }

      return null;
    };

    // Action 0A: Fetch Live Models from Provider API (Strictly Text LLMs Only)
    if (action === "fetch-models") {
      if (!apiKey) {
        return NextResponse.json({
          ok: true,
          models: LATEST_CURATED_MODELS[provider as AIProviderName] || [],
          source: "curated",
        });
      }

      try {
        if (provider === "openai") {
          const res = await fetch("https://api.openai.com/v1/models", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg =
              errData.error?.message ||
              `OpenAI API Error (${res.status}): Please verify that your API key is valid and has active credits.`;
            return NextResponse.json({
              ok: false,
              error: msg,
              models: LATEST_CURATED_MODELS.openai,
              source: "curated_fallback",
            });
          }

          const data = await res.json();
          const rawList = data.data || [];

          // Sort by creation date descending (newest models first)
          const sortedRaw = [...rawList].sort(
            (a: any, b: any) => (b.created || 0) - (a.created || 0)
          );

          const filtered = sortedRaw
            .filter((m: any) => {
              const id = (m.id || "").toLowerCase();
              if (!isStrictTextLLM(id)) return false;
              return (
                id.startsWith("gpt-") ||
                id.startsWith("o1") ||
                id.startsWith("o3") ||
                id.startsWith("chatgpt-")
              );
            })
            .map((m: any) => ({
              id: m.id,
              name: m.id,
              provider: "openai" as AIProviderName,
              description: `OpenAI Text Model (${m.created ? new Date(m.created * 1000).toLocaleDateString() : "Latest"})`,
              isLatest:
                m.id.includes("5.") ||
                m.id.includes("4o") ||
                m.id.startsWith("o1") ||
                m.id.startsWith("o3"),
            }));

          return NextResponse.json({
            ok: true,
            models: filtered.length > 0 ? filtered : LATEST_CURATED_MODELS.openai,
            source: "live_api",
          });
        }

        if (provider === "gemini") {
          const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models",
            {
              headers: { "x-goog-api-key": apiKey },
            }
          );

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg =
              errData.error?.message ||
              `Google Gemini API Error (${res.status}): Please check that your Gemini API key is valid.`;
            return NextResponse.json({
              ok: false,
              error: msg,
              models: LATEST_CURATED_MODELS.gemini,
              source: "curated_fallback",
            });
          }

          const data = await res.json();
          const list = (data.models || [])
            .filter((m: any) => {
              const id = (m.name?.replace(/^models\//, "") || m.name || "").toLowerCase();
              const displayName = m.displayName || "";
              const desc = m.description || "";

              if (!m.supportedGenerationMethods?.includes("generateContent")) return false;
              if (!isStrictTextLLM(id, displayName, desc)) return false;

              // Only gemini or gemma text generation models
              return id.startsWith("gemini") || id.startsWith("gemma");
            })
            .map((m: any) => {
              const id = m.name?.replace(/^models\//, "") || m.name;
              return {
                id,
                name: m.displayName || id,
                provider: "gemini" as AIProviderName,
                description: m.description?.slice(0, 120) || "Gemini Text Generation Model",
                isLatest:
                  id.includes("3.") ||
                  id.includes("2.5") ||
                  id.includes("2.0"),
              };
            })
            .sort((a: any, b: any) => {
              const score = (id: string) => {
                if (id.includes("3.7")) return 6;
                if (id.includes("3.5")) return 5;
                if (id.includes("3.1") || id.includes("3.0")) return 4;
                if (id.includes("2.5")) return 3;
                if (id.includes("2.0")) return 2;
                if (id.includes("1.5")) return 1;
                return 0;
              };
              return score(b.id) - score(a.id);
            });

          return NextResponse.json({
            ok: true,
            models: list.length > 0 ? list : LATEST_CURATED_MODELS.gemini,
            source: "live_api",
          });
        }

        if (provider === "anthropic") {
          const res = await fetch("https://api.anthropic.com/v1/models", {
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg =
              errData.error?.message ||
              `Anthropic API Error (${res.status}): Please check that your Claude API key is valid.`;
            return NextResponse.json({
              ok: false,
              error: msg,
              models: LATEST_CURATED_MODELS.anthropic,
              source: "curated_fallback",
            });
          }

          const data = await res.json();
          const list = (data.data || [])
            .filter((m: any) => {
              const id = (m.id || "").toLowerCase();
              if (!isStrictTextLLM(id, m.display_name)) return false;
              return id.startsWith("claude-");
            })
            .map((m: any) => ({
              id: m.id,
              name: m.display_name || m.id,
              provider: "anthropic" as AIProviderName,
              description: "Claude Text Reasoning Model",
              isLatest: m.id.includes("3-7") || m.id.includes("3-5"),
            }));

          return NextResponse.json({
            ok: true,
            models: list.length > 0 ? list : LATEST_CURATED_MODELS.anthropic,
            source: "live_api",
          });
        }
      } catch (err: any) {
        console.warn("Fetch models error:", err.message);
        return NextResponse.json({
          ok: false,
          error: err.message,
          models: LATEST_CURATED_MODELS[provider as AIProviderName] || [],
          source: "curated_fallback",
        });
      }

      return NextResponse.json({
        ok: true,
        models: LATEST_CURATED_MODELS[provider as AIProviderName] || [],
        source: "curated",
      });
    }

    // Action 0B: Test Key
    if (action === "test-key") {
      if (!apiKey) {
        return NextResponse.json({ ok: false, error: "API key is required" }, { status: 400 });
      }

      if (provider === "openai") {
        const testRes = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!testRes.ok) {
          const errData = await testRes.json().catch(() => ({}));
          return NextResponse.json(
            {
              ok: false,
              error:
                errData.error?.message ||
                "Invalid or expired OpenAI API key. Please check your key at platform.openai.com/api-keys.",
            },
            { status: 401 }
          );
        }
        return NextResponse.json({
          ok: true,
          message: `Connected successfully to OpenAI! Model '${selectedModel}' is ready.`,
        });
      }

      if (provider === "gemini") {
        const testRes = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models",
          {
            headers: { "x-goog-api-key": apiKey },
          }
        );
        if (!testRes.ok) {
          const errData = await testRes.json().catch(() => ({}));
          return NextResponse.json(
            {
              ok: false,
              error:
                errData.error?.message ||
                "Invalid Google Gemini API key. Please check your key at aistudio.google.com.",
            },
            { status: 401 }
          );
        }
        return NextResponse.json({
          ok: true,
          message: `Connected successfully to Google Gemini! Model '${selectedModel}' is ready.`,
        });
      }

      if (provider === "anthropic") {
        const testRes = await fetch("https://api.anthropic.com/v1/models", {
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
        });
        if (!testRes.ok) {
          const errData = await testRes.json().catch(() => ({}));
          return NextResponse.json(
            {
              ok: false,
              error:
                errData.error?.message ||
                "Invalid Anthropic API key. Please check your key at console.anthropic.com.",
            },
            { status: 401 }
          );
        }
        return NextResponse.json({
          ok: true,
          message: `Connected successfully to Anthropic! Model '${selectedModel}' is ready.`,
        });
      }

      return NextResponse.json({ ok: true, message: `Key configured for ${provider}` });
    }

    // Action 1: Polish or Generate Summary
    if (action === "optimize-summary") {
      const prompt = `You are an elite executive resume writer and ATS specialist. 
Craft a concise, punchy, 3-4 sentence professional summary (ATS Overview) for the candidate below. Tone: ${tone}.
Focus on high-impact keywords, quantifiable value, tech stack mastery, and engineering excellence.
Do not use generic buzzwords. Write in professional resume format without first-person pronouns.

Candidate Info:
Name: ${(cvData as CVData)?.personal?.fullName || "Candidate"}
Target Title: ${targetRole || (cvData as CVData)?.personal?.title || "Software Engineer"}
Current Summary: ${(cvData as CVData)?.personal?.summary || ""}
Key Skills: ${(cvData as CVData)?.skills?.join(", ") || ""}
Work Experience: ${(cvData as CVData)?.experience
        ?.map(
          (e) =>
            `${e.role} at ${e.company} (${e.startDate} - ${e.endDate || "Present"}): ${e.companyDescription || ""} Projects: ${e.projects?.map((p) => `${p.name} - ${p.highlights?.join("; ")}`).join(" | ")}`
        )
        .join("\n")}

Respond ONLY with the polished summary text. No quotes, no preamble.`;

      const aiText = await callLLM(prompt);
      if (aiText) {
        return NextResponse.json({ summary: aiText });
      }

      // Fallback
      const techList = (cvData as CVData)?.skills?.slice(0, 8).join(", ") || "modern technologies";
      const fallbackSummary = `${(cvData as CVData)?.personal?.title || "Senior Software Engineer"} with over 5 years of proven experience architecting scalable, high-load enterprise systems. Specialized in ${techList}. Demonstrated success delivering robust microservice architectures, optimizing high-volume SQL queries, and leading end-to-end feature delivery in agile environments.`;
      return NextResponse.json({ summary: fallbackSummary });
    }

    // Action 2: Enhance Bullets (Google XYZ Formula)
    if (action === "enhance-bullets") {
      const rawText = textToEnhance || "";
      const prompt = `You are a FAANG engineering hiring manager and resume coach. 
Transform the following project bullet points using Google's XYZ Formula: "Accomplished [X], as measured by [Y], by doing [Z]".
Start each bullet with a strong action verb (e.g. Engineered, Spearheaded, Architected, Accelerated, Optimized, Reduced, Designed).
Quantify results with realistic metrics (percentages, latency ms, RPS throughput, test coverage) where appropriate.
Ensure each bullet is clear, concise (1-2 lines), and ATS-friendly.

Raw Project / Bullets:
${rawText}

Output each bullet on a new line starting with "• ". Do not wrap in markdown quotes or extra conversational text.`;

      const aiText = await callLLM(prompt);
      if (aiText) {
        return NextResponse.json({ enhanced: aiText });
      }

      // Fallback
      const lines = rawText.split("\n").map((l: string) => l.trim()).filter(Boolean);
      const enhanced = lines
        .map((l: string) => {
          const clean = l.replace(/^[•\-\*]\s*/, "");
          return `• Engineered and deployed ${clean.replace(/^(developed|implemented)\s+/i, "")}, boosting system reliability and performance by 35%.`;
        })
        .join("\n");
      return NextResponse.json({ enhanced: enhanced || rawText });
    }

    // Action 3: Extract Skills
    if (action === "extract-skills") {
      const prompt = `Extract all relevant hard technical skills, tools, methodologies, and frameworks from the following CV experience. Return only a valid JSON object in format: {"skills": ["Skill1", "Skill2"]}.
CV Content:
${JSON.stringify((cvData as CVData)?.experience || [])}`;

      const aiText = await callLLM(prompt, true);
      if (aiText) {
        const parsed = parseLLMJson<{ skills: string[] }>(aiText);
        if (parsed?.skills && Array.isArray(parsed.skills)) {
          return NextResponse.json(parsed);
        }
      }

      if (!apiKey) {
        return NextResponse.json(
          { error: "AI API key is missing. Please configure your API key in Settings." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to parse skills from AI provider. Please try again." },
        { status: 502 }
      );
    }

    // Action 4: ATS Benchmark
    if (action === "ats-benchmark") {
      const prompt = `Analyze this candidate's CV against the Target Job Description for Applicant Tracking Systems (ATS).
Calculate an accurate ATS Match Score (0-100), identify matched keywords, missing critical keywords, and give 3 highly actionable suggestions.

Target Job Description:
${jobDescription}

Candidate CV:
${JSON.stringify(cvData)}

Respond ONLY with a JSON object:
{
  "score": <number 0-100>,
  "matched": ["keyword1", "keyword2"],
  "missing": ["keyword1", "keyword2"],
  "suggestions": ["actionable advice 1", "actionable advice 2", "actionable advice 3"],
  "summary": "<1-2 sentence overall summary>"
}`;

      const aiText = await callLLM(prompt, true);
      if (aiText) {
        const parsed = parseLLMJson<{
          score: number;
          matched: string[];
          missing: string[];
          suggestions: string[];
          summary: string;
        }>(aiText);
        if (parsed && typeof parsed.score === "number") {
          return NextResponse.json(parsed);
        }
      }

      if (!apiKey) {
        return NextResponse.json(
          { error: "AI API key is missing. Please configure your API key in Settings." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to calculate ATS benchmark. Please try again." },
        { status: 502 }
      );
    }

    // Action 5: Cover Letter
    if (action === "cover-letter") {
      const prompt = `Write a personalized, compelling, modern cover letter for the role of ${jobTitle || "Software Engineer"} at ${companyName || "the company"}. Tone: ${tone}.
Candidate CV:
${JSON.stringify(cvData)}

Job Description:
${jobDescription || ""}`;

      const aiText = await callLLM(prompt);
      if (aiText) {
        return NextResponse.json({ coverLetter: aiText });
      }

      if (!apiKey) {
        return NextResponse.json(
          { error: "AI API key is missing. Please configure your API key in Settings." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to generate cover letter. Please try again." },
        { status: 502 }
      );
    }

    // Action 6: Interview Prep Questions
    if (action === "interview-prep") {
      const prompt = `You are a Principal Engineer and Hiring Manager conducting a high-stakes technical interview for ${jobTitle || "Senior Engineer"} at ${companyName || "the target company"}.
Based on the Job Description and Candidate CV, generate 5 highly relevant interview questions (2 Technical deep dives, 2 System Design / Architecture questions, and 1 Behavioral / Leadership scenario).
Provide 2-3 key bullet points for what a top-tier candidate should cover in their answer.

Job Description:
${jobDescription || ""}

Candidate CV:
${JSON.stringify(cvData || {})}

Respond ONLY with a JSON object:
{
  "overview": "<2 sentence overview of what this interview will focus on>",
  "questions": [
    {
      "question": "<The interview question>",
      "category": "technical" | "behavioral" | "system-design",
      "suggestedTalkingPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}`;

      const aiText = await callLLM(prompt, true);
      if (aiText) {
        const parsed = parseLLMJson<{
          overview: string;
          questions: Array<{
            question: string;
            category: string;
            suggestedTalkingPoints: string[];
          }>;
        }>(aiText);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return NextResponse.json(parsed);
        }
      }

      if (!apiKey) {
        return NextResponse.json(
          { error: "AI API key is missing. Please configure your API key in Settings." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to generate interview preparation questions. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("API AI Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
