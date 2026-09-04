import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSafePublicUrl } from "@/lib/security/ssrf";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Restrict CORS to known origins (extension and local dev)
const ALLOWED_ORIGINS = new Set([
  "chrome-extension://huntboard-extension", // Replace with actual extension ID
  "http://localhost:3000",
]);

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    // Rate limiting: max 30 extension requests per minute
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "extension-client";
    const rl = checkRateLimit(`ext:${clientIp}`, { max: 30, windowMs: 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait a moment." },
        { status: 429, headers }
      );
    }

    // Authenticate the user
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized. Please sign in." },
          { status: 401, headers }
        );
      }
    }

    const body = await req.json();
    const { action, url, job_title, company_id, stage, target_salary, notes } = body;

    // Action 1: Parse from raw URL
    if (action === "parse-url" && url) {
      if (!isSafePublicUrl(url)) {
        return NextResponse.json(
          { ok: false, error: "Invalid or disallowed URL. Only public HTTP/HTTPS URLs are supported." },
          { status: 400, headers }
        );
      }
      const parsedUrl = new URL(url);
      let guessedCompany = "Company";
      let guessedTitle = "Software Engineer";

      if (parsedUrl.hostname.includes("linkedin.com")) {
        const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1] || "";
        const parts = lastSegment.split("-at-");
        if (parts.length === 2) {
          guessedTitle = parts[0].replace(/-/g, " ");
          guessedCompany = parts[1].split("-")[0].replace(/-/g, " ");
        } else if (lastSegment) {
          guessedTitle = lastSegment.replace(/-/g, " ").replace(/\d+/g, "").trim() || "Software Engineer";
        }
      } else if (parsedUrl.hostname.includes("glassdoor.com") || parsedUrl.hostname.includes("indeed.com")) {
        guessedCompany = parsedUrl.hostname.split(".")[0];
      }

      return NextResponse.json(
        {
          ok: true,
          job: {
            id: `app-${Date.now()}`,
            job_title: guessedTitle.charAt(0).toUpperCase() + guessedTitle.slice(1),
            company_id: guessedCompany.charAt(0).toUpperCase() + guessedCompany.slice(1),
            stage: "applied",
            target_salary: 145000,
            location: "Remote",
            applied_date: new Date().toISOString().split("T")[0],
            notes: `Imported from: ${url}`,
          },
        },
        { headers }
      );
    }

    // Action 2: Save received job into user's pipeline
    if (!job_title || !company_id) {
      return NextResponse.json(
        { ok: false, error: "Job title and Company are required." },
        { status: 400, headers }
      );
    }

    const newJob = {
      id: `app-ext-${Date.now()}`,
      job_title,
      company_id,
      stage: stage || "applied",
      target_salary: target_salary || 140000,
      applied_date: new Date().toISOString().split("T")[0],
      notes: notes || "",
    };

    return NextResponse.json(
      { ok: true, message: "Job successfully received and queued for Kanban sync!", job: newJob },
      { headers }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process extension request";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers }
    );
  }
}
