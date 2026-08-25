"use client";

import * as React from "react";
import {
  ShieldCheck,
  Building,
  Mail,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function RecruiterVerificationPage() {
  const [step, setStep] = React.useState<"input" | "code" | "verified">("verified");
  const [companyName, setCompanyName] = React.useState("Stripe");
  const [workEmail, setWorkEmail] = React.useState("jessica.miller@stripe.com");
  const [code, setCode] = React.useState("");

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workEmail.includes("@")) return;
    setStep("code");
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("verified");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          Company & Recruiter Verification
          <Badge variant="success" className="text-xs gap-1">
            <ShieldCheck className="h-3 w-3" />
            Verified Status Active
          </Badge>
        </h1>
        <p className="text-xs text-slate-400">
          Verify your corporate email domain to unlock verified employer badges, public community job postings, and talent search
        </p>
      </div>

      {step === "verified" && (
        <Card className="border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-900/60 p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Verified Employer: {companyName}
                </h3>
                <Badge variant="success" className="text-[10px]">
                  Domain @stripe.com
                </Badge>
              </div>
              <p className="text-xs text-emerald-300/90 leading-relaxed">
                Your account is fully verified. Candidates see your &quot;Verified Recruiter&quot; badge on invitations and jobs posted to the Community Board.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Verified Email</span>
              <span className="font-semibold text-slate-200">{workEmail}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Community Badge</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active on all job posts
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep("input")}
            className="text-xs border-slate-800 text-slate-400 hover:text-white"
          >
            Re-verify another domain
          </Button>
        </Card>
      )}

      {step === "input" && (
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-purple-400" />
                Company Legal Name *
              </label>
              <Input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe, Inc."
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-purple-400" />
                Work Email (Corporate Domain) *
              </label>
              <Input
                type="email"
                required
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="name@company.com (No free email providers like gmail)"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-purple-600/25"
            >
              <span>Send Verification Code</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>
        </Card>
      )}

      {step === "code" && (
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Enter 6-Digit Code</h3>
              <p className="text-xs text-slate-400">
                We sent a confirmation code to <strong className="text-white">{workEmail}</strong>.
              </p>
            </div>

            <Input
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="bg-slate-950 border-slate-800 text-center tracking-widest text-lg font-mono"
            />

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Confirm & Grant Badge</span>
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
