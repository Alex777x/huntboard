
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
  Users2,
  Zap,
  FileText,
  Globe,
  Inbox
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { Application } from "@/types/database";

export default function SeekerDashboardPage() {
  const { t, fmt } = useI18n();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    activeApplications: 0,
    interviewRate: 0,
    offersReceived: 0,
    tokens: 0,
    stages: {
      wishlist: 0,
      applied: 0,
      phone_screen: 0,
      interview: 0,
      offer: 0
    },
    upcomingInterview: null as Application | null,
    pendingInvite: null as any
  });

  React.useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const [appsRes, tokensRes, invitesRes] = await Promise.all([
          supabase.from("applications").select("id, status, next_interview_at, job_title, company_id, created_at").eq("profile_id", user.id),
          supabase.from("ai_token_balance").select("tokens_remaining").eq("profile_id", user.id).single(),
          supabase.from("invites").select("*, recruiter_job_id(*)").eq("receiver_id", user.id).eq("status", "pending").limit(1)
        ]);

        const apps: Application[] = appsRes.data || [];
        const activeApps = apps.filter(a => !['rejected', 'withdrawn', 'no_response'].includes(a.status));
        const offers = apps.filter(a => a.status === 'offer');
        
        const stages = { wishlist: 0, applied: 0, phone_screen: 0, interview: 0, offer: 0 };
        apps.forEach(a => {
          if (stages[a.status as keyof typeof stages] !== undefined) {
            stages[a.status as keyof typeof stages]++;
          }
        });

        const totalApplied = stages.applied + stages.phone_screen + stages.interview + stages.offer;
        const totalInterviews = stages.interview + stages.offer;
        const interviewRate = totalApplied > 0 ? (totalInterviews / totalApplied) * 100 : 0;

        const interviews = apps.filter(a => a.status === 'interview');

        setStats({
          activeApplications: activeApps.length,
          interviewRate: interviewRate,
          offersReceived: offers.length,
          tokens: tokensRes.data?.tokens_remaining || 0,
          stages,
          upcomingInterview: interviews.length > 0 ? interviews[0] : null,
          pendingInvite: invitesRes.data?.[0] || null
        });
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const totalFunnel = Object.values(stats.stages).reduce((a, b) => a + b, 0);

  const funnelStages = [
    { stage: t.applications.stages.wishlist, count: stats.stages.wishlist, percentage: totalFunnel ? (stats.stages.wishlist / totalFunnel * 100) : 0, color: "bg-slate-500 dark:bg-slate-600" },
    { stage: t.applications.stages.applied, count: stats.stages.applied, percentage: totalFunnel ? (stats.stages.applied / totalFunnel * 100) : 0, color: "bg-indigo-600" },
    { stage: t.applications.stages.phone_screen, count: stats.stages.phone_screen, percentage: totalFunnel ? (stats.stages.phone_screen / totalFunnel * 100) : 0, color: "bg-purple-600" },
    { stage: t.applications.stages.interview, count: stats.stages.interview, percentage: totalFunnel ? (stats.stages.interview / totalFunnel * 100) : 0, color: "bg-blue-500" },
    { stage: t.applications.stages.offer, count: stats.stages.offer, percentage: totalFunnel ? (stats.stages.offer / totalFunnel * 100) : 0, color: "bg-emerald-500" },
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
              {!loading && (
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  • {stats.tokens} {t.dashboard.tokensAvailable || "Tokens available"}
                </span>
              )}
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
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.dashboard.welcome} 👋
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

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">{t.dashboard.activeApplications}</span>
            <Briefcase className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? "-" : stats.activeApplications}
          </div>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">{t.dashboard.interviewRate}</span>
            <Calendar className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-300">
            {loading ? "-" : fmt.formatPercent(stats.interviewRate, 1)}
          </div>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">{t.dashboard.offersReceived}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {loading ? "-" : stats.offersReceived}
          </div>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">{t.dashboard.aiTokens}</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? "-" : stats.tokens}
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-300">
            <Link href="/settings" className="hover:underline font-medium">
              Manage Keys →
            </Link>
          </div>
        </Card>
      </div>

      {/* Analytics & Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  {t.dashboard.funnelTitle}
                </h3>
              </div>
            </div>

            {!loading && totalFunnel === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Inbox className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No applications yet</h4>
                  <p className="text-xs text-slate-500 max-w-[250px] mx-auto mt-1">Add jobs to your Kanban board to see your hiring funnel analytics here.</p>
                </div>
                <Link href="/applications">
                  <Button variant="outline" size="sm" className="mt-2 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900">Go to Applications</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5 pt-2">
                {funnelStages.map((f) => (
                  <div key={f.stage} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                        {f.stage}
                      </span>
                      <span className="text-slate-900 dark:text-slate-200">
                        {f.count} applications
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                      <div
                        className={"h-full rounded-full transition-all duration-500 " + f.color}
                        style={{ width: f.percentage + "%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                      {t.dashboard.kanbanCardTitle || "Applications"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.dashboard.kanbanCardSubtitle || "Manage pipeline"}
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
                      {t.dashboard.cvCardTitle || "CV Editor"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.dashboard.cvCardSubtitle || "AI ATS Optimize"}
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
                      {t.dashboard.communityCardTitle || "Community"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.dashboard.communityCardSubtitle || "Referrals & Posts"}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          {!loading && stats.upcomingInterview && (
            <Card className="border-purple-500/30 bg-gradient-to-b from-purple-50 to-slate-50 dark:from-purple-950/30 dark:to-slate-900/80 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  {t.dashboard.upcomingInterview || "Upcoming Interview"}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{stats.upcomingInterview.job_title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Interview Scheduled
                </p>
              </div>
            </Card>
          )}

          {!loading && stats.pendingInvite && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5 text-indigo-500" />
                  {t.dashboard.recruiterInvite || "Recruiter Invite"}
                </span>
                <Badge variant="success" className="text-[10px]">
                  {t.common.badgeNew}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{stats.pendingInvite.recruiter_job_id?.company_name || "Company"}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {stats.pendingInvite.recruiter_job_id?.title || "Job Invite"}
                </p>
              </div>
              <Link href="/invites">
                <Button variant="outline" size="sm" className="w-full text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <span>{t.dashboard.reviewInvite || "Review"} →</span>
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
