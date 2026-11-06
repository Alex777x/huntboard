"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Users2,
  ShieldCheck,
  Send,
  Building,
  ArrowLeftRight,
  Globe,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/I18nProvider";
import { useMobileNav } from "@/components/providers/MobileNavProvider";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "purple" | "emerald";
}

export function RecruiterSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { isOpen, close } = useMobileNav();

  const [activeJobsCount, setActiveJobsCount] = React.useState<number | null>(null);
  const [companyName, setCompanyName] = React.useState<string>("");
  const [isVerified, setIsVerified] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("company_name, is_verified_recruiter")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.company_name) setCompanyName(profile.company_name);
          setIsVerified(Boolean(profile.is_verified_recruiter));
        }

        const { count } = await supabase
          .from("recruiter_jobs")
          .select("id", { count: "exact", head: true })
          .eq("recruiter_id", user.id)
          .eq("status", "active");

        if (typeof count === "number") {
          setActiveJobsCount(count);
        }
      } catch (e) {
        console.error("Failed to load recruiter sidebar data:", e);
      }
    }
    loadData();
  }, []);

  const recruiterNavItems: NavItem[] = [
    {
      title: t.recruiter.jobsTitle,
      href: "/recruiter/jobs",
      icon: Briefcase,
      badge: activeJobsCount !== null ? `${activeJobsCount} ${t.common.active}` : undefined,
      badgeVariant: "purple",
    },
    {
      title: t.recruiter.talentTitle,
      href: "/recruiter/talent",
      icon: Users2,
      badge: "Opt-in",
      badgeVariant: "emerald",
    },
    {
      title: t.recruiter.invitesTitle,
      href: "/recruiter/invites",
      icon: Send,
    },
    {
      title: t.nav.community,
      href: "/recruiter/community",
      icon: Globe,
    },
    {
      title: t.recruiter.verifyTitle,
      href: "/recruiter/verify",
      icon: ShieldCheck,
      badge: isVerified ? t.common.verified : t.recruiter.pendingStatus,
      badgeVariant: isVerified ? "emerald" : "secondary",
    },
  ];

  const renderContent = (isMobile = false) => (
    <>
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">HuntBoard</span>
              <Badge variant="purple" className="text-[9px] px-1 py-0 font-bold">
                RECRUITER
              </Badge>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.nav.employerPortal}</span>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t.nav.hiringPipeline}
          </div>
          <nav className="space-y-1">
            {recruiterNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/recruiter/jobs" && pathname?.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) close();
                  }}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-purple-50 dark:bg-purple-600/20 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-500/30 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "whitespace-nowrap inline-flex items-center shrink-0 rounded-full px-2 py-0.2 text-[10px] font-bold leading-none",
                        item.badgeVariant === "emerald"
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Company Card */}
        <div className="rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-gradient-to-b dark:from-purple-950/30 dark:to-slate-900/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {companyName || t.nav.employerPortal}
            </span>
            <Badge variant={isVerified ? "success" : "secondary"} className="text-[9px] gap-1 px-1.5 py-0 shrink-0">
              <ShieldCheck className="h-3 w-3" />
              {isVerified ? t.common.verified : t.recruiter.pendingStatus}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isVerified ? t.recruiter.domainVerified : t.recruiter.verificationDesc}
          </p>
        </div>
      </div>

      {/* Switch to Seeker Mode Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 space-y-2">
        <Link
          href="/dashboard"
          onClick={() => {
            if (isMobile) close();
          }}
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 bg-white dark:bg-slate-900/60"
          >
            <span className="flex items-center gap-1.5">
              <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              {t.nav.switchSeeker}
            </span>
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar (Visible on md+) */}
      <aside
        className={cn(
          "hidden md:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-slate-200 backdrop-blur-xl z-40 transition-colors duration-200",
          className
        )}
      >
        {renderContent(false)}
      </aside>

      {/* 2. Mobile Drawer & Backdrop (Visible when isOpen on < md) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in-0">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={close}
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <aside className="relative z-50 w-72 max-w-[85vw] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
