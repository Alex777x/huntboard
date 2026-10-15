"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowRight,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/I18nProvider";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const isDev =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEV_PREVIEW === "true";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
          setAuthError(error.message);
          setLoading(false);
          return;
        }
        return;
      }
      if (isDev) {
        window.location.href = "/dashboard";
        return;
      }
      setAuthError("Authentication service is not configured.");
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Failed to initiate login");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = (role: "seeker" | "recruiter" | "admin") => {
    setLoading(true);
    if (role === "admin") {
      window.location.href = "/admin/users";
    } else if (role === "recruiter") {
      window.location.href = "/recruiter/jobs";
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/30">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              HuntBoard
            </span>
          </Link>
          <p className="text-xs text-slate-400">
            {t.auth.login}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl space-y-5">
          {authError && (
            <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs gap-3 shadow-md transition-all active:scale-[0.99]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>{t.auth.login}</span>
            </Button>
          </div>

          {/* Instant Role Preview buttons (dev only) */}
          {isDev && (
            <div className="space-y-2 pt-1">
              <div className="relative flex items-center justify-center">
                <span className="w-full border-t border-slate-800" />
                <span className="bg-slate-900 px-3 text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                  Dev Mode Preview
                </span>
                <span className="w-full border-t border-slate-800" />
              </div>

              <Button
                onClick={() => handleGuestLogin("seeker")}
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs border-slate-800 text-slate-200 hover:border-indigo-500/40 bg-slate-950/60"
              >
                <span>{t.auth.seekerRole}</span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
              </Button>

              <Button
                onClick={() => handleGuestLogin("recruiter")}
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs border-slate-800 text-slate-200 hover:border-emerald-500/40 bg-slate-950/60"
              >
                <span>{t.auth.recruiterRole}</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
              </Button>

              <Button
                onClick={() => handleGuestLogin("admin")}
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs border-slate-800 text-slate-200 hover:border-purple-500/40 bg-slate-950/60"
              >
                <span>{t.nav.adminMode}</span>
                <Lock className="h-3.5 w-3.5 text-purple-400" />
              </Button>
            </div>
          )}

          {/* Footer note */}
          <p className="text-[11px] text-center text-slate-500">
            <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
              {t.auth.register}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
