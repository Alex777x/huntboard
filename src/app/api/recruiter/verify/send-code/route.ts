import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, isCorporateEmail } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`verify-send:${user.id}`, {
      max: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many verification code requests. Please wait 15 minutes." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }

    const body = await req.json();
    const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
    const workEmail = typeof body.workEmail === "string" ? body.workEmail.trim() : "";

    if (!companyName || companyName.length < 2 || !isCorporateEmail(workEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid company name and corporate work email (no free personal email domains)." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("request_recruiter_verification", {
      p_company_name: companyName,
      p_work_email: workEmail,
    });

    if (error || !data?.success) {
      return NextResponse.json(
        { error: data?.error || error?.message || "Failed to generate verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to corporate email",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
