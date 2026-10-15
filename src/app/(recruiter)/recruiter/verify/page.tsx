"use client";

import * as React from "react";
import {
  ShieldCheck,
  Building,
  Mail,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/providers/I18nProvider";
import { createClient } from "@/lib/supabase/client";

export default function RecruiterVerificationPage() {
  const { t } = useI18n();
  const [step, setStep] = React.useState<"input" | "code" | "verified">("input");
  const [companyName, setCompanyName] = React.useState("");
  const [workEmail, setWorkEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_verified_recruiter, company_name, company_email")
            .eq("id", user.id)
            .single();

          if (profile) {
            setCompanyName(profile.company_name || "");
            setWorkEmail(profile.company_email || "");
            if (profile.is_verified_recruiter) {
              setStep("verified");
            }
          }
        }
      } catch (err) {
        console.error("Error loading recruiter profile:", err);
      }
    };
    loadProfile();
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workEmail.includes("@")) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/recruiter/verify/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyName.trim(), workEmail: workEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to send verification code");
        return;
      }
      setStep("code");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send verification code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/recruiter/verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Invalid or expired verification code");
        return;
      }
      setStep("verified");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailDomain = workEmail.includes("@") ? workEmail.split("@")[1] : "company.com";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          {t.recruiter.verifyTitle}
          {step === "verified" ? (
            <Badge variant="success" className="text-xs gap-1">
              <ShieldCheck className="h-3 w-3" />
              {t.recruiter.verificationStatusActive}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs gap-1 text-amber-500 border-amber-500/40">
              {t.recruiter.pendingStatus}
            </Badge>
          )}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.recruiter.verificationDesc}
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/40 p-4 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center justify-between gap-3 animate-in fade-in-0 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === "verified" && (
        <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-gradient-to-b dark:from-emerald-950/20 dark:to-slate-900/60 p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.recruiter.verifiedEmployer}: {companyName || "Employer"}
                </h3>
                <Badge variant="success" className="text-[10px]">
                  Domain @{emailDomain}
                </Badge>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                {t.recruiter.domainVerified}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t.recruiter.verifiedEmail}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{workEmail}</span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t.recruiter.communityBadge}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t.recruiter.activeOnAllPosts}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep("input")}
            className="text-xs border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900"
          >
            {t.recruiter.reverifyDomain}
          </Button>
        </Card>
      )}

      {step === "input" && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-5 shadow-sm">
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                {t.recruiter.companyLegalName}
              </label>
              <Input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe, Inc."
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                {t.recruiter.workEmailLabel}
              </label>
              <Input
                type="email"
                required
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="name@company.com"
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-purple-600/25"
            >
              <span>{t.recruiter.sendVerificationCode}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>
        </Card>
      )}

      {step === "code" && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-5 shadow-sm">
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.recruiter.enter6DigitCode}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                We sent a confirmation code to <strong className="text-slate-900 dark:text-white">{workEmail}</strong>.
              </p>
            </div>

            <Input
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-center tracking-widest text-lg font-mono"
            />

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{t.recruiter.confirmGrantBadge}</span>
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
