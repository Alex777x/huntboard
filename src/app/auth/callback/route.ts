import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Allowed deployment hosts — add your production domains here
const ALLOWED_HOSTS = new Set([
  "huntboard.vercel.app",
  "www.huntboard.com",
  "huntboard.com",
]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  // Prevent open redirect: only allow relative paths, block protocol-relative URLs and backslash tricks
  const isSafeRelativePath = (path: string): boolean =>
    path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
  const next = isSafeRelativePath(nextParam) ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const role = searchParams.get("role");
      if (role === "recruiter" || role === "seeker") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if profile exists to prevent demoting existing role (e.g. admin)
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          const finalRole = existingProfile?.role || role;

          await supabase.from("profiles").upsert(
            {
              id: user.id,
              role: finalRole,
              email: user.email || null,
              full_name: user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // In development, trust origin directly
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost && ALLOWED_HOSTS.has(forwardedHost)) {
        // Only redirect to known, trusted hosts
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        // Fallback to request origin (ignores untrusted x-forwarded-host)
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
