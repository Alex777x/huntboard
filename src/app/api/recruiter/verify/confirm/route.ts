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
    const { code } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    // Call stored procedure
    const { data, error } = await supabase.rpc("confirm_recruiter_verification", {
      p_code: code.trim(),
    });

    if (!error && data?.success) {
      return NextResponse.json({ success: true, companyName: data.company_name });
    }

    if (error) {
      // Fallback query if RPC not yet run in active environment
      const { data: verif, error: selectErr } = await supabase
        .from("recruiter_verifications")
        .select("*")
        .eq("profile_id", user.id)
        .eq("code", code.trim())
        .is("verified_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (selectErr || !verif) {
        return NextResponse.json(
          { error: "Invalid or expired verification code" },
          { status: 400 }
        );
      }

      await supabase
        .from("recruiter_verifications")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", verif.id);

      await supabase
        .from("profiles")
        .update({
          is_verified_recruiter: true,
          verified: true,
          company_name: verif.company_name,
          company_email: verif.work_email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return NextResponse.json({ success: true, companyName: verif.company_name });
    }

    return NextResponse.json(
      { error: data?.error || "Invalid verification code" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
