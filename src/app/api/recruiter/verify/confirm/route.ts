import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`verify-confirm:${user.id}`, {
      max: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait 15 minutes." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }

    const body = await req.json();
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "A valid 6-digit verification code is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("confirm_recruiter_verification", {
      p_code: code,
    });

    if (error || !data?.success) {
      return NextResponse.json(
        { error: data?.error || error?.message || "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      companyName: data.company_name,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
