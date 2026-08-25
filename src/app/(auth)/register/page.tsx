"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = React.useState<"seeker" | "recruiter">("seeker");

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="w-full max-w-xl space-y-6">
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
          <h2 className="text-lg font-bold text-white">
            Choose your account type
          </h2>
          <p className="text-xs text-slate-400">
            Select how you plan to use HuntBoard to customize your workspace
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Seeker Option */}
          <div
            onClick={() => setSelectedRole("seeker")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all space-y-3 ${
              selectedRole === "seeker"
                ? "border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/10"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Briefcase className="h-5 w-5" />
              </div>
              {selectedRole === "seeker" && (
                <CheckCircle2 className="h-5 w-5 text-indigo-400" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Job Seeker</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Track job applications, optimize CV with AI ATS benchmarking, and receive private interview invites.
              </p>
            </div>

            <div className="pt-2 text-[11px] text-indigo-300 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>50 Free AI Tokens included</span>
            </div>
          </div>

          {/* Recruiter Option */}
          <div
            onClick={() => setSelectedRole("recruiter")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all space-y-3 ${
              selectedRole === "recruiter"
                ? "border-purple-500 bg-purple-950/30 ring-1 ring-purple-500 shadow-lg shadow-purple-500/10"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Building className="h-5 w-5" />
              </div>
              {selectedRole === "recruiter" && (
                <CheckCircle2 className="h-5 w-5 text-purple-400" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Recruiter / Employer</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Publish vacancies on the Community Board, search opt-in talent, and manage candidate pipelines.
              </p>
            </div>

            <div className="pt-2 text-[11px] text-purple-300 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Company domain verification</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Card className="border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <Button
            onClick={handleContinue}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs gap-2 shadow-lg shadow-indigo-600/20"
          >
            <span>Continue with Google as {selectedRole === "seeker" ? "Job Seeker" : "Recruiter"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-[11px] text-center text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
