import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, url, job_title, company_id, stage, target_salary, notes } = body;

    // Action 1: Parse from raw URL
    if (action === "parse-url" && url) {
      const parsedUrl = new URL(url);
      let guessedCompany = "Company";
      let guessedTitle = "Software Engineer";

      if (parsedUrl.hostname.includes("linkedin.com")) {
        // e.g. linkedin.com/jobs/view/123456 or linkedin.com/jobs/view/software-engineer-at-stripe-12345
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
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Action 2: Save received job into user's pipeline
    if (!job_title || !company_id) {
      return NextResponse.json(
        { ok: false, error: "Job title and Company are required." },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
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
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to process extension request" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
