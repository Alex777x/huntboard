"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Star,
  Users2,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Building2,
  Zap,
  ArrowRight,
  FileText,
  Globe,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/I18nProvider";

export default function SeekerDashboardPage() {
  const { t, locale, fmt } = useI18n();

  const funnelStages = [
    { stage: t.applications.stages.wishlist, count: 24, percentage: "100%", color: "bg-slate-500 dark:bg-slate-600" },
    { stage: t.applications.stages.applied, count: 16, percentage: "66.7%", color: "bg-indigo-600" },
    { stage: t.applications.stages.phone_screen, count: 8, percentage: "33.3%", color: "bg-purple-600" },
    { stage: t.applications.stages.interview, count: 4, percentage: "16.7%", color: "bg-blue-500" },
    { stage: t.applications.stages.offer, count: 1, percentage: "4.2%", color: "bg-emerald-500" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 🌟 Prominent AI Job Search Assistant Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-50 via-purple-50 to-slate-50 dark:from-indigo-950/70 dark:via-purple-950/40 dark:to-slate-900/90 p-6 md:p-8 shadow-xl shadow-indigo-500/5 transition-all">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="text-xs gap-1.5 px-2.5 py-0.5 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span>{t.dashboard.heroBadge}</span>
              </Badge>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                • 150 {t.dashboard.tokensAvailable}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.dashboard.heroTitle}
            </h2>

            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.dashboard.heroDesc}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/cv">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>{t.dashboard.heroBtn1}</span>
                </Button>
              </Link>

              <Link href="/calendar">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{t.dashboard.heroBtn2}</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center rounded-xl border border-indigo-500/20 bg-white/80 dark:bg-slate-950/80 p-5 text-center shrink-0 w-48 backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              {t.dashboard.matchAccuracy}
            </span>
            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{fmt.formatPercent(94, 0)}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              {t.dashboard.topTierProfile}
            </span>
          </div>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.dashboard.welcome}, Anatoli! 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/applications">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Briefcase className="h-4 w-4" />
              <span>{t.applications.kanbanView}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards (4 Columns on wide screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">{t.dashboard.activeApplications}</span>
            <Briefcase className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">16</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{t.dashboard.newThisWeek}</span>
          </div>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">{t.dashboard.interviewRate}</span>
            <Calendar className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-300">{fmt.formatPercent(25, 1)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t.dashboard.avgBenchmark}
          </div>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">{t.dashboard.offersReceived}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">1</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Linear (Product Engineer)
          </div>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">{t.dashboard.aiTokens}</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">150</div>
          <div className="text-xs text-indigo-600 dark:text-indigo-300">
            <Link href="/settings" className="hover:underline font-medium">
              Manage Keys →
            </Link>
          </div>
        </Card>
      </div>

      {/* Hiring Funnel Analytics & Pipeline Grid (12 Columns: 7 + 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Conversion Funnel Visualizer + Quick Actions */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  {t.dashboard.funnelTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track candidate conversion and drop-off rates across stages
                </p>
              </div>
              <Badge variant="purple" className="text-[10px]">
                Live Metrics
              </Badge>
            </div>

            <div className="space-y-3.5 pt-2">
              {funnelStages.map((f) => (
                <div key={f.stage} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                      {f.stage}
                    </span>
                    <span className="text-slate-900 dark:text-slate-200">
                      {f.count} applications ({f.percentage})
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                    <div
                      className={`h-full rounded-full ${f.color} transition-all duration-500`}
                      style={{ width: f.percentage }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <span>💡 <strong>AI Tip:</strong> Adding quantifiable impact metrics to your resume boosts interview screen conversion by +22%.</span>
              <Link href="/cv" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-0.5">
                <span>Run ATS Benchmark</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/applications" className="group">
              <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {t.dashboard.kanbanCardTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.dashboard.kanbanCardSubtitle}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/cv" className="group">
              <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-purple-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {t.dashboard.cvCardTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.dashboard.cvCardSubtitle}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/community" className="group">
              <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {t.dashboard.communityCardTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.dashboard.communityCardSubtitle}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right 5 Columns: Urgent Reminders & Invitations & AI Insights */}
        <div className="lg:col-span-5 space-y-4">
          {/* Urgent Interview Alert */}
          <Card className="border-purple-500/30 bg-gradient-to-b from-purple-50 to-slate-50 dark:from-purple-950/30 dark:to-slate-900/80 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                {t.dashboard.upcomingInterview}
              </span>
              <Badge variant="purple" className="text-[10px]">
                {t.dashboard.tomorrow}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Stripe — System Design</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Tomorrow at 16:00 (CET) with Jessica Miller & David Chen
              </p>
            </div>
            <Link href="/calendar">
              <Button
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1"
              >
                <span>{t.dashboard.viewCalendar}</span>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </Card>

          {/* Pending Recruiter Invite */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users2 className="h-3.5 w-3.5 text-indigo-500" />
                {t.dashboard.recruiterInvite}
              </span>
              <Badge variant="success" className="text-[10px]">
                {t.common.badgeNew}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Stripe Recruiting</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Invited you for Senior Fullstack Engineer ({fmt.formatSalaryCompact(150000, 185000)})
              </p>
            </div>
            <Link href="/invites">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500/40 bg-slate-50 dark:bg-slate-950"
              >
                <span>{t.dashboard.reviewInvite} →</span>
              </Button>
            </Link>
          </Card>

          {/* AI Strategy Copilot Card */}
          <Card className="border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                {t.dashboard.aiCopilotTitle}
              </span>
              <Badge variant="purple" className="text-[10px]">{t.dashboard.highImpact}</Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your conversion from <strong>Phone Screen</strong> to <strong>Technical Interview</strong> is 50%. Practicing System Design mock interviews can increase this to over 70%.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{t.dashboard.aiTipBasedOn}</span>
              <Link href="/calendar" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                {t.dashboard.aiTipSchedulePrep}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
