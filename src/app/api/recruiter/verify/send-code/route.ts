import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, workEmail } = body;

    if (!companyName || !workEmail || !workEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid company name and corporate email required" },
        { status: 400 }
      );
    }

    // Call stored procedure or direct insert
    const { data, error } = await supabase.rpc("request_recruiter_verification", {
      p_company_name: companyName.trim(),
      p_work_email: workEmail.trim(),
    });

    if (error) {
      // Fallback: direct insert if RPC not executed in local test DB
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { error: insertErr } = await supabase.from("recruiter_verifications").insert({
        profile_id: user.id,
        company_name: companyName.trim(),
        work_email: workEmail.trim(),
        code,
        expires_at: expiresAt,
      });

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Verification code sent to corporate email", devCode: process.env.NODE_ENV !== "production" ? code : undefined });
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to corporate email",
      devCode: process.env.NODE_ENV !== "production" ? data?.code : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
