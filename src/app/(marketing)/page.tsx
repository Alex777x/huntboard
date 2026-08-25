import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Kanban,
  FileCheck2,
  Users2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 md:px-12 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md shadow-indigo-500/20">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            HuntBoard
          </span>
          <Badge variant="purple" className="text-[10px] py-0 px-2">
            AI-First
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              Live Demo
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25">
              Launch App <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6 md:px-12">
        <div className="mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Modern Job Search Hub with In-Platform AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Take full control of your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              career journey.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            Organize every application on interactive Kanban boards, test and score your CV with tailored ATS AI models, track interview timelines, and connect directly with verified recruiters.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white shadow-xl shadow-indigo-500/25 px-8 text-base">
                Get Started Free <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/community">
              <Button size="lg" variant="outline" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200">
                Browse Community Board
              </Button>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-16 text-left">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
                <Kanban className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Visual Kanban Board</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Drag-and-drop status management with timelines and deadline alerts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">ATS Score & AI Tuning</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Check CV keyword match against real vacancy descriptions with BYO AI keys.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 mb-4">
                <Users2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Two-Sided Network</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Receive direct job invites from verified recruiters without public profile exposure.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Funnel & Analytics</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Monitor response rates, conversion timelines, and source effectiveness.
              </p>
            </div>
          </div>
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-transparent blur-3xl -z-10 pointer-events-none" />
      </section>
    </div>
  );
}
