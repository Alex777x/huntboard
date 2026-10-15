import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSafePublicUrl } from "@/lib/security/ssrf";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Restrict CORS to known origins (extension and local dev)
const extensionId = process.env.CHROME_EXTENSION_ID;
const ALLOWED_ORIGINS = new Set([
  ...(extensionId ? [`chrome-extension://${extensionId}`] : []),
  "chrome-extension://huntboard-extension",
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

    // Authenticate the user if Supabase is active
    let currentUser: { id: string } | null = null;
    let supabaseClient = null;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      supabaseClient = await createClient();
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized. Please sign in." },
          { status: 401, headers }
        );
      }
      currentUser = user;
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
            job_url: url,
            status: "applied",
            source: parsedUrl.hostname.includes("linkedin.com")
              ? "linkedin"
              : parsedUrl.hostname.includes("indeed.com")
              ? "indeed"
              : parsedUrl.hostname.includes("glassdoor.com")
              ? "glassdoor"
              : "company_website",
            work_format: "remote",
            job_location: "Remote",
            salary_min: null,
            salary_max: null,
            salary_currency: "USD",
            applied_at: new Date().toISOString().split("T")[0],
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

    const appPayload = {
      job_title,
      company_name: company_id,
      company_id: null,
      status: stage || "applied",
      work_format: "remote",
      job_location: "Remote",
      salary_min: target_salary ? Number(target_salary) : null,
      salary_max: null,
      salary_currency: "USD",
      applied_at: new Date().toISOString().split("T")[0],
      notes: notes || "",
    };

    if (supabaseClient && currentUser) {
      const { data: inserted, error: insertError } = await supabaseClient
        .from("applications")
        .insert({
          ...appPayload,
          profile_id: currentUser.id,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { ok: false, error: insertError.message },
          { status: 500, headers }
        );
      }

      return NextResponse.json(
        { ok: true, message: "Job successfully saved to your applications pipeline!", job: inserted },
        { headers }
      );
    }

    // Fallback for offline dev
    const newJob = {
      id: `app-ext-${Date.now()}`,
      ...appPayload,
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
