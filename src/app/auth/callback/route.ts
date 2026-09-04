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
  // Prevent open redirect: only allow relative paths, block protocol-relative URLs
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
